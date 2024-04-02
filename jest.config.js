// jest.config.js
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./jest.setup.js'],
  globals: {
    'ts-jest': {
      tsconfig: './frontend/tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343]
        },
        astTransformers: {
          before: [
            {
              path: 'node_modules/ts-jest-mock-import-meta', 
              options: { metaObjectReplacement: { url: 'http://localhost:8000/api/listMeds/' } }
            }
          ]
        }
      }
    ]
  },
};
