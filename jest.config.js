/* export default {
    testEnvironment: 'node',
    transform: {},
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
}; */

export default {
    testEnvironment: 'node',
    transform: {
        '^.+\\.js$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/'
    ],
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
};


