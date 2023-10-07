// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
// import { validateObjectIsNotNull } from '../utils/config-validation';
import 'dotenv/config'; // Load .env file

import { testConfig } from './tst';
import { prodConfig } from './prod';
import { devConfig } from './dev';

interface Config {
    databaseUrl: string;
    databaseType: string;
    host: string;
    port: number;
    apiKey: string;
    isTest: boolean;
    mainApp: {
        url: string;
        apiKey: string;
    };
    hereApi: {
        discoverSearchUrl: string;
        apiKey: string;
    };
}

// eslint-disable-next-line import/no-mutable-exports
let cfg: Config;

if (process.env.NODE_ENV === 'test') {
    cfg = testConfig;
} else if (process.env.NODE_ENV === 'production') {
    cfg = prodConfig;
} else {
    cfg = devConfig;
}

// validateObjectIsNotNull(config);

export const config = cfg;
