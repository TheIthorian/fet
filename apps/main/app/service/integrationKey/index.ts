import crypto from 'node:crypto';
import Logger from '@ioc:Adonis/Core/Logger';
import UserIntegration from 'App/Models/UserIntegration';
import {
    ApiKeyService,
    GenerateApiKeyForUserInput,
    GetUserIdByIntegrationKeyInput,
    IntegrationKeyForUser,
} from './types';
import { logContext } from 'App/util/logger';
import Database from '@ioc:Adonis/Lucid/Database';

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

    public async getIntegrationKeysForUser(userId: number): Promise<IntegrationKeyForUser[]> {
        return await Database.query()
            .from('integrations')
            .select([
                'integrations.name',
                'user_integrations.api_key',
                'user_integrations.created_at',
                'user_integrations.updated_at',
            ])
            .leftJoin('user_integrations', (query) => {
                query.on('user_integrations.integration_id', '=', 'integrations.id');
                query.andOnVal('user_integrations.user_id', userId);
            })
            .orderBy('integrations.name');
    }

    public async generateApiKeyForUser({
        userId,
        integrationId,
    }: GenerateApiKeyForUserInput): Promise<UserIntegration> {
        const ctx = logContext(
            `${IntegrationApiKeyService.name}.${this.generateApiKeyForUser.name}`,
            { userId, integrationId },
            Logger
        );

        const apiKey = crypto.randomBytes(32).toString('hex').toUpperCase();

        const [existingRelation] = await UserIntegration.query()
            .select(['id'])
            .from('user_integrations')
            .where('integration_id', integrationId)
            .andWhere('user_id', userId);

        if (existingRelation) {
            Logger.info(`${ctx} existing relation exists. Replacing existing key`);
            existingRelation.apiKey = apiKey;
            await existingRelation.save();
            existingRelation;
        }

        Logger.info(`${ctx} creating new relation`);
        return await UserIntegration.create({
            userId,
            apiKey,
            integrationId,
        });
    }
}
