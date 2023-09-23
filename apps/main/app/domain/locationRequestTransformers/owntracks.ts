import type { RequestContract } from '@ioc:Adonis/Core/Request';
import { schema } from '@ioc:Adonis/Core/Validator';
import { LocationTransformer, TransformOutput } from './types';
import { ApiKeyService } from 'App/service/integrationKey';
import ApiKeyNotRecognisedException from 'App/Exceptions/ApiKeyNotRecognisedException';
import { logContext } from 'fet-logger';
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

        const locationData = await request.validate({
            schema: schema.create({
                lat: schema.number(),
                lon: schema.number(),
            }),
        });

        return { userId, ...locationData };
    }

    private getApiKeyFromRequest(request: RequestContract): string {
        const { apiKey } = request.qs();
        return apiKey;
    }
}
