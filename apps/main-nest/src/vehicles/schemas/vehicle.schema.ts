import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Vehicle {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ trim: true })
    vin?: string;

    @Prop({ required: true, uppercase: true })
    regNo: string;

    @Prop({ required: true })
    make: string;

    @Prop({ required: true })
    model: string;

    @Prop({ required: true })
    fuelType: string;
}

export type VehicleDocument = HydratedDocument<Vehicle>;
export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
VehicleSchema.index({ userId: 1, regNo: 1 }, { unique: true });
