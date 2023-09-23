import UserIntegration from 'App/Models/UserIntegration';

export type GetUserIdByIntegrationKeyInput = {
    apiKey: string;
    integrationName: string;
};

export type GenerateApiKeyForUserInput = {
    userId: number;
    integrationId: number;
};

export type IntegrationKeyForUser = {
    name: string;
    api_key: string;
    created_at: Date;
    updated_at: Date;
    webhook_url?: string;
};

export interface ApiKeyService {
    getUserIdByIntegrationKey({
        apiKey,
        integrationName,
    }: GetUserIdByIntegrationKeyInput): Promise<number | undefined>;

    getIntegrationKeysForUser(userId: number): Promise<IntegrationKeyForUser[]>;

    generateApiKeyForUser({
        userId,
        integrationId,
    }: GenerateApiKeyForUserInput): Promise<UserIntegration>;
}
