import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserConfig } from './schemas/user-config.schema';
import type { UpdateUserConfigDto } from './dto/update-user-config.dto';

@Injectable()
export class UserConfigService {
    constructor(@InjectModel(UserConfig.name) private readonly model: Model<UserConfig>) {}

    findByUserId(userId: string) {
        return this.model.findOne({ userId: new Types.ObjectId(userId) });
    }

    upsert(userId: string, dto: UpdateUserConfigDto) {
        return this.model.findOneAndUpdate(
            { userId: new Types.ObjectId(userId) },
            { $set: dto },
            { new: true, upsert: true },
        );
    }
}
