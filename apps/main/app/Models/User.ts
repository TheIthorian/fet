import { DateTime } from 'luxon';
import Hash from '@ioc:Adonis/Core/Hash';
import { column, beforeSave, BaseModel, afterCreate } from '@ioc:Adonis/Lucid/Orm';
import UserConfig from './UserConfig';

export default class User extends BaseModel {
    @column({ isPrimary: true })
    public id: number;

    @column()
    public email: string;

    @column({ serializeAs: null })
    public password: string;

    @column()
    public rememberMeToken: string | null;

    /**
     * `5:no`, `6:yes`
     */
    @column()
    public emailVerifiedInd: 5 | 6;

    /**
     * `0:inactive`, `1:active`
     */
    @column()
    public status: 0 | 1;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;

    @beforeSave()
    public static async hashPassword(user: User) {
        if (user.$dirty.password) {
            user.password = await Hash.make(user.password);
        }
    }

    /**
     * Initialise user config
     */
    @afterCreate()
    public static async createConfig(user: User) {
        // TODO - Should this be here?
        await UserConfig.create({
            userId: user.id,
            displayName: user.email,
            setupRequiredInd: 6,
            geolocationEnabledInd: 5,
        });
    }
}
