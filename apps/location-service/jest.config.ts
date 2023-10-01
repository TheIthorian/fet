const config = {
    preset: 'ts-jest',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*.test.(t|j)s',
    transform: { '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: './tsconfig.json' }] },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
};

export default config;
