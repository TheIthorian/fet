const config = {
    preset: 'ts-jest',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*.test.(t|j)s',
    transform: {
        '^.+\\.ts': ['ts-jest', { tsconfig: './tsconfig.json' }],
        '^.+\\.js': 'babel-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};

export default config;
