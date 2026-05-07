import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IntegrationsService } from '../integrations/integrations.service';

export interface LocationPayload {
    userId: string;
    lat: number;
    lon: number;
    created_at: string;
    velocity?: number;
    distance?: number;
}

@Injectable()
export class LocationService {
    private readonly logger = new Logger(LocationService.name);

    constructor(
        private readonly integrationsService: IntegrationsService,
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {}

    async handleUpdate(integrationName: string, apiKey: string, body: Record<string, unknown>) {
        const integration = await this.integrationsService.findByApiKeyAndIntegration(
            apiKey,
            integrationName,
        );
        if (!integration) throw new UnauthorizedException('Invalid API key');

        const location = this.transformBody(integration.userId.toString(), body);

        const journeyServiceUrl = this.config.getOrThrow<string>('JOURNEY_SERVICE_URL');

        const { data } = await firstValueFrom(
            this.httpService.post(
                `${journeyServiceUrl}/api/users/${location.userId}/location`,
                location,
                {
                    headers: { 'x-api-key': this.config.getOrThrow('INTERNAL_KEY') },
                },
            ),
        ).catch((err) => {
            this.logger.error('Failed to post location to journey-service', err?.message);
            throw err;
        });

        return data;
    }

    private transformBody(userId: string, body: Record<string, unknown>): LocationPayload {
        const lat = Number(body['lat']);
        const lon = Number(body['lon']);
        const created_at = String(body['created_at'] ?? new Date().toISOString());

        if (isNaN(lat) || isNaN(lon)) {
            throw new BadRequestException('lat and lon are required numeric fields');
        }

        return {
            userId,
            lat,
            lon,
            created_at,
            velocity:
                body['velocity'] !== null && body['velocity'] !== undefined
                    ? Number(body['velocity'])
                    : undefined,
            distance:
                body['distance'] !== null && body['distance'] !== undefined
                    ? Number(body['distance'])
                    : undefined,
        };
    }
}
