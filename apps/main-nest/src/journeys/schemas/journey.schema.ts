import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Journey extends Document {
    @Prop({ required: true, unique: true })
    journeyId: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    startTime: Date;

    @Prop({ required: true })
    endTime: Date;

    @Prop({ required: true })
    distance: number;

    @Prop({ type: { lat: Number, lon: Number }, required: true })
    startLocation: { lat: number; lon: number };

    @Prop({ type: { lat: Number, lon: Number }, required: true })
    lastLocation: { lat: number; lon: number };

    @Prop({ default: false })
    isAtPetrolStation: boolean;
}

export const JourneySchema = SchemaFactory.createForClass(Journey);
JourneySchema.index({ userId: 1, startTime: -1 });
