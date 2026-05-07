import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OdometerReading } from './schemas/odometer-reading.schema';
import type { CreateOdometerReadingDto } from './dto/create-odometer-reading.dto';

@Injectable()
export class OdometerService {
    constructor(
        @InjectModel(OdometerReading.name) private readonly model: Model<OdometerReading>,
    ) {}

    findAll(vehicleId: string) {
        return this.model
            .find({ vehicleId: new Types.ObjectId(vehicleId) })
            .sort({ readingDate: -1 });
    }

    create(userId: string, vehicleId: string, dto: CreateOdometerReadingDto) {
        return this.model.create({
            userId: new Types.ObjectId(userId),
            vehicleId: new Types.ObjectId(vehicleId),
            value: dto.value,
            readingDate: new Date(dto.readingDate),
        });
    }
}
