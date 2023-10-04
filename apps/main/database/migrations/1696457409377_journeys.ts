import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'journeys';

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.boolean('is_at_petrol_station').notNullable().defaultTo(false);
        });
    }

    public async down() {
        this.schema.alterTable(this.tableName, () => {});
    }
}
