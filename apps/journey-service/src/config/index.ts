import 'dotenv/config'; // Load .env file

export default {
    databaseUrl: process.env.JOURNEY_SERVICE_DATABASE_URL ?? 'file:./dev.db',
    databaseType:
        (process.env.JOURNEY_SERVICE_DATABASE_URL?.split(':')?.[0] as
            | 'file'
            | 'postgres'
            | undefined) ?? 'file',

    host: process.env.JOURNEY_SERVICE_HOST ?? '127.0.0.1',
    port: Number(process.env.JOURNEY_SERVICE_PORT ?? 3010),

    apiKey: 'internal_key',

    isTest: process.env.JOURNEY_SERVICE_NODE_ENV === 'test',
};
