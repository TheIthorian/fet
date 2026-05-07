import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const CoordinatesSchema = {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
};

@Schema({ timestamps: true })
export class ActiveJourney extends Document {
    @Prop({ required: true, unique: true })
    userId: string;

    @Prop({ required: true, unique: true })
    journeyId: string;

    @Prop({ enum: ['new', 'inProgress'], required: true })
    status: 'new' | 'inProgress';

    @Prop({ required: true })
    startTime: Date;

    @Prop({ type: CoordinatesSchema, required: true })
    startLocation: { lat: number; lon: number };

    @Prop({ type: CoordinatesSchema, required: true })
    lastLocation: { lat: number; lon: number };

    @Prop({ default: 0 })
    distance: number;

    @Prop()
    lastReadingDate?: Date;

    @Prop()
    lastSignificantReadingDate?: Date;
}

export const ActiveJourneySchema = SchemaFactory.createForClass(ActiveJourney);
