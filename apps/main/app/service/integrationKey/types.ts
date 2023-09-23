import UserIntegration from 'App/Models/UserIntegration';

export type GetUserIdByIntegrationKeyInput = {
    apiKey: string;
    integrationName: string;
};

export type GenerateApiKeyForUserInput = {
    userId: number;
    integrationId: number;
};

type IntegrationKeyForUser = {
    name: string;
    api_key: string;
    created_at: Date;
    updated_at: Date;
};

export type GetIntegrationKeysForUserOutput = IntegrationKeyForUser[];

export interface ApiKeyService {
    getUserIdByIntegrationKey({
        apiKey,
        integrationName,
    }: GetUserIdByIntegrationKeyInput): Promise<number | undefined>;

    getIntegrationKeysForUser(userId: number): Promise<GetIntegrationKeysForUserOutput>;

    generateApiKeyForUser({
        userId,
        integrationId,
    }: GenerateApiKeyForUserInput): Promise<UserIntegration>;
}
