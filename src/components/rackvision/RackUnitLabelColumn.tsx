type RackUnitLabelColumnProps = {
  totalUnits?: number;
};

export function RackUnitLabelColumn({ totalUnits = 42 }: RackUnitLabelColumnProps) {
  const units = Array.from({ length: totalUnits }, (_, index) => totalUnits - index);

  return (
    <div className="grid h-full grid-rows-[repeat(42,minmax(0,1fr))] gap-px rounded-md border border-border bg-border p-px text-[10px]">
      {units.map((unit) => (
        <div key={unit} className="flex items-center justify-end bg-background pr-1.5 text-muted-foreground">
          U{unit}
        </div>
      ))}
    </div>
  );
}
