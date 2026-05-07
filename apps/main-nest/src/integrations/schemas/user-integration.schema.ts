import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserIntegration {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    integrationName: string;

    @Prop({ required: true, unique: true })
    apiKey: string;

    createdAt: Date;
    updatedAt: Date;
}

export type UserIntegrationDocument = HydratedDocument<UserIntegration>;
export const UserIntegrationSchema = SchemaFactory.createForClass(UserIntegration);
UserIntegrationSchema.index({ userId: 1, integrationName: 1 });
