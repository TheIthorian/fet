export interface Journey {
    startTime: Date;
    distance: number;
    userId: number;
    lastPosition?: Coordinates;
    endTime?: Date;
}

export interface Coordinates {
    lat: number;
    long: number;
}
