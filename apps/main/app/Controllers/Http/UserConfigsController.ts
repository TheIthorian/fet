import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Database from '@ioc:Adonis/Lucid/Database';
import UserConfig from 'App/Models/UserConfig';

export default class UserConfigsController {
    public async index({ response, auth }: HttpContextContract) {
        const user = await auth.use('api').authenticate();

        const [config, vehicleCount] = await Promise.all([
            UserConfig.findBy('user_id', user.id),
            Database.from('vehicles').count('*', 'total').where('user_id', user.id),
        ]);

        const userDetails: UserDetails = {
            userId: user.id,
            isSetupRequired: config?.setupRequiredInd !== 5,
            vehicleCount: vehicleCount[0].total,
            email: user.email,
            displayName: user.email,
            userConfig: {
                isGeolocationEnabled: config?.geolocationEnabledInd !== 5,
            },
        };

        response.json(userDetails);
    }
}

type UserDetails = {
    userId: number;
    isSetupRequired: boolean;
    vehicleCount: number;
    email: string;
    displayName: string;
    userConfig: UserDetailsConfig;
};

type UserDetailsConfig = {
    isGeolocationEnabled: boolean;
};
