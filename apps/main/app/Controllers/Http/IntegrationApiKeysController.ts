import Env from '@ioc:Adonis/Core/Env';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Integration from 'App/Models/Integration';
import UnknownIntegrationException from 'App/Exceptions/UnknownIntegrationException';
import Logger from '@ioc:Adonis/Core/Logger';
import { logContext } from 'App/util/logger';
import { IntegrationApiKeyService } from 'App/service/integrationKey';

const integrationApiKeyService = new IntegrationApiKeyService();

const proxyUrl = Env.get('PROXY_URL');

export default class IntegrationApiKeysController {
    /**
     * Get all integrations with their api keys
     */
    public async index({ response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const ctx = logContext(`${IntegrationApiKeysController.name}.${this.index.name}`, {
            userId: user.id,
        });
        Logger.info(`${ctx}`);

        const apiKeys = await integrationApiKeyService.getIntegrationKeysForUser(user.id);
        for (const keyData of apiKeys) {
            keyData.webhook_url = `${proxyUrl}/api/location/${keyData.name}?apiKey=${keyData.api_key}`;
        }

        response.json(apiKeys);
    }

    public async create({ request, response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const integrationName = request.param('integration_name');

        const integration = await Integration.findBy('name', integrationName);
        if (!integration) {
            throw UnknownIntegrationException.new(integrationName);
        }

        const newRelation = await integrationApiKeyService.generateApiKeyForUser({
            userId: user.id,
            integrationId: integration.id,
        });

        response.status(201).json({
            api_key: newRelation.apiKey,
            name: integrationName,
            created_at: newRelation.createdAt,
            updated_at: newRelation.updatedAt,
            url: `${proxyUrl}/api/location/${integrationName}?apiKey=${newRelation.apiKey}`,
        });
    }
}
