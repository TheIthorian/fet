import { IntegrationApiKeyService } from 'App/service/integrationKey';
import { OwntracksTransformer } from './owntracks';
import { LocationTransformer } from './types';

const integrationApiKeyService = new IntegrationApiKeyService();

const owntracksTransformer = new OwntracksTransformer(integrationApiKeyService);

const transformersByIntegrationName: Record<string, LocationTransformer> = {
    owntracks: owntracksTransformer,
} as const;

export { transformersByIntegrationName };
