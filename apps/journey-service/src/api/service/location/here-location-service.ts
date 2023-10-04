import type { DiscoverLocationItem, HereClient } from './here-client';
import type { GetLocationDetailsInput, LocationDetails, LocationService } from './types';

// https://docs.inrix.com/traffic/fuel/#get-fuelstations
// https://platform.here.com/portal/
// https://developer.here.com/documentation/identity-access-management/dev_guide/topics/sdk.html
export class HERELocationService implements LocationService {
    constructor(private readonly hereClient: HereClient) {}

    async getLocationDetails({ lat, lon }: GetLocationDetailsInput): Promise<LocationDetails> {
        const [LocationDetails] = await this.hereClient.discoverLocation({ lat, lon });

        return {
            lat,
            lon,
            isAtPetrolStation: isLocationGasStation(LocationDetails),
        };
    }
}

const PETROL_STATION_IDS = ['700-7600-0000', '700-7600-0116']; // fuelling station & petrol station

function isLocationGasStation(locationDetails: DiscoverLocationItem): boolean {
    if (locationDetails.distance > 50) {
        return false;
    }

    for (const category of locationDetails.categories) {
        if (PETROL_STATION_IDS.includes(category.id)) {
            return true;
        }
    }

    return false;
}
