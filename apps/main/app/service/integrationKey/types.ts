import UserIntegration from 'App/Models/UserIntegration';

export type GetUserIdByIntegrationKeyInput = {
    apiKey: string;
    integrationName: string;
};

export type GenerateApiKeyForUserInput = {
    userId: number;
    integrationId: number;
};

export interface ApiKeyService {
    getUserIdByIntegrationKey({
        apiKey,
        integrationName,
    }: GetUserIdByIntegrationKeyInput): Promise<number | undefined>;

    generateApiKeyForUser({
        userId,
        integrationId,
    }: GenerateApiKeyForUserInput): Promise<UserIntegration>;
}
