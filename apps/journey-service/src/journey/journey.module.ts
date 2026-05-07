import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { JourneyService } from './journey.service';
import { JourneyController } from './journey.controller';
import { ActiveJourney, ActiveJourneySchema } from './schemas/active-journey.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ActiveJourney.name, schema: ActiveJourneySchema }]),
        HttpModule,
    ],
    providers: [JourneyService],
    controllers: [JourneyController],
})
export class JourneyModule {}
