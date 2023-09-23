import { AppException } from './AppException';

export default class VehicleNotFound extends AppException {
    public static new(vehicleId: string | number) {
        return new VehicleNotFound(
            `The vehicle with id ${vehicleId} could not be found`,
            404,
            'E_VEHICLE_NOT_FOUND'
        );
    }
}
