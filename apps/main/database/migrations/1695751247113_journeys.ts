import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'journeys';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').notNullable().index();
            table.string('user_id').notNullable().index().references('id').inTable('users');
            table.timestamp('start_time').notNullable();

            table.double('start_location_lat').notNullable();
            table.double('start_location_lon').notNullable();
            table.double('last_location_lat').notNullable();
            table.double('last_location_lon').notNullable();

            table.double('distance').notNullable();

            table.timestamp('end_time').notNullable();

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
