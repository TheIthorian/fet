import type { RequestContract } from '@ioc:Adonis/Core/Request';
import { schema } from '@ioc:Adonis/Core/Validator';
import { LocationTransformer, TransformOutput } from './types';
import { ApiKeyService } from 'App/service/integrationKey';
import ApiKeyNotRecognisedException from 'App/Exceptions/ApiKeyNotRecognisedException';
import { logContext } from 'App/util/logger';
import Logger from '@ioc:Adonis/Core/Logger';

export class OwntracksTransformer implements LocationTransformer {
    public readonly integrationName = 'owntracks';

    constructor(private readonly apiKeyService: ApiKeyService) {}

    public async transform(request: RequestContract): Promise<TransformOutput> {
        const ctx = logContext(`${OwntracksTransformer.name}.${this.transform.name}`, {}, Logger);

        const userId = await this.apiKeyService.getUserIdByIntegrationKey({
            apiKey: this.getApiKeyFromRequest(request),
            integrationName: this.integrationName,
        });

        if (!userId) {
            Logger.warn(`${ctx} api key not recognised for ${this.integrationName}`);
            throw ApiKeyNotRecognisedException.new(this.integrationName);
        }

        console.log('request data:', request.body());

        const locationData = await request.validate({
            schema: schema.create({
                lat: schema.number(),
                lon: schema.number(),
                tst: schema.number.optional(),
                vel: schema.number.optional(),
            }),
        });

        const data = {
            userId,
            lat: locationData.lat,
            lon: locationData.lon,
            created_at: locationData.tst
                ? new Date(locationData.tst * 1000).toISOString()
                : new Date().toISOString(),
            velocity: locationData.vel,
        };

        console.log(data);

        return data;
    }

    private getApiKeyFromRequest(request: RequestContract): string {
        const { apiKey } = request.qs();
        console.log({ apiKey });
        return apiKey;
    }
}
