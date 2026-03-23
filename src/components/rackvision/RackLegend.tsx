export function RackLegend() {
  const items = ["1U Server", "2U Server", "4U Appliance", "Storage", "ToR Switch", "Firewall", "PDU", "Blank Panel"];

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rack Legend</p>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-border px-2 py-1">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
