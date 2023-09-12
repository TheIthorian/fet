import { z } from 'zod';
import { Journey } from './types';

const UserParamsSchema = z.object({
    userId: z.coerce.number(),
});
const JourneyParamsSchema = UserParamsSchema.extend({
    journeyId: z.coerce.string(),
});

// Get
export const GetJourneyParamsSchema = JourneyParamsSchema;
export type GetJourneyInput = z.infer<typeof GetJourneyParamsSchema>;
export type GetJourneyOutput = Journey;

// Create
export const CreateJourneyParamSchema = UserParamsSchema;
export type CreateJourneyInput = z.infer<typeof CreateJourneyParamSchema>;
export type CreateJourneyOutput = Journey;

// Position
export const UpdateDistanceParamsSchema = JourneyParamsSchema;
export const CoordinatesSchema = z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;
export const UpdateDistanceBodySchema = z.object({
    coordinates: CoordinatesSchema,
});

export type UpdateDistanceParamsInput = z.infer<typeof UpdateDistanceParamsSchema>;
export type UpdateDistanceBodyInput = z.infer<typeof UpdateDistanceBodySchema>;
export type UpdateDistanceInput = UpdateDistanceParamsInput & UpdateDistanceBodyInput;
export type UpdateDistanceOutput = { distance: number };

// End
export const EndJourneyParamsSchema = JourneyParamsSchema;
export const EndJourneyBodySchema = z.object({
    carId: z.number(),
});
export type EndJourneyParamsInput = z.infer<typeof EndJourneyParamsSchema>;
export type EndJourneyBodyInput = z.infer<typeof EndJourneyBodySchema>;
export type EndJourneyInput = EndJourneyParamsInput & EndJourneyBodyInput;
export type EndJourneyOutput = Journey;
