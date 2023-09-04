const concurrently = require('concurrently');
const dotEnv = require('dotenv');
const { dropTestDatabase } = require('./testUtils/database');

dotEnv.config({ path: '../../.env.test' });

// prisma generate && concurrently \"npm run start:api\"  \"jest --config jest.json \" -s=\"last\"

// eslint-disable-next-line turbo/no-undeclared-env-vars
const DATABASE_URL = process.env.TEMPLATE_SERVICE_DATABASE_URL;

dropTestDatabase();

concurrently(
    [
        {
            command: 'npx jest --config jest.json --runInBand --detectOpenHandles --forceExit',
            name: 'jest',
            env: { DATABASE_URL, NODE_ENV: 'test', PORT: 4010 },
        },
    ],
    {
        killOthers: ['failure', 'success'],
        prefixColors: 'auto',
    }
).result.then(
    function onSuccess() {
        // This code is necessary to make sure the parent terminates
        // when the application is closed successfully.
        process.exit();
    },
    function onFailure(exitInfo) {
        // This code is necessary to make sure the parent terminates
        // when the application is closed because of a failure.
        process.exit(exitInfo[0].exitCode); // Api process is always killed when jest finished. Use exit code of jest process
    }
);
