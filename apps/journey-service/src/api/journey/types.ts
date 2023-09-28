export interface Coordinates {
    lat: number;
    lon: number;
}

export interface Journey {
    id: string;
    userId: number;
    status: 'new' | 'inProgress' | 'completed';
}

export interface NewJourney extends Journey {
    status: 'new';
    startTime: Date;
    startLocation: Coordinates;
    lastLocation: Coordinates;
    distance: 0;
}

export interface InProgressJourney extends Journey {
    status: 'inProgress';
    startTime: Date;
    startLocation: Coordinates;
    lastLocation: Coordinates;
    lastReadingDate: Date;
    lastSignificantReadingDate: Date;
    distance: number;
}

export interface CompletedJourney extends Journey {
    status: 'completed';
    startTime: Date;
    startLocation: Coordinates;
    lastLocation: Coordinates;
    distance: number;
    endTime: Date;
}
