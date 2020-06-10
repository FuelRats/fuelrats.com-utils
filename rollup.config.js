/* eslint-env node */
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'
import nodeExternals from 'rollup-plugin-node-externals'

function makeBundle (input, output, plugins = []) {
  return {
    input,
    output: {
      exports: 'named',
      file: output,
      format: 'cjs',
    },
    external: [
      './actions',
      './http',
      './json-api',
      './reducer',
    ],
    plugins: [
      nodeExternals({ deps: true }),
      resolve(),
      babel({ babelHelpers: 'bundled' }),
      ...plugins,
    ],
  }
}


const config = [
  makeBundle('src/actions.js', 'dist/actions.js'),
  makeBundle('src/http.js', 'dist/http.js'),
  makeBundle('src/redux-json-api.js', 'dist/redux-json-api.js'),
  makeBundle('src/reducers.js', 'dist/reducers.js', [
    copy({
      targets: [
        {
          src: [
            'CHANGELOG.md',
            'LICENSE',
            'package.json',
            'README.md',
          ],
          dest: 'dist',
        },
        { src: 'types/*', dest: 'dist' },
      ],
    }),
  ]),
]





export default config