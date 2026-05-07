import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { UserIntegration, UserIntegrationDocument } from './schemas/user-integration.schema';

const SUPPORTED_INTEGRATIONS = ['autopi', 'traccar', 'generic'] as const;

@Injectable()
export class IntegrationsService {
    constructor(
        @InjectModel(UserIntegration.name) private readonly model: Model<UserIntegrationDocument>,
        private readonly config: ConfigService,
    ) {}

    async findAllForUser(userId: string) {
        const integrations = await this.model.find({ userId: new Types.ObjectId(userId) });
        const proxyUrl = this.config.get('PROXY_URL', 'http://localhost:3000');

        return integrations.map((i) => ({
            name: i.integrationName,
            apiKey: i.apiKey,
            webhookUrl: `${proxyUrl}/api/location/${i.integrationName}?apiKey=${i.apiKey}`,
            createdAt: i.createdAt,
        }));
    }

    async generateApiKey(userId: string, integrationName: string) {
        if (!SUPPORTED_INTEGRATIONS.includes(integrationName as (typeof SUPPORTED_INTEGRATIONS)[number])) {
            throw new BadRequestException(`Unknown integration: ${integrationName}`);
        }

        const apiKey = randomBytes(32).toString('hex');
        const proxyUrl = this.config.get('PROXY_URL', 'http://localhost:3000');

        const integration = await this.model.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), integrationName },
            { $set: { apiKey } },
            { new: true, upsert: true },
        );

        return {
            name: integrationName,
            apiKey: integration.apiKey,
            webhookUrl: `${proxyUrl}/api/location/${integrationName}?apiKey=${apiKey}`,
            createdAt: integration.createdAt,
        };
    }

    findByApiKeyAndIntegration(apiKey: string, integrationName: string) {
        return this.model.findOne({ apiKey, integrationName });
    }
}
