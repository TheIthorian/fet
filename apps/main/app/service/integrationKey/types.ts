export type GetUserIdByIntegrationKeyInput = {
    apiKey: string;
    integrationName: string;
};

export interface ApiKeyService {
    getUserIdByIntegrationKey({
        apiKey,
        integrationName,
    }: GetUserIdByIntegrationKeyInput): Promise<number | undefined>;
}
