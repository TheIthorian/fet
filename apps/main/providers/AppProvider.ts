import fs from 'fs';
import type { ApplicationContract } from '@ioc:Adonis/Core/Application';

export default class AppProvider {
    constructor(protected app: ApplicationContract) {}

    public register() {
        // Register your own bindings
    }

    public async boot() {
        // IoC container is ready
        const tmpPath = this.app.makePath('tmp');
        if (!fs.existsSync(tmpPath)) {
            fs.mkdirSync(tmpPath);
        }
    }

    public async ready() {
        // App is ready
    }

    public async shutdown() {
        // Cleanup, since app is going down
    }
}
