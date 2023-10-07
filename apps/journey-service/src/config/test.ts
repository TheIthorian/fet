export const testConfig = {
    databaseUrl: process.env.JOURNEY_SERVICE_DATABASE_URL ?? 'file:./dev.db',
    databaseType:
        (process.env.JOURNEY_SERVICE_DATABASE_URL?.split(':')?.[0] as 'file' | 'postgres' | undefined) ?? 'file',

    host: process.env.JOURNEY_SERVICE_HOST ?? '127.0.0.1',
    port: Number(process.env.JOURNEY_SERVICE_PORT ?? 3010),

    apiKey: 'internal_key',

    isTest: process.env.NODE_ENV === 'test',

    mainApp: {
        url: process.env.MAIN_APP_URL ?? '',
        apiKey: process.env.MAIN_APP_INTERNAL_KEY ?? '',
    },

    hereApi: {
        discoverSearchUrl: '',
        apiKey: process.env.HERE_APP_KEY ?? '',
    },
} as const;
