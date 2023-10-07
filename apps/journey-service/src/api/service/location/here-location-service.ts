import { logContext, makeLogger } from 'fet-logger';
import type { DiscoverLocationItem, HereClient } from './here-client';
import type { GetLocationDetailsInput, LocationDetails, LocationService } from './types';

const log = makeLogger(module);

// https://docs.inrix.com/traffic/fuel/#get-fuelstations
// https://platform.here.com/portal/
// https://developer.here.com/documentation/identity-access-management/dev_guide/topics/sdk.html
export class HereLocationService implements LocationService {
    constructor(private readonly hereClient: HereClient) {}

    async getLocationDetails({ lat, lon }: GetLocationDetailsInput): Promise<LocationDetails> {
        logContext(`${HereLocationService.name}.${this.getLocationDetails.name}`, { lat, lon }, log);
        const { items } = await this.hereClient.discoverLocation({ lat, lon, q: 'petrol station' });

        return {
            lat,
            lon,
            isAtPetrolStation: isLocationGasStation(items[0]),
        };
    }
}

const PETROL_STATION_IDS = ['700-7600-0000', '700-7600-0116']; // fuelling station & petrol station

function isLocationGasStation(locationDetails: DiscoverLocationItem): boolean {
    const ctx = logContext(`${isLocationGasStation.name}`, {}, log);

    if (locationDetails.distance > 50) {
        log.info(`${ctx} location is more than 50m from gas station`);
        return false;
    }

    for (const category of locationDetails.categories) {
        if (PETROL_STATION_IDS.includes(category.id)) {
            log.info(`${ctx} location is near gas station`);
            return true;
        }
    }

    log.info(`${ctx} location is not near gas station`);
    return false;
}
