# RackVision

RackVision is a frontend infrastructure-visualization module built inside a Pulseway-style admin dashboard. It provides a mock enterprise ops experience with global infrastructure mapping, site and room drill-downs, rack exploration, hierarchy search, and system-detail handoff flows.

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

- The globe uses local country polygon data from `src/data/countries.json`
- Mock infrastructure data is provided by `src/services/rackvision/MockDataService.ts`
- The app is frontend-only in its current form
- Several actions are intentionally UI placeholders and do not persist backend state

## Recommended Verification

After installing dependencies, run:

```bash
npm run lint
npm run test
npm run build
```

## Troubleshooting

- If `npm run dev` fails immediately, make sure `node_modules` exists and `npm install` completed successfully
- If the globe renders without country polygons, verify `src/data/countries.json` is present and valid GeoJSON
- If route deep links do not behave as expected, start from `/dashboard/rackvision` and confirm mock data files have not been modified unexpectedly

## Repository

- Remote: `https://github.com/GODOSTROYER/rackvisionv1.git`

