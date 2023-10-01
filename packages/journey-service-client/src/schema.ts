import { z } from 'zod';
import { Journey } from './types';

const UserParamsSchema = z.object({
    userId: z.coerce.number(),
});

export const CoordinatesSchema = z.object({
    lat: z.number().min(-90).max(90),
    long: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

// Post location
export const PostLocationParamsSchema = UserParamsSchema;
export const PostLocationBodySchema = z.object({
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
    created_at: z.string(),
    velocity: z.number().optional(),
    distance: z.number().optional(),
});
export type PostLocationParamsInput = z.infer<typeof PostLocationParamsSchema>;
export type PostLocationBodyInput = z.infer<typeof PostLocationBodySchema>;
export type PostLocationInput = PostLocationParamsInput & PostLocationBodyInput;
export type PostLocationOutput = { journey: Journey | null };
