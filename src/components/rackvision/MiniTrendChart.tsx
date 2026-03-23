import { Area, AreaChart, ResponsiveContainer } from "recharts";

const data = [
  { value: 62 },
  { value: 58 },
  { value: 66 },
  { value: 64 },
  { value: 72 },
  { value: 70 },
];

export function MiniTrendChart() {
  return (
    <div className="h-14 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
