import { Body, Controller, HttpCode, Param, Post, Query } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('api/location')
export class LocationController {
    constructor(private readonly service: LocationService) {}

    @Post(':integrationName')
    @HttpCode(201)
    handleUpdate(
        @Param('integrationName') integrationName: string,
        @Query('apiKey') apiKey: string,
        @Body() body: Record<string, unknown>,
    ) {
        return this.service.handleUpdate(integrationName, apiKey, body);
    }
}
