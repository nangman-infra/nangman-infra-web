module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: String.raw`.*\.spec\.ts$`,
    transform: {
        [String.raw`^.+\.(t|j)s$`]: 'ts-jest',
    },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    coverageReporters: ['lcov', 'text'],
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
    },
};
