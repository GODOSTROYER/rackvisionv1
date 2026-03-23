import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = ["overview", "performance", "alerts", "remote-actions", "inventory"];

export function SystemTabsPlaceholder() {
  return (
    <Tabs defaultValue="overview" className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <TabsList className="grid h-auto grid-cols-2 gap-1 md:grid-cols-5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="text-xs capitalize">
            {tab.replace("-", " ")}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-3 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          {tab.replace("-", " ")} panel placeholder for system operations.
        </TabsContent>
      ))}
    </Tabs>
  );
}
