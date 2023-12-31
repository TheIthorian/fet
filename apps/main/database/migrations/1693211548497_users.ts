import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'users';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id').primary();
            table.string('email', 255).notNullable().unique().index();
            table.string('password', 180).notNullable();
            table.string('remember_me_token').nullable();
            table.integer('email_verified_ind').notNullable().checkIn(['5', '6']); // TODO - Should this be string?
            table.integer('status').notNullable().checkIn(['0', '1']).index();

            /**
             * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true }).notNullable();
            table.timestamp('updated_at', { useTz: true }).notNullable();
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
