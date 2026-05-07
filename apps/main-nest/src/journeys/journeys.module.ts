import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JourneysService } from './journeys.service';
import { JourneysController } from './journeys.controller';
import { Journey, JourneySchema } from './schemas/journey.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Journey.name, schema: JourneySchema }]),
        AuthModule,
    ],
    providers: [JourneysService],
    controllers: [JourneysController],
})
export class JourneysModule {}
