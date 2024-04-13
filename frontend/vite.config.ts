import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { UserConfig as VitestUserConfig } from 'vitest/config';

declare module 'vite' {
  export interface UserConfig {
    test: VitestUserConfig['test'];
  }
}
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: '../server/build', // Custom output directory
    assetsDir: 'static',
  },
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
    host: "0.0.0.0",
    strictPort: true,
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/testSetup.tsx',
    css: true,
  },
});