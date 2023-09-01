import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'odometer_readings';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('user_id').notNullable().references('id').inTable('users').index();
            table.integer('vehicle_id').notNullable().references('id').inTable('vehicles').index();
            table.integer('value').unsigned().notNullable().index();
            table.dateTime('reading_date').notNullable();

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
