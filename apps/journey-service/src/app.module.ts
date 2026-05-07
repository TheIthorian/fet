import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JourneyModule } from './journey/journey.module';
import { HealthController } from './health/health.controller';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            useFactory: (config: ConfigService) => ({
                uri: config.getOrThrow<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),
        HttpModule,
        JourneyModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
