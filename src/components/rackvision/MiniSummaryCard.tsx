type MiniSummaryCardProps = {
  label: string;
  value: string;
};

export function MiniSummaryCard({ label, value }: MiniSummaryCardProps) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
