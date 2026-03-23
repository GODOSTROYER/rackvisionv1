import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function UptimeLineChart({ data }: { data: { name: string; uptime: number }[] }) {
  return (
    <ChartContainer config={{ uptime: { label: "Uptime", color: "hsl(var(--info))" } }} className="h-52 w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey="uptime" type="monotone" stroke="var(--color-uptime)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ChartContainer>
  );
}

export function IncidentBarChart({ data }: { data: { name: string; incidents: number }[] }) {
  return (
    <ChartContainer config={{ incidents: { label: "Incidents", color: "hsl(var(--warning))" } }} className="h-52 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="incidents" fill="var(--color-incidents)" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}

export function HealthDonutChart({ data }: { data: { name: string; value: number; fill: string }[] }) {
  return (
    <ChartContainer config={{}} className="h-52 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={84} strokeWidth={2} />
        <ChartLegend content={<ChartLegendContent />} />
      </PieChart>
    </ChartContainer>
  );
}
