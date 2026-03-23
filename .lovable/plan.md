
### Product scope & delivery approach
Build a **frontend-only, high-fidelity SaaS admin prototype** with a cohesive Pulseway-style enterprise look, using static/mock data and service stubs only.  
Because scope is large, implementation will be delivered in **phases** while keeping design/system consistency from day one.

### Phase 1 — Core app shell + design system
1. Create the global app shell:
   - Fixed deep-blue top bar (logo, search, app launcher, notifications, help, settings, avatar, environment label).
   - Collapsible left sidebar with icon+label navigation and grouped sections.
   - Main content area with consistent paddings, max widths, and responsive breakpoints.
2. Establish visual system:
   - Light background, subtle borders/shadows, rounded cards, neutral text hierarchy, blue accent states.
   - Standard spacing, card heights, table density, badge styles, form controls, and hover/active states.
3. Add route structure for all requested pages and wire sidebar navigation with active state + expandable menu groups.

### Phase 2 — Shared reusable UI components
Build reusable components to ensure consistency across all pages:
- PageHeader
- KPIStatCard
- WidgetCard
- StatusBadge
- FilterBar + SearchBar
- EnterpriseDataTable (sticky header, sort/filter/search UI, row select, bulk actions, pagination)
- Tabs
- Modal
- Drawer / Inspector panel
- EmptyState
- Toast actions
- Dropdown menu
- DateRangePicker (UI behavior only)
- ChartWrapper (line/bar/donut)
- ActivityFeedItem
- ActionButtonGroup
- Loading skeleton patterns

### Phase 3 — Mock data + placeholder service layer
1. Create centralized mock data modules for:
   - devices, servers, workstations, patches, alerts, workflows, reports, tickets, integrations, threats, tasks, uptime/events.
2. Create `/services` or `/api` frontend stub layer with functions returning mock data only:
   - `getDashboardSummary()`, `getAlerts()`, `getPatchStatus()`, `getSystems()`, `getNetworkDevices()`,
     `getAutomationWorkflows()`, `getReports()`, `getThreats()`, `getIntegrations()`,
     `saveSettings()`, `exportReport()`, `runWorkflow()`, etc.
3. Use simulated loading states and placeholder success/error toasts for actions (no real side effects).

### Phase 4 — Main dashboard (Lab Environment)
Implement “Dashboard - View” as the flagship page with:
- KPI strip + enterprise widget grid:
  - Active Alerts, Patch Status, Last Alerts, Endpoint Health, Device Status, Automation Activity,
    Recent Tasks, System Uptime, Top Critical Devices, Patch Compliance, Network Summary, Quick Actions.
- Polished chart cards with legends, period selectors, and realistic mock values.
- Latest alerts table + recent system events feed.
- Balanced, non-cluttered layout with consistent card alignment and sizing.

### Phase 5 — Remaining feature pages (UI-only)
Implement all requested sections with cohesive UX and mock interactions:

1. **Dashboard - Manage**: widget library, drag/reorder affordances, saved layouts, visual settings.
2. **Client Portal**: ticket/support lists, KB area, chat placeholder, end-user device summary.
3. **Systems**: device table, filters, details drawer with tabs (Overview, Performance, Services, Processes, Storage, Event Logs, Software, Remote Commands).
4. **Networks**: network devices table, topology-style panel, SNMP panel, inspector side panel.
5. **Automation**: workflow list/detail, trigger-condition-action builder UI, templates, history, scripts, managed files.
6. **Reporting**: report list/templates, scheduling modal, preview cards, export UI actions.
7. **Advanced Reporting**: analytics dashboard, custom builder UI, chart config panel, saved views.
8. **Integrations**: marketplace grid, connected/disconnected states, config drawer/modal.
9. **Endpoint Protection**: security dashboard, threat timeline, policies, quarantine, incident panel.
10. **Patch Management**: compliance, policies, approval queue, history, agent/missing patches, maintenance windows.
11. **Server Admin**: server groups, admin controls, roles/permissions UI.
12. **Configuration**: grouped settings sections + placeholder save actions.
13. **Account**: org profile, billing summary, subscription cards, usage stats, team + role UI.
14. **Onboarding**: checklist flow, progress tracker, setup steps.

### Phase 6 — Interaction polish (still frontend-only)
- Sidebar collapse/expand with smooth transitions and icon-only mode.
- Parent menu expand/collapse behavior.
- Modal/drawer/tabs/dropdown interactions.
- Filter chips, table controls, fake loading transitions.
- Toast feedback for placeholder actions (“Saved”, “Export started”, “Workflow queued”).
- Responsive behavior for desktop-first layouts with tablet/mobile adaptations.

### Phase 7 — Final quality pass
- Visual consistency audit across all pages (spacing, typography, states, chart/card language).
- UX pass for hierarchy and scanability in dense admin screens.
- Component cleanup and folder organization for maintainability and backend handoff readiness.
- Ensure every backend-dependent touchpoint is routed through stubs for future integration.

### Implementation sequencing
1. Shell + routes + design tokens  
2. Shared components + table/chart wrappers  
3. Mock data + service stubs  
4. Dashboard View + Dashboard Manage  
5. Systems, Networks, Automation, Reporting  
6. Remaining pages  
7. Polish + responsiveness + QA
