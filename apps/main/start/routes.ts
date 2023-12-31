/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route';

Route.get('/api/health', async () => {
    return 'ok';
});

Route.post('register', 'AuthController.register');
Route.post('login', 'AuthController.login');
Route.post('logout', 'AuthController.logout').middleware('auth');
Route.get('api/me', 'AuthController.me').middleware('auth');

Route.get('api/me/integrations', 'IntegrationApiKeysController.index').middleware('auth');
Route.post('api/me/integrations/:integration_name', 'IntegrationApiKeysController.create').middleware('auth');

Route.post('api/location/:integrationName', 'LocationController.handleLocationUpdate');

Route.group(() => {
    Route.resource('me/config', 'UserConfigsController').apiOnly();

    Route.resource('vehicles', 'VehiclesController').apiOnly();
    Route.resource('vehicles/:vehicleId/odometer', 'OdometerReadingsController').apiOnly();
})
    .prefix('api')
    .middleware('auth');

Route.post('iapi/journey', 'JourneysController.create').middleware('internal_auth');
