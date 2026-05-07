import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import type { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class VehiclesService {
    constructor(@InjectModel(Vehicle.name) private readonly model: Model<VehicleDocument>) {}

    findAll(userId: string) {
        return this.model.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: 1 });
    }

    async create(userId: string, dto: CreateVehicleDto) {
        const regNo = dto.regNo.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const existing = await this.model.findOne({ userId: new Types.ObjectId(userId), regNo });
        if (existing) throw new ConflictException(`Vehicle with reg ${regNo} already exists`);

        return this.model.create({ ...dto, regNo, userId: new Types.ObjectId(userId) });
    }
}
