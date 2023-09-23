import { AppException } from './AppException';

export default class VehicleAlreadyExistException extends AppException {
    public static new(existingRegNo: string) {
        return new VehicleAlreadyExistException(
            `A vehicle with registration number ${existingRegNo} has already been added`,
            400,
            'E_VEHICLE_EXISTS'
        );
    }
}
