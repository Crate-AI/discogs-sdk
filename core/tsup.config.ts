import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/utils.ts',
    'src/auth/index.ts',
    'src/auth/types.ts',
    'src/collection/index.ts',
    'src/collection/types.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  target: 'es2017',
  sourcemap: false,
  clean: true,
});
