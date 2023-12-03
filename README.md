# f3-maba

## Prerequisites

- [node.js](https://nodejs.org) (16.18+)
- [Vue3 CLI](https://cli.vuejs.org)

## Install dependencies

```
npm install
```

## Set up the database

See `schema/ddl.sql`. This app requires a PostgreSQL database.

## Set up environment variables

| Variable       | Description                                           |
|----------------|-------------------------------------------------------|
| NODE_ENV       | node.js runtime environment (development, production) |
| DATABASE_URL   | PostgreSQL database URL.                              |
| PORT           | node.js Express server port. Typically 3000.          |
| TARGET_YEAR    | MABA year.                                            |
| TZ             | Server timezone.                                      |
| IS_YEAR_CLOSED | Allow users to submit burpees (true, false)           |

**Example**

```
NODE_ENV=development
DATABASE_URL=postgresql://USER@HOST:PORT/DATABASE
PORT=3001
TARGET_YEAR=2024
TZ=America/Chicago
IS_YEAR_CLOSED=false
MAINTENANCE_MODE=false
```

## Start the dev server and UI compilation watch

```
npm run start
npm run watch
```

## Compile and minify for production

```
npm run build
```

## Lint and fix files

```
npm run lint
```

## Update region names

Region names are stored in `./server/data/regions.json`.

To refresh official region data:

1. Go to https://f3nation.com/workouts/.
2. In the browser console, find the HTTP request to Google Spreadsheets where the last segment in the URL is `/Points`.
3. Download the response as `./bin/points.json`.
4. Execute the `./bin/make-data.js` script to re-generate the `./server/data/regions.json` file.

## Running maintenance scripts

**NOTE: the production database password must be stored in a standard ~/.pgpass file for maintenance scripts to function.**

- `bin/.env.prod`: environment variables for maintenance scripts (see: `bin/.env.prod.example`)
- `bin/mababak`: perform a backup of the production database
- `bin/mabatop10`: get quick "top 10" stats from the production database (see: `bin/mabatop10.sql`)

## Additional Vue.js customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
