import { Exception } from '@adonisjs/core/build/standalone';

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new VehicleAlreadyExistException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class VehicleAlreadyExistException extends Exception {
    public static new(existingRegNo: string) {
        return new VehicleAlreadyExistException(
            `A vehicle with registration number ${existingRegNo} has already been added`,
            400,
            'E_VEHICLE_EXISTS'
        );
    }
}
