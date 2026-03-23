import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/enterprise/PageHeader";
import { FilterBar } from "@/components/enterprise/FilterBar";
import { EnterpriseDataTable } from "@/components/enterprise/EnterpriseDataTable";
import { systemsRows } from "@/data/mockData";

export default function SystemsPage() {
  const [selected, setSelected] = useState(systemsRows[0]);

  return (
    <section className="space-y-4">
      <PageHeader
        title="Systems"
        subtitle="Device inventory with status and details drawer (mock)."
        actions={
          <Sheet>
            <SheetTrigger asChild>
              <Button>Open Device Details</Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-3xl">
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-4 lg:grid-cols-8">
                  {["overview", "performance", "services", "processes", "storage", "event logs", "software", "remote commands"].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="text-[11px] capitalize">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {["overview", "performance", "services", "processes", "storage", "event logs", "software", "remote commands"].map((tab) => (
                  <TabsContent key={tab} value={tab} className="rounded-md border border-border p-4 text-sm text-muted-foreground">
                    {tab} panel placeholder with realistic device telemetry UI.
                  </TabsContent>
                ))}
              </Tabs>
            </SheetContent>
          </Sheet>
        }
      />
      <FilterBar filters={["OS", "Status", "Group", "Site"]} />
      <EnterpriseDataTable
        columns={[
          { key: "id", label: "Device ID" },
          { key: "name", label: "Device" },
          { key: "os", label: "OS" },
          { key: "status", label: "Status" },
          { key: "group", label: "Group" },
          { key: "site", label: "Site" },
        ]}
        rows={systemsRows}
        statusKey="status"
      />
      <div className="hidden">{setSelected && selected.id}</div>
    </section>
  );
}
