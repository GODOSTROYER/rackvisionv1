import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout/AppShell";
import DashboardViewPage from "@/pages/DashboardViewPage";
import DashboardManagePage from "@/pages/DashboardManagePage";
import RackVisionPage from "@/pages/RackVisionPage";
import ClientPortalPage from "@/pages/ClientPortalPage";
import SystemsPage from "@/pages/SystemsPage";
import NetworksPage from "@/pages/NetworksPage";
import AutomationPage from "@/pages/AutomationPage";
import ReportingPage from "@/pages/ReportingPage";
import AdvancedReportingPage from "@/pages/AdvancedReportingPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import EndpointProtectionPage from "@/pages/EndpointProtectionPage";
import PatchManagementPage from "@/pages/PatchManagementPage";
import ServerAdminPage from "@/pages/ServerAdminPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import AccountPage from "@/pages/AccountPage";
import OnboardingPage from "@/pages/OnboardingPage";
import SystemDetailsPage from "@/pages/SystemDetailsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<DashboardViewPage />} />
            <Route path="dashboard/view" element={<DashboardViewPage />} />
            <Route path="dashboard/manage" element={<DashboardManagePage />} />
            <Route path="dashboard/rackvision" element={<RackVisionPage />} />
            <Route path="dashboard/rackvision/region/:regionId" element={<RackVisionPage />} />
            <Route path="dashboard/rackvision/site/:siteId" element={<RackVisionPage />} />
            <Route path="dashboard/rackvision/rack/:rackId" element={<RackVisionPage />} />
            <Route path="client-portal" element={<ClientPortalPage />} />
            <Route path="systems" element={<SystemsPage />} />
            <Route path="systems/:systemId" element={<SystemDetailsPage />} />
            <Route path="networks" element={<NetworksPage />} />
            <Route path="automation" element={<AutomationPage />} />
            <Route path="reporting" element={<ReportingPage />} />
            <Route path="advanced-reporting" element={<AdvancedReportingPage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="endpoint-protection" element={<EndpointProtectionPage />} />
            <Route path="patch-management" element={<PatchManagementPage />} />
            <Route path="server-admin" element={<ServerAdminPage />} />
            <Route path="configuration" element={<ConfigurationPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="onboarding" element={<OnboardingPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
