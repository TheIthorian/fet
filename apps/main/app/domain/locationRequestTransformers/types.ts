import type { RequestContract } from '@ioc:Adonis/Core/Request';

export type TransformOutput = { lat: number; lon: number; userId: number };

export interface LocationTransformer {
    readonly integrationName: string;

    /**
     * Check the request data conforms to the expected data schema and return it
     * @throws {ApiKeyNotRecognisedException}
     * @throws {SchemaValidationError}
     */
    transform(request: RequestContract): Promise<TransformOutput>;
}
