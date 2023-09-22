import BaseSchema from '@ioc:Adonis/Lucid/Schema';

export default class extends BaseSchema {
    protected tableName = 'user_integrations';

    public async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.integer('user_id').references('id').inTable('users').notNullable().index();
            table.string('api_key').unique().index();
            table
                .string('integration_id')
                .notNullable()
                .references('id')
                .inTable('integrations')
                .notNullable()
                .index();

            /**
             * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
             */
            table.timestamp('created_at', { useTz: true });
            table.timestamp('updated_at', { useTz: true });

            table.unique(['user_id', 'integration_id']);
        });
    }

    public async down() {
        this.schema.dropTable(this.tableName);
    }
}
