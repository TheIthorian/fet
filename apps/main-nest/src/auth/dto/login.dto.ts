import { IsEmail, IsString } from 'class-validator';
import type { LoginRequest } from '@fet/api-types';

export class LoginDto implements LoginRequest {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}
