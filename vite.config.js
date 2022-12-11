import { defineConfig } from 'vite';

export default defineConfig({
  base: '/vhv/',
  build: {
    sourcemap: true,
  },
  server: {
    port: 5001,
  },
});
