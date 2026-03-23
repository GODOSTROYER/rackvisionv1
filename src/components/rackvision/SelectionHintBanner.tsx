type SelectionHintBannerProps = {
  text: string;
};

export function SelectionHintBanner({ text }: SelectionHintBannerProps) {
  return (
    <div className="rounded-lg border border-border bg-accent/60 px-3 py-2 text-xs text-accent-foreground">
      {text}
    </div>
  );
}
