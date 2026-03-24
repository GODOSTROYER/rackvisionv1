type RackUnitLabelColumnProps = {
  totalUnits?: number;
};

export function RackUnitLabelColumn({ totalUnits = 42 }: RackUnitLabelColumnProps) {
  const units = Array.from({ length: totalUnits }, (_, index) => totalUnits - index);

  return (
    <div
      className="grid gap-px rounded-md border border-border bg-border p-px text-[10px]"
      style={{
        gridTemplateRows: `repeat(${totalUnits}, minmax(var(--rack-unit-height, 24px), var(--rack-unit-height, 24px)))`,
      }}
    >
      {units.map((unit) => (
        <div key={unit} className="flex min-h-[var(--rack-unit-height,24px)] items-center justify-end bg-background pr-1.5 text-muted-foreground">
          U{unit}
        </div>
      ))}
    </div>
  );
}
