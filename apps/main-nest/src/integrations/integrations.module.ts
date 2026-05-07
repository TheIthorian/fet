import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { UserIntegration, UserIntegrationSchema } from './schemas/user-integration.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserIntegration.name, schema: UserIntegrationSchema }]),
        AuthModule,
    ],
    providers: [IntegrationsService],
    controllers: [IntegrationsController],
    exports: [IntegrationsService],
})
export class IntegrationsModule {}
