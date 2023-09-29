// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable turbo/no-undeclared-env-vars */
import 'dotenv/config'; // Load .env file

export default {
    databaseUrl: process.env.TEMPLATE_SERVICE_DATABASE_URL ?? 'file:./dev.db',
    databaseType:
        (process.env.TEMPLATE_SERVICE_DATABASE_URL?.split(':')?.[0] as 'file' | 'postgres' | undefined) ?? 'file',

    host: process.env.TEMPLATE_SERVICE_HOST ?? '127.0.0.1',
    port: Number(process.env.TEMPLATE_SERVICE_PORT ?? 3010),

    apiKey: 'internal_key',

    isTest: process.env.TEMPLATE_SERVICE_NODE_ENV === 'test',
};
