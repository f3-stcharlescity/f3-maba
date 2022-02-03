# f3-maba

## Prerequisites

- [node.js](https://nodejs.org) (10.16+)
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
| NODE_ENV       | node.js runtime environment (DEVELOPMENT, PRODUCTION) |
| DATABASE_URL   | PostgreSQL database URL.                              |
| PORT           | node.js Express server port. Typically 3000.          |
| TZ             | Server timezone.                                      |
| F3_MAP_URL     | Used by scripts to fetch region and AO names.         |
| IS_YEAR_CLOSED | Allow users to submit burpees (true, false)           |

**Example**

```
NODE_ENV=development
DATABASE_URL=postgresql://USER@HOST:PORT/DATABASE
PORT=3000
TZ=America/Chicago
F3_MAP_URL=https://...
IS_YEAR_CLOSED=false
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

Region names are stored in `./server/data/regions.json`

```
node ./bin/make-data.js
```

## Additional Vue.js customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
