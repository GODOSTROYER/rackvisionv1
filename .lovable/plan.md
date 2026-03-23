
## Objective
Add a new **Dashboard → RackVision** top-level feature as a **frontend-only** infrastructure visualization module, integrated into the existing Pulseway-style shell/design system (no app redesign, no backend/API integration).

## Confirmed decisions
- **Device click flow:** Hybrid (single-click updates inspector; explicit action/double-click navigates to system details).
- **Global visualization:** **Pseudo-globe** (subtle animated globe-like overview, no heavy 3D engine).

## Implementation plan

### 1) Navigation + routing integration
1. Add **RackVision** under Dashboard children in `src/config/navigation.tsx`.
2. Add routes in `src/App.tsx`:
   - `/dashboard/rackvision`
   - `/dashboard/rackvision/region/:regionId`
   - `/dashboard/rackvision/site/:siteId`
   - `/dashboard/rackvision/rack/:rackId`
   - `/systems/:systemId` (frontend-only detail entrypoint, mapped to Systems UI state)
3. Keep existing sidebar/topbar behavior and styling unchanged.

### 2) RackVision data model + service stubs
1. Extend `src/data/mockData.ts` with RackVision entities:
   - regions, sites/data centers, rooms, rows, racks, devices, summaries, alerts/capacity snapshots.
2. Add RackVision placeholder APIs in `src/services/api.ts`:
   - `getInfrastructureSummary()`
   - `getRegions()`
   - `getRegionDetails(regionId)`
   - `getSites(regionId)`
   - `getSiteDetails(siteId)`
   - `getRooms(siteId)`
   - `getRows(roomId)`
   - `getRacks(rowId)`
   - `getRackDetails(rackId)`
   - `getRackDevices(rackId)`
   - `getDevicePreview(deviceId)`
   - `navigateToSystemDetails(deviceId)` (mock navigation helper)
3. Keep async mock latency pattern consistent with current `wait(...)`.

### 3) New reusable RackVision components (aligned to existing enterprise components)
Create a focused component set under `src/components/rackvision/`:
- `RackVisionHeader` (title/subtitle, search, selectors, filters, refresh/export actions)
- `ViewModeSwitcher` (Global/Hierarchy/Rack/Layout + optional Split)
- `GlobalInfrastructureView` + `RegionMarker` (pseudo-globe + tooltips + region selection)
- `RegionSummaryCards`
- `InfrastructureBreadcrumbs`
- `HierarchyExplorer` (searchable tree/list)
- `RackGrid` + `RackCard`
- `RackElevation` + `RackUnit`
- `DeviceHoverCard` (concise telemetry snapshot)
- `DetailsInspectorDrawer` (entity-aware right panel)
- `RackLegend`, `MetricsMiniBar`, `MiniTrendChart`
- Reuse existing `StatusBadge`, `WidgetCard`, `FilterBar`, `PageHeader`, `Tabs`, `Sheet/Drawer`, `toast`, `Skeleton`.

### 4) RackVision page composition
Create `src/pages/RackVisionPage.tsx` as a coordinated multi-view command center:
1. **Header zone** with global controls and filters.
2. **View modes**:
   - **Global View**: pseudo-globe + marker hover cards + high-level KPI summary cards.
   - **Hierarchy View**: breadcrumbs + left tree + center entity cards + right inspector.
   - **Rack View**: rack grid selector + main rack elevation + hover/device selection + previous/next rack controls.
   - **Layout View**: room/row/rack spatial topology-style map (clean, low-noise).
   - Optional **Split View** for hierarchy + rack + inspector together.
3. **Selection state orchestration** for region → site → room → row → rack → device.
4. **Loading skeletons** on view/entity transitions; empty states for filtered results.

### 5) Rack visualization quality rules
1. Rack elevation renders:
   - cabinet frame, U numbering, occupied/empty units, device heights (1U/2U/4U etc.), selected/highlight states.
2. Device styles:
   - server/storage/network/security/PDU/blank panel distinctions.
3. Device interactions:
   - hover card with required metrics (hostname, IP, OS, CPU/RAM/Disk/temp/network/uptime/status/alerts/power).
   - single click updates inspector; explicit CTA navigates to `/systems/:systemId`.
4. Status palette remains existing enterprise tone system (healthy/warning/critical/offline/maintenance).

### 6) Systems page linkage
1. Update `src/pages/SystemsPage.tsx` to accept route param (`systemId`) and preselect/open matching device summary state.
2. Preserve existing tabbed details drawer and visual-only telemetry placeholders.
3. Ensure RackVision “Open Full System Details” routes into this flow.

### 7) Practical filtering/search behavior (frontend-only)
1. Add global search over mock fields: hostname, system ID, rack ID, site, IP.
2. Add filters: region, site, status, device type, occupancy, severity.
3. Add quick chips/toggles: healthy-only, warning/critical, offline-only, empty slots, network devices, storage devices.
4. Implement client-side filtering only (no real business logic/backend persistence).

### 8) UX polish and consistency pass
1. Match existing spacing, card borders, typography, shadows, and blue accent usage.
2. Add restrained animation only (pseudo-globe rotation, marker pulse, subtle transitions).
3. Ensure responsive behavior for current desktop-first layout and graceful tablet collapse.
4. Add mock toasts for refresh/export/quick actions (Open System, Remote Access, Reboot, Maintenance Mode, View Alerts, Run Automation).

## Technical details
- **Primary files to update:** `src/config/navigation.tsx`, `src/App.tsx`, `src/data/mockData.ts`, `src/services/api.ts`, `src/pages/SystemsPage.tsx`.
- **Primary files to add:** `src/pages/RackVisionPage.tsx` + new `src/components/rackvision/*`.
- **State strategy:** local React state in page container + derived filtered collections; no backend state.
- **Routing strategy:** nested dashboard route for RackVision; direct parameterized system route for deep link.
- **Performance guardrails:** memoize derived rack/unit maps and filtered lists; keep visual components split and composable.

## Acceptance checklist
- RackVision appears under Dashboard and routes correctly.
- All four required views are present and coordinated.
- Hierarchy flow works: Global/Region → Site/DC → Room/Row → Rack → Device → Systems details.
- Rack elevation is realistic (U-based) with hover + click behaviors.
- Inspector updates by selected entity type.
- All data/actions are mock/frontend-only with service stubs.
- Visual style remains cohesive with existing Pulseway-style dashboard.
