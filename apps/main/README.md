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
