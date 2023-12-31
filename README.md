# FET - Fuel Efficiency Tracker

This is a project to help track fuel efficiency for cars. It is built off the [node-turborepo-starter](https://github.com/TheIthorian/node-monorepo-starter) template.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

-   `docs`: All documentation for each service.
-   `web`: Website for more information about the project.
-   `ui`: a stub React component library shared by both ui applications

### Environment Setup

Create `.env` file from `apps/main/.env.example`. Set the following:

```sh
APP_KEY= # External api key
PROXY_URL= # Proxy url for external webhooks to use
```

Create `.env` file from `apps/journey-service/.env.example`. Set the following after create a [HERE app](https://platform.here.com/admin/apps):

```sh
HERE_APP_ID= # Generated when creating an app
HERE_APP_KEY= # Generated when creating an api key under the app
```

## Installing

Run the following command:

```sh
npm i
```

### Build

To build all apps and packages (including sqlite database) run the following command:

```
npm run build
```

Create the database with

```sh
node apps/main/ace migration:run
```

See https://docs.adonisjs.com/guides/ace-commandline for more ace commands

### Develop

To develop all apps and packages, run the following command:

```

npm run dev

```

#### Check it's working

```sh
echo '\n\nmain'
curl localhost:3333/api/health

echo '\n\njourney service'
curl localhost:3010/api/health
```
