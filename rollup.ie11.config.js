import { getConfig } from './rollup.config';

export default getConfig({
  tsconfig: './tsconfig.ie11.json',
  output: [
    {
      file: `dist/react-hook-form.ie11.js`,
      format: 'cjs',
      exports: 'named',
    },
  ],
});
