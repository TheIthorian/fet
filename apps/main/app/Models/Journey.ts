import { DateTime } from 'luxon';
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class Journey extends BaseModel {
    @column({ isPrimary: true })
    public id: string;

    @column()
    public userId: number;

    @column.dateTime()
    public startTime: DateTime;

    @column()
    public startLocationLat: number;

    @column()
    public startLocationLon: number;

    @column()
    public lastLocationLat: number;

    @column()
    public lastLocationLon: number;

    @column()
    public distance: number;

    @column()
    public isAtPetrolStation: boolean;

    @column.dateTime()
    public endTime: DateTime;

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime;

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime;
}
