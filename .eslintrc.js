module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@fuelrats/eslint-config',
    '@fuelrats/eslint-config/plugins/fuelrats',
  ],
  rules: {
    'jsdoc/require-jsdoc': ['off'],
  },
  overrides: [
    {
      files: ['*.test.js'],
      env: {
        jest: true,
      },
    },
  ],
}
