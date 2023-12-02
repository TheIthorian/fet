# Main

This is the main application of FET, which handles core data and api routing.

Use the following scripts for development and production:

-   `npm run dev`: Start the development server with file watching.
-   `npm run build`: Build the project for production.
-   `npm start`: Start the production server.
-   `npm test`: Run tests.
-   `npm run lint`: Lint the project using ESLint.
-   `npm run format`: Format the project code using Prettier.

## Installation

Before running the application, make sure you have Node.js and npm (Node Package Manager) installed on your machine.

1. Clone this repository:

```bash
git clone https://github.com/TheIthorian/fet.git
```

2. Install project dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example` and configure your environment variables.

3. Run database migrations

```bash
node ace migration:run
```

4. Start development server (http://localhost:3333 by default)

```bash
npm run dev
```

5. Or start production server. Build the project first using:

```bash
npm run build
```

Then start the production server with:

```bash
npm start
```

## Api Endpoints

| Method              | Endpoint                              | Description                                                             |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------- |
| GET                 | api/health                            | Check health of service                                                 |
| POST                | register                              | User registration                                                       |
| POST                | login                                 | User login                                                              |
| POST                | logout                                | User logout (auth required)                                             |
| GET                 | api/me                                | Get user profile                                                        |
|                     |                                       |                                                                         |
| **Integrations**    |                                       |                                                                         |
| GET                 | api/me/integrations                   | Get user integrations                                                   |
| POST                | api/me/integrations/:integration_name | Create user integration                                                 |
| POST                | api/location/:integrationName         | Handle location update. Starts or stops a journey if conditions are met |
|                     |                                       |                                                                         |
| **User config**     |                                       |                                                                         |
|                     |                                       |                                                                         |
| POST                | api/me/config                         | Create user config                                                      |
| GET                 | api/me/config                         | Get user configs                                                        |
| PUT                 | api/me/config/:id                     | Update user config                                                      |
| DELETE              | api/me/config/:id                     | Delete user config                                                      |
|                     |                                       |                                                                         |
| **Vehicles**        |                                       |                                                                         |
| POST                | api/vehicles                          | Create vehicle                                                          |
| GET                 | api/vehicles                          | Get vehicles                                                            |
| PUT                 | api/vehicles/:id                      | Update vehicle                                                          |
| DELETE              | api/vehicles/:id                      | Delete vehicle                                                          |
|                     |                                       |                                                                         |
| **Odometer**        |                                       |                                                                         |
| POST                | api/vehicles/:vehicleId/odometer      | Create odometer reading                                                 |
| GET                 | api/vehicles/:vehicleId/odometer      | Get odometer readings                                                   |
| PUT                 | api/vehicles/:vehicleId/odometer/:id  | Update odometer reading                                                 |
| DELETE              | api/vehicles/:vehicleId/odometer/:id  | Delete odometer reading                                                 |
|                     |                                       |                                                                         |
| **Journey Service** |                                       |                                                                         |
| POST                | /iapi/journey                         | Create internal journey                                                 |
