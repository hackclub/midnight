# Lark UI

Frontend application for the Midnight RSVP system built with SvelteKit.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy the environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
```
PUBLIC_API_URL=http://localhost:3000
```

## Development

Make sure the mail-service (owl-api) is running first, then:

```bash
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Production

```bash
pnpm run preview
```

## Architecture

This frontend application now connects to the owl-api mail-service instead of using local API routes. The `PUBLIC_API_URL` environment variable should point to the mail-service URL.
