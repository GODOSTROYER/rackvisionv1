import {
  Activity,
  BadgeCheck,
  Boxes,
  Cable,
  ChartColumn,
  ClipboardList,
  FileBarChart2,
  FileClock,
  Gauge,
  Globe,
  LayoutDashboard,
  Network,
  Server,
  Settings,
  Shield,
  UserRound,
  Users,
  WandSparkles,
} from "lucide-react";

export type NavItem = {
  label: string;
  to?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; to: string }[];
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Core Assets",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        children: [
          { label: "View", to: "/dashboard/view" },
          { label: "Manage", to: "/dashboard/manage" },
          { label: "RackVision", to: "/dashboard/rackvision" },
        ],
      },
      { label: "Client Portal", to: "/client-portal", icon: Users },
      { label: "Systems", to: "/systems", icon: Server },
      { label: "Networks", to: "/networks", icon: Network },
      { label: "Automation", to: "/automation", icon: WandSparkles },
      { label: "Reporting", to: "/reporting", icon: FileBarChart2 },
      { label: "Advanced Reporting", to: "/advanced-reporting", icon: ChartColumn },
      { label: "Integrations", to: "/integrations", icon: Cable },
      { label: "Endpoint Protection", to: "/endpoint-protection", icon: Shield },
      { label: "Patch Management", to: "/patch-management", icon: Boxes },
    ],
  },
  {
    label: "Accounting",
    items: [
      { label: "Server Admin", to: "/server-admin", icon: BadgeCheck },
      { label: "Configuration", to: "/configuration", icon: Settings },
      { label: "Account", to: "/account", icon: UserRound },
      { label: "Onboarding", to: "/onboarding", icon: ClipboardList },
    ],
  },
];

export const topbarQuickLinks = [
  { label: "Operations", icon: Gauge },
  { label: "Global", icon: Globe },
  { label: "Health", icon: Activity },
  { label: "Schedule", icon: FileClock },
];
