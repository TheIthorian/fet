import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserConfig extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    displayName: string;

    @Prop({ default: true })
    setupRequired: boolean;

    @Prop({ default: false })
    geolocationEnabled: boolean;
}

export const UserConfigSchema = SchemaFactory.createForClass(UserConfig);
