import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

class CoordinatesDto {
    @IsNumber()
    lat: number;

    @IsNumber()
    lon: number;
}

export class CreateJourneyDto {
    @IsString()
    id: string;

    @IsString()
    userId: string;

    @IsDateString()
    startTime: string;

    @IsDateString()
    endTime: string;

    @IsNumber()
    distance: number;

    @IsObject()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    startLocation: CoordinatesDto;

    @IsObject()
    @ValidateNested()
    @Type(() => CoordinatesDto)
    lastLocation: CoordinatesDto;

    @IsOptional()
    @IsBoolean()
    isAtPetrolStation?: boolean;
}
