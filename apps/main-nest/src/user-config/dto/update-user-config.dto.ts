import { IsBoolean, IsOptional, IsString } from 'class-validator';
import type { UpdateUserConfigRequest } from '@fet/api-types';

export class UpdateUserConfigDto implements UpdateUserConfigRequest {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsBoolean()
    setupRequired?: boolean;

    @IsOptional()
    @IsBoolean()
    geolocationEnabled?: boolean;
}
