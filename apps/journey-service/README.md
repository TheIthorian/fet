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

| Route                             | Description                                                                 |
| --------------------------------- | --------------------------------------------------------------------------- |
| `GET  api/health`                 | Check service health                                                        |
| Location Handler                  |                                                                             |
| `POST api/users/:userId/location` | Use the location endpoint to automatically create, update, and end journeys |
