import 'dotenv/config'; // Load .env file

export default {
    databaseUrl: process.env.DATABASE_URL ?? 'file:./dev.db',
    databaseType:
        (process.env.DATABASE_URL?.split(':')?.[0] as 'file' | 'postgres' | undefined) ?? 'file',

    host: process.env.HOST ?? '127.0.0.1',
    port: Number(process.env.PORT ?? 3001),

    apiKey: 'internal_api',

    isTest: process.env.NODE_ENV === 'test',
};
