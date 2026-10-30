# Feedora Backend

Node.js + Express + MongoDB API server for the Feedora RSS reader app.

## Prerequisites

- Node.js 18+
- MongoDB 6+ running locally (or a MongoDB Atlas URI)

## Setup

```bash
# From the backend/ directory
cp .env.example .env
# Edit .env and set MONGODB_URI if needed
npm install
npm run dev     # Hot-reload dev server on port 3000
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/feedora_db` | MongoDB connection string |
| `PORT` | `3000` | Backend server port |
| `ALLOWED_ORIGINS` | `http://localhost:3001,http://localhost:5173` | CORS-allowed frontend origins |
| `NODE_ENV` | `development` | Environment |
| `IP_HASH_SALT` | `feedora-privacy-salt-2024` | Salt for anonymous IP hashing in discovery |

## Running Both Frontend and Backend

In two separate terminals:

```bash
# Terminal 1 – Backend (port 3000)
npm run backend          # from feedora-app root

# Terminal 2 – Frontend (port 3001, proxies /api/* → port 3000)
npm run dev
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/feeds` | List all feeds |
| POST | `/api/feeds` | Create / upsert a feed |
| GET | `/api/feeds/:id` | Get single feed |
| PATCH | `/api/feeds/:id` | Update feed fields |
| DELETE | `/api/feeds/:id` | Delete feed + cascade articles |
| GET | `/api/articles` | List articles (`?feedId`, `?isRead`, `?isBookmarked`, `?limit`, `?skip`) |
| GET | `/api/articles/:id` | Get single article |
| POST | `/api/articles/bulk` | Bulk upsert articles |
| PATCH | `/api/articles/:id` | Update article state |
| PATCH | `/api/articles/actions/mark-all-read` | Mark all articles read |
| GET | `/api/fetch?url=<encoded>` | SSRF-protected RSS proxy |
| GET | `/api/discovery?userFeeds=<comma-list>` | Feed recommendations |
| POST | `/api/discovery` | Submit anonymous telemetry |
