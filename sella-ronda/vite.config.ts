import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// The hosted Instinct viewer provides the '@instinct/files' runtime module.
// For local runs we alias it to a small shim so the published source in src/
// stays byte-for-byte identical to what is live.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@instinct/files': path.resolve(__dirname, 'shims/instinct-files.tsx'),
    },
  },
});
