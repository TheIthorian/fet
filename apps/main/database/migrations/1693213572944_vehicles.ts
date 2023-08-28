import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'vehicles';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table
                .integer('user_id')
                .unsigned()
                .references('id')
                .inTable('users')
                .onDelete('CASCADE')
                .notNullable()
                .index();

            table.string('vin').nullable();
            table.string('reg_no').nullable();
            table.string('make').nullable();
            table.string('model').nullable();
            table.string('fuel_type').notNullable().index();

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
