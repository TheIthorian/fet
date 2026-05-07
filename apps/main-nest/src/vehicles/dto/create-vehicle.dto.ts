import { IsOptional, IsString } from 'class-validator';
import type { CreateVehicleRequest } from '@fet/api-types';

export class CreateVehicleDto implements CreateVehicleRequest {
    @IsOptional()
    @IsString()
    vin?: string;

    @IsString()
    regNo: string;

    @IsString()
    make: string;

    @IsString()
    model: string;

    @IsString()
    fuelType: string;
}
