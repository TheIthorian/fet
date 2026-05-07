import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
    imports: [HttpModule, IntegrationsModule],
    providers: [LocationService],
    controllers: [LocationController],
})
export class LocationModule {}
