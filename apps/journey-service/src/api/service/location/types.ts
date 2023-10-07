export interface LocationDetails {
    lat: number;
    lon: number;
    isAtPetrolStation: boolean;
}

export interface GetLocationDetailsInput {
    lat: number;
    lon: number;
}

export interface LocationService {
    getLocationDetails: ({ lat, lon }: GetLocationDetailsInput) => Promise<LocationDetails>;
}
