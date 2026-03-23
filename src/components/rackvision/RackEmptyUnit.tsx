type RackEmptyUnitProps = {
  unit: number;
  visible: boolean;
};

export function RackEmptyUnit({ unit, visible }: RackEmptyUnitProps) {
  return (
    <div
      className={visible ? "border-b border-border/70 bg-muted/30" : "border-b border-transparent bg-transparent"}
      style={{ gridRow: `${43 - unit} / span 1` }}
      aria-label={`U${unit} empty`}
    />
  );
}
