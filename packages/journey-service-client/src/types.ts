import { Coordinates } from './schema';

export interface Journey {
    id: string;
    startTime: Date;
    distance: number;
    userId: number;
    lastLocation?: Coordinates;
    endTime?: Date;
    carId?: number;
}
