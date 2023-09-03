import type { Express, IRoute } from 'express';

export function printRegisteredRoutes(app: Express): void {
    const routes: string[] = [];

    function printRoutes(layer: IRoute & { route: { stack: IRoute[] } }): void {
        if (layer.path) {
            routes.push(layer.path);
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (layer.route) {
            routes.push((layer.route as unknown as { path: string }).path);
            layer.route.stack.forEach(printRoutes);
        }
    }

    const stacks = (app._router as { stack: IRoute[] }).stack;
    stacks.forEach((layer) => {
        printRoutes(layer as IRoute & { route: { stack: IRoute[] } });
    });

    process.stdout.write('Registered routes: \n');
    routes.forEach((route) => {
        process.stdout.write(`${route}\n`);
    });
}
