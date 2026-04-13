import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto/login.dto';

import { User, UserRole } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto/register.dto';

import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email/email.service';

@Injectable()
export class AuthService {

  //Inyección de dependencias para el repositorio de usuarios, el servicio JWT y el servicio de correo electrónico
    constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  // Implementación de métodos de autenticación
  async login(loginDto: LoginDto) {
    const { email, pass } = loginDto;

    // 1. Buscar usuario
    const user = await this.userRepository.findOne({
        where: { email },
    });

    if (!user) {
        throw new UnauthorizedException('Credenciales inválidas');
    }
    
    if (!user.isEmailVerified) {
    throw new UnauthorizedException('Debes verificar tu correo');
    }

    // 2. Comparar contraseña
    const isMatch = await bcrypt.compare(pass, user.pass);

    if (!isMatch) {
        throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Crear payload
    const payload = {
        sub: user.id,
        email: user.email,
        rol: user.rol,
    };

    // 4. Generar token
    const token = this.jwtService.sign(payload);

    return {
        access_token: token,
    };
    }


  async register(registerDto: RegisterDto) {

    const { email, pass, rol, adminCode } = registerDto;
    const verificationToken = uuidv4();
    

    // 1. Verificar si ya existe el usuario
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    // 2. Validar ADMIN
    if (rol === UserRole.ADMIN) {
      if (!adminCode || adminCode !== process.env.ADMIN_SECRET) {
        throw new BadRequestException('Código de administrador inválido');
      }
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(pass, 10);

    // 4. Crear usuario
    const user = this.userRepository.create({
      email,
      pass: hashedPassword,
      rol,
      verificationToken,
      isEmailVerified: false,
    });

    // 5. Guardar en BD
    await this.userRepository.save(user);

    // 6. Enviar correo de verificación
    await this.emailService.sendVerificationEmail(email, verificationToken);


    return {
      message: 'Usuario registrado correctamente. Verifica tu correo electrónico para activar tu cuenta.',
    };
  }

     // Método para verificar el correo electrónico del usuario
    async verifyEmail(token: string) {
    const user = await this.userRepository.findOne({
        where: { verificationToken: token },
    });

    if (!user) {
        throw new BadRequestException('Token inválido');
    }

    user.isEmailVerified = true;
    user.verificationToken = null;

    await this.userRepository.save(user);

    return { message: 'Correo verificado correctamente' };
    }

    // Método para iniciar el proceso de recuperación de contraseña
    async forgotPassword(email: string) {
     const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
        throw new BadRequestException('Usuario no encontrado');
    }

    const token = uuidv4();

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    await this.userRepository.save(user);

    await this.emailService.sendResetPasswordEmail(email, token);

    return { message: 'Correo enviado para recuperación' };
    }

    // Método para restablecer la contraseña del usuario
    async resetPassword(token: string, newPassword: string) {
      if(!newPassword){
        throw new Error('La nueva contraseña es requerida');
      }
    const user = await this.userRepository.findOne({
        where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new BadRequestException('Token inválido o expirado');
    }

    console.log("nueva contraseña:", newPassword);
    user.pass = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return { message: 'Contraseña actualizada correctamente' };
    }
}