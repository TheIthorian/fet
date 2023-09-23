import Logger from '@ioc:Adonis/Core/Logger';
import UserIntegration from 'App/Models/UserIntegration';
import { ApiKeyService, GetUserIdByIntegrationKeyInput } from './types';
import { logContext } from 'fet-logger';

export * from './types';

export class IntegrationApiKeyService implements ApiKeyService {
    public async getUserIdByIntegrationKey({
        apiKey,
        integrationName,
    }: GetUserIdByIntegrationKeyInput): Promise<number> {
        const ctx = logContext(
            `${IntegrationApiKeyService.name}.${this.getUserIdByIntegrationKey.name}`,
            { apiKey, integrationName },
            Logger
        );

        const [userIntegration] = await UserIntegration.query()
            .select('user_id')
            .join('integrations', 'integrations.id', '=', 'user_integrations.integration_id')
            .where('integrations.name', integrationName)
            .andWhere('user_integrations.api_key', apiKey);

        const userId = userIntegration?.userId;

        Logger.info(`${ctx} user id: ${userId ?? '(undefined)'}`);

        return userId;
    }
}
