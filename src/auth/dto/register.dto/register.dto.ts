import {IsEmail, IsString, minLength, IsOptional, IsEnum} from 'class-validator';
import {UserRole} from '../../entities/user.entity';

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    pass!: string;   

    @IsEnum(UserRole)
    rol!: UserRole;

    @IsOptional()
    @IsString()
    adminCode?: string;

}
