# RackVision

RackVision is a frontend-only infrastructure-visualization module built inside a Pulseway-style admin dashboard. It provides a mock enterprise ops experience with global infrastructure mapping, site and room drill-downs, rack exploration, hierarchy search, and system-detail handoff flows.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui + Radix UI
- React Router
- TanStack Query
- Vitest

## What Is Included

- App shell and dashboard routes
- RackVision workspace route orchestration
- Global infrastructure globe view
- Region and site drill-down flows
- Layout, room, row, and rack exploration
- Rack elevation workflow
- Inspector and hierarchy panels
- Mock data service and shared type system
- Placeholder system details route

## Project Structure

Key folders:

- `src/pages`: route-level screens
- `src/components/rackvision`: RackVision module UI and state
- `src/services/rackvision`: mock data service and selectors
- `src/data`: local mock datasets, including country GeoJSON
- `src/test`: focused Vitest coverage

## Requirements

Before running locally, install:

- Node.js 18+ or 20+
- npm 9+

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/GODOSTROYER/rackvisionv1.git
cd rackvisionv1
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

## Optional Mapbox Setup

The app runs without Mapbox, but the Globe view includes a Mapbox renderer toggle.

If you want to use the Mapbox mode:

1. Create a file named `.env.local` in the project root.
2. Add your public token:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.your_public_mapbox_token_here
```

3. Restart `npm run dev`.

If the token is missing, the app still runs and the Mapbox renderer shows a setup message instead of failing the whole workspace.

## Available Scripts

- `npm run dev`: start the local dev server
- `npm run build`: create a production build
- `npm run build:dev`: create a development-mode build
- `npm run preview`: preview the built app locally
- `npm run lint`: run ESLint
- `npm run test`: run Vitest once
- `npm run test:watch`: run Vitest in watch mode

## Main Routes

- `/dashboard/view`
- `/dashboard/manage`
- `/dashboard/rackvision`
- `/dashboard/rackvision/region/:regionId`
- `/dashboard/rackvision/site/:siteId`
- `/dashboard/rackvision/rack/:rackId`
- `/systems/:systemId`

## RackVision Flow

The RackVision module is centered around a shared reducer/context state model and a mock service layer.

Typical user flow:

1. Open `/dashboard/rackvision`
2. Explore regions or sites on the global globe
3. Drill into a site, room, row, or rack
4. Inspect a rack elevation and select a device
5. Open `/systems/:systemId` for the placeholder system details view

## Notes For Development

- The app is frontend-only. There is no backend API, database, or server-side data source.
- Mock infrastructure, hierarchy, and globe data are generated locally in functions inside `src/services/rackvision/MockDataService.ts`.
- The globe uses local country polygon data from `src/data/countries.json`.
- Several actions are intentionally UI placeholders and do not persist backend state.
- The `.env.local` file is ignored by Git so local tokens stay local.

## Recommended Verification

After installing dependencies, run:

```bash
npm run lint
npm run test
npm run build
```

## Security Check

At the time of this update, `npm audit --omit=dev` reports `0 vulnerabilities` for production dependencies.

## Troubleshooting

- If `npm run dev` fails immediately, make sure `node_modules` exists and `npm install` completed successfully
- If the globe renders without country polygons, verify `src/data/countries.json` is present and valid GeoJSON
- If route deep links do not behave as expected, start from `/dashboard/rackvision` and confirm mock data files have not been modified unexpectedly
- If Mapbox mode says it is not ready, confirm `VITE_MAPBOX_ACCESS_TOKEN` is set in `.env.local`

## Repository

- Remote: `https://github.com/GODOSTROYER/rackvisionv1.git`

