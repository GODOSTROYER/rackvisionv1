import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WidgetCardProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function WidgetCard({ title, action, children }: WidgetCardProps) {
  return (
    <Card className="h-full border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
