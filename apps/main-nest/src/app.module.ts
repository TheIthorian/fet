import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OdometerModule } from './odometer/odometer.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { LocationModule } from './location/location.module';
import { JourneysModule } from './journeys/journeys.module';
import { UserConfigModule } from './user-config/user-config.module';
import { HealthController } from './health.controller';

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
        AuthModule,
        VehiclesModule,
        OdometerModule,
        IntegrationsModule,
        LocationModule,
        JourneysModule,
        UserConfigModule,
    ],
    controllers: [HealthController],
})
export class AppModule {}
