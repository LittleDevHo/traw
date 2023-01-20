import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';
import packageJson from './package.json';
import url from 'postcss-url';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
      exclude: ['node_modules', 'build', 'storybook-static', 'src/**/*.stories.tsx', 'src/**/*.test.tsx'],
    }),
    json(),
    postcss({
      extract: resolve('build/index.css'),
      to: 'build/index.css',
      plugins: [
        url({
          url: 'copy',
        }),
      ],
    }),
  ],
  external: ['react', 'react-dom'],
  onwarn(warning, warn) {
    // Skip for react-lottie
    if (warning.code === 'EVAL') return;

    // Use default for everything else
    warn(warning);
  },
};
