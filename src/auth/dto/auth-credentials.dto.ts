import { IsString, MaxLength, MinLength, IsDate, IsOptional } from 'class-validator';

export class AuthCredentialsDto {
    @IsString()
    @MinLength(4, { message: 'Username is too short (4 characters min)' })
    @MaxLength(10, { message: 'Username is too long (10 characters min)' })
    username: string;

    @IsString()
    @MinLength(8, { message: 'Password is too short (8 characters min)' })
    @MaxLength(20, { message: 'Password is too long (20 characters max)' })
    password: string;

    @IsString()
    email: string;

    @IsDate()
    @IsOptional()
    lastActivity: Date;
}
