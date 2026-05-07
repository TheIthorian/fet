import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        swc.vite({
            jsc: {
                parser: { syntax: 'typescript', decorators: true },
                transform: { legacyDecorator: true, decoratorMetadata: true },
                target: 'es2021',
            },
        }),
    ],
    test: {
        globals: true,
        include: ['src/**/*.spec.ts'],
        setupFiles: ['./vitest.setup.ts'],
    },
});
