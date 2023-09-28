# Journey Service

## Getting Started

Run the development server:

```bash
npm ci
npm run dev
```

Run production server:

```bash
npm run build
npm start
```

Uses default port of `3010`

## Api Endpoints

| Route                                                | Description                                                                 |
| ---------------------------------------------------- | --------------------------------------------------------------------------- |
| `GET  api/health`                                    | Check service health                                                        |
| `POST api/users/:userId/journey`                     | Create a new journey                                                        |
| `GET  api/users/:userId/journey/:journeyId`          | Get journey details                                                         |
| `POST api/users/:userId/journey/:journeyId/location` | Add new location reading to the journey                                     |
| `POST api/users/:userId/journey/:journeyId/end`      | Complete the journey                                                        |
| Location Handler                                     |                                                                             |
| `POST api/users/:userId/location`                    | Use the location endpoint to automatically create, update, and end journeys |
