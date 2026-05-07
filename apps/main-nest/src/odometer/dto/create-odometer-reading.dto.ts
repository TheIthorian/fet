import { IsDateString, IsNumber, Min } from 'class-validator';
import type { CreateOdometerReadingRequest } from '@fet/api-types';

export class CreateOdometerReadingDto implements CreateOdometerReadingRequest {
    @IsNumber()
    @Min(0)
    value: number;

    @IsDateString()
    readingDate: string;
}
