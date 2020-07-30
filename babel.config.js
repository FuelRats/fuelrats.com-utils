module.exports = {
  presets: [
    [
      '@babel/env',
      {
        bugfixes: true,
        shippedProposals: true,
      },
    ],
  ],
  plugins: [
    ['@babel/proposal-decorators', { legacy: true }],
    ['@babel/proposal-class-properties', { loose: true }],
    ['@babel/proposal-private-methods', { loose: true }],
    ['@babel/proposal-private-property-in-object', { loose: true }],
    '@babel/proposal-export-default-from',
    '@babel/proposal-export-namespace-from',
    '@babel/proposal-function-bind',
    '@babel/proposal-function-sent',
    '@babel/proposal-logical-assignment-operators',
    '@babel/proposal-numeric-separator',
    '@babel/proposal-optional-catch-binding',
    '@babel/proposal-throw-expressions',
    '@babel/transform-runtime',
    '@babel/transform-strict-mode',
  ],
}
