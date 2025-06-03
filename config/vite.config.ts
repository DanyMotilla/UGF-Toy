import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: path.resolve(__dirname, '../public'),
  plugins: [
    react(),
    glsl({
      include: ['**/*.glsl'],
      exclude: ['node_modules/**'],
      warnDuplicatedImports: true,
      defaultExtension: 'glsl'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  },
  server: {
    port: 3333
  }
});
