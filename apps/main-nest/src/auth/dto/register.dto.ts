import { IsEmail, IsString, MinLength } from 'class-validator';
import type { RegisterRequest } from '@fet/api-types';

export class RegisterDto implements RegisterRequest {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}
