import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { BackToRackVisionBanner } from "@/components/rackvision/BackToRackVisionBanner";
import { RouteFallbackState } from "@/components/rackvision/RouteFallbackState";
import { SystemDetailsHeader } from "@/components/rackvision/SystemDetailsHeader";
import { SystemMetricsCards } from "@/components/rackvision/SystemMetricsCards";
import { SystemTabsPlaceholder } from "@/components/rackvision/SystemTabsPlaceholder";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MockDataService } from "@/services/rackvision/MockDataService";
import { SystemDetails } from "@/components/rackvision/types";

export default function SystemDetailsPage() {
  const { systemId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<SystemDetails | null>(null);

  const backPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("back") ?? "/dashboard/rackvision";
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      if (!systemId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const payload = await MockDataService.getSystemDetails(systemId);
      setDetails(payload);
      setLoading(false);
    };
    load();
  }, [systemId]);

  if (loading) {
    return (
      <section className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-20" />
        <Skeleton className="h-28" />
      </section>
    );
  }

  if (!details) {
    return <RouteFallbackState title="System not found" description="The requested system identifier is missing from mock inventory." />;
  }

  return (
    <section className="space-y-3">
      <BackToRackVisionBanner href={backPath} />
      <SystemDetailsHeader details={details} />
      <SystemMetricsCards details={details} />
      <SystemTabsPlaceholder />
      <div className="rounded-xl border border-border bg-card p-3 text-xs text-muted-foreground">
        <p>Placeholder route-level system details integrated from RackVision actions and search results.</p>
        <Button asChild variant="link" className="h-auto p-0 text-xs">
          <Link to={`/dashboard/rackvision/rack/${details.rackId}`}>Jump to Rack {details.rackName}</Link>
        </Button>
      </div>
    </section>
  );
}
