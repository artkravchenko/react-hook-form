import typescript from 'rollup-plugin-typescript2';

export function getConfig({
  tsconfig = './tsconfig.json',
  output = [
    {
      file: `dist/react-hook-form.js`,
      format: 'cjs',
      exports: 'named',
    },
    {
      file: `dist/react-hook-form.es.js`,
      format: 'esm',
    },
  ],
} = {}) {
  return {
    input: 'src/index.ts',
    external: ['react', 'react-dom'],
    plugins: [
      typescript({
        tsconfig,
        clean: true,
      }),
    ],
    output,
  };
}

export default getConfig();
