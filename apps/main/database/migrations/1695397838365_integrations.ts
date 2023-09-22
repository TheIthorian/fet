import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'integrations';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('name').notNullable().unique();

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });
        });

        this.defer(async (db) => {
            await db.table('integrations').insert({ name: 'owntracks' });
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
