import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class PostLocationDto {
    @IsString()
    userId: string;

    @IsNumber()
    lat: number;

    @IsNumber()
    lon: number;

    @IsDateString()
    created_at: string;

    @IsOptional()
    @IsNumber()
    velocity?: number;

    @IsOptional()
    @IsNumber()
    distance?: number;
}
