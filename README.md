# Weather Forecast

A minimal React + TypeScript weather app powered by the [Open-Meteo Forecast API](https://open-meteo.com/en/docs).

Live at [https://bea94k.github.io/weather-forecast/](https://bea94k.github.io/weather-forecast/)

## Features

- Location choice with two modes:
  - Search by city name with preset suggestions (Helsinki, London, New York, Tokyo)
  - Interactive map click selection for custom coordinates
- Current weather for a selected location (temperature, feels-like, humidity, wind speed, weather conditions)
- Hourly forecast (next 12 hours)
- Daily forecast (next 7 days)
- Temperature unit switching (C/F)
- Responsive UI styled with Sass Modules
- Test coverage for API handling and core interactions

## Tech Stack

- React + TypeScript
- Vite for development and bundling
- Sass + CSS Modules for styling
- Vitest + Testing Library for tests
- ESLint for linting
- GitHub Actions for CI/CD

This project intentionally keeps dependencies minimal and focused on core app needs.

## Local Setup

### Requirements

- Node.js 24+
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

The dev server starts on a local Vite URL (typically `http://localhost:5173`).

### Run tests and linting

- `npm run test` - run tests in watch mode
- `npm run test:run` - run tests once
- `npm run lint` - run ESLint

## Pipelines and Deployment

### CI workflow

[`ci.yml`](.github/workflows/ci.yml) runs on pull requests and pushes to `main`, and runs lint, tests and build.

### Deploy workflow

[`deploy.yml`](.github/workflows/deploy.yml) deploys to GitHub Pages when CI succeeds on `main` (or via manual trigger).
