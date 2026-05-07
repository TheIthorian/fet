import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OdometerReading extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
    vehicleId: Types.ObjectId;

    @Prop({ required: true })
    value: number;

    @Prop({ required: true })
    readingDate: Date;
}

export const OdometerReadingSchema = SchemaFactory.createForClass(OdometerReading);
