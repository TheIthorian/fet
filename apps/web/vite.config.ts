import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const proxyTarget = process.env.PROXY_URL ?? 'http://localhost:3000';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5173,
        proxy: {
            '/api': proxyTarget,
            '/register': proxyTarget,
            '/login': proxyTarget,
        },
    },
});
