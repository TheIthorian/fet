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

## Api Endpoints

| Route                         | Description                               |
| ----------------------------- | ----------------------------------------- |
| `POST api/health`             | Check service health                      |
| `POST api/journey`            | Create a new journey                      |
| `POST api/journey/:journeyId` | Add new positional reading to the journey |
| `GET api/journey/:journeyId`  | Get current distance travelled on journey |
