/** JWT payload returned by /api/me and embedded in auth responses. */
export interface User {
    sub: string;
    email: string;
}

export interface Location {
    lat: number;
    lon: number;
}

// --- Resource types ---

export interface Journey {
    _id: string;
    journeyId: string;
    userId: string;
    startTime: string;
    endTime: string;
    distance: number;
    startLocation: Location;
    lastLocation: Location;
    isAtPetrolStation: boolean;
    createdAt: string;
}

export interface Vehicle {
    _id: string;
    userId: string;
    vin?: string;
    regNo: string;
    make: string;
    model: string;
    fuelType: string;
    createdAt: string;
}

export interface OdometerReading {
    _id: string;
    vehicleId: string;
    value: number;
    readingDate: string;
    createdAt: string;
}

export interface Integration {
    name: string;
    apiKey: string;
    webhookUrl: string;
    createdAt: string;
}

export interface UserConfig {
    displayName: string;
    setupRequired: boolean;
    geolocationEnabled: boolean;
}

// --- Request types ---

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateVehicleRequest {
    vin?: string;
    regNo: string;
    make: string;
    model: string;
    fuelType: string;
}

export interface CreateOdometerReadingRequest {
    value: number;
    /** ISO 8601 date string */
    readingDate: string;
}

export interface UpdateUserConfigRequest {
    displayName?: string;
    setupRequired?: boolean;
    geolocationEnabled?: boolean;
}
