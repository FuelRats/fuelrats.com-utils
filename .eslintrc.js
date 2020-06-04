module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    '@fuelrats/eslint-config',
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
