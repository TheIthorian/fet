import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Journey } from './schemas/journey.schema';
import type { CreateJourneyDto } from './dto/create-journey.dto';

@Injectable()
export class JourneysService {
    private readonly logger = new Logger(JourneysService.name);

    constructor(@InjectModel(Journey.name) private readonly model: Model<Journey>) {}

    findAll(userId: string) {
        return this.model.find({ userId: new Types.ObjectId(userId) }).sort({ startTime: -1 });
    }

    async create(dto: CreateJourneyDto) {
        const journey = await this.model.create({
            journeyId: dto.id,
            userId: new Types.ObjectId(dto.userId),
            startTime: new Date(dto.startTime),
            endTime: new Date(dto.endTime),
            distance: dto.distance,
            startLocation: dto.startLocation,
            lastLocation: dto.lastLocation,
            isAtPetrolStation: dto.isAtPetrolStation ?? false,
        });
        this.logger.log(`Created journey ${journey.journeyId}`);
        return journey;
    }
}
