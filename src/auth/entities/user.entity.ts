import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ALUMNO = 'ALUMNO',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  //Id de usuario, se genera automáticamente
  id!: number;

  //Correo electrónico del usuario, debe ser único
  @Column({ unique: true })
  email!: string;

  //Contraseña del usuario, se almacena de forma segura (hasheada)
  @Column()
  pass!: string;

  //Rol del usuario, puede ser 'ALUMNO' o 'ADMIN', por defecto es 'ALUMNO'
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.ALUMNO,
  })
  rol!: UserRole;

  //Indica si el correo electrónico del usuario ha sido verificado, por defecto es false
  @Column({ default: false })
  isEmailVerified!: boolean;

  //Token de verificación para confirmar el correo electrónico del usuario, puede ser nulo
  @Column({ type: 'varchar', nullable: true })
  verificationToken!: string | null;

  //Token para restablecer la contraseña del usuario, puede ser nulo
  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken!: string | null;

  //Fecha de expiración del token de restablecimiento de contraseña, puede ser nula
  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires!: Date | null;

  //Fecha de creación del usuario, se establece automáticamente al crear el registro
  @CreateDateColumn()
  createdAt!: Date;
}