import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/enterprise/StatusBadge";

type KPIStatCardProps = {
  label: string;
  value: string;
  delta: string;
  tone?: string;
};

export function KPIStatCard({ label, value, delta, tone = "info" }: KPIStatCardProps) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
        <StatusBadge status={`${delta} vs last period`} />
        {tone && <div className="hidden">{tone}</div>}
      </CardContent>
    </Card>
  );
}
