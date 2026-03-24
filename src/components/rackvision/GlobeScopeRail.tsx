import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ChevronRight, Globe2, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { cn } from "@/lib/utils";

export type GlobeScopeRailItem = {
  id: string;
  kind: "country" | "site";
  label: string;
  subtitle?: string;
  healthStatus: string;
  accent?: "healthy" | "warning" | "critical" | "offline" | "maintenance" | "info";
  metrics: Array<{ label: string; value: string | number }>;
  note?: string;
  secondaryActionLabel?: string;
  disabled?: boolean;
};

export type GlobeScopeRailProps = {
  title?: string;
  description?: string;
  items: GlobeScopeRailItem[];
  activeScopeId: string | null;
  onSelectScope: (item: GlobeScopeRailItem) => void;
  onSecondaryAction?: (item: GlobeScopeRailItem) => void;
  onHoverScope?: (id: string | null) => void;
  emptyLabel?: string;
  className?: string;
};

function getAccentTone(accent: GlobeScopeRailItem["accent"], active: boolean): string {
  if (active) {
    return "border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.08)]";
  }

  switch (accent) {
    case "critical":
      return "border-[hsl(var(--critical)/0.28)] bg-[hsl(var(--critical)/0.06)]";
    case "warning":
      return "border-[hsl(var(--warning)/0.28)] bg-[hsl(var(--warning)/0.06)]";
    case "offline":
      return "border-[hsl(var(--offline)/0.28)] bg-[hsl(var(--offline)/0.06)]";
    case "maintenance":
      return "border-[hsl(var(--muted-foreground)/0.18)] bg-muted/30";
    case "info":
      return "border-[hsl(var(--info)/0.24)] bg-[hsl(var(--info)/0.06)]";
    case "healthy":
    default:
      return "border-border bg-card";
  }
}

function getScopeIcon(kind: GlobeScopeRailItem["kind"], active: boolean) {
  const iconClass = active ? "text-primary" : "text-muted-foreground";
  return kind === "country" ? <Globe2 className={cn("h-4 w-4", iconClass)} /> : <MapPin className={cn("h-4 w-4", iconClass)} />;
}

export function GlobeScopeRail({
  title = "Scope navigator",
  description = "Keyboard-friendly country and site jump list for the globe.",
  items,
  activeScopeId,
  onSelectScope,
  onSecondaryAction,
  onHoverScope,
  emptyLabel = "No globe scopes available for the current context.",
  className,
}: GlobeScopeRailProps) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(() => Math.max(0, items.findIndex((item) => item.id === activeScopeId)));

  const activeIndex = useMemo(() => items.findIndex((item) => item.id === activeScopeId), [activeScopeId, items]);

  useEffect(() => {
    if (!items.length) {
      setFocusedIndex(0);
      return;
    }

    if (activeIndex >= 0) {
      setFocusedIndex(activeIndex);
    }
  }, [activeIndex, items.length]);

  const focusItemAt = (nextIndex: number) => {
    if (!items.length) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(items.length - 1, nextIndex));
    setFocusedIndex(clampedIndex);
    itemRefs.current[clampedIndex]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!items.length) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusItemAt(focusedIndex + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusItemAt(focusedIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        focusItemAt(0);
        break;
      case "End":
        event.preventDefault();
        focusItemAt(items.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <aside
      className={cn(
        "space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm",
        "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]",
        className,
      )}
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground">
          {items.length} scopes
        </div>
      </div>

      {items.length ? (
        <div className="space-y-2" onKeyDown={handleKeyDown}>
          {items.map((item, index) => {
            const isActive = item.id === activeScopeId;
            const isFocused = index === focusedIndex;

            return (
              <div
                key={item.id}
                className={cn("overflow-hidden rounded-lg border transition-all", getAccentTone(item.accent, isActive))}
                onMouseEnter={() => onHoverScope?.(item.id)}
                onMouseLeave={() => onHoverScope?.(null)}
              >
                <div className={cn("grid gap-3 p-3", "sm:grid-cols-[minmax(0,1fr)_auto]")}>
                  <button
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    type="button"
                    onClick={() => onSelectScope(item)}
                    onFocus={() => setFocusedIndex(index)}
                    className={cn(
                      "flex min-w-0 items-start gap-3 text-left outline-none transition-colors",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isActive ? "bg-primary/5" : "hover:bg-muted/30",
                    )}
                    aria-pressed={isActive}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`${item.label}, ${item.healthStatus}`}
                    disabled={item.disabled}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border",
                        isActive ? "border-primary/40 bg-primary/10" : "border-border bg-background/80",
                      )}
                    >
                      {getScopeIcon(item.kind, isActive)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                        <StatusBadge status={item.healthStatus} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {item.kind === "country" ? "Country scope" : "Site scope"}
                        </span>
                        {item.subtitle ? <span>{item.subtitle}</span> : null}
                      </div>

                      {item.note ? <p className="text-xs text-muted-foreground">{item.note}</p> : null}

                      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
                        {item.metrics.map((metric) => (
                          <div key={metric.label} className="rounded-md border border-border bg-background/70 px-2 py-1">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                            <p className="text-sm font-semibold text-foreground">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center justify-end gap-2 self-start sm:self-center">
                    {item.secondaryActionLabel && onSecondaryAction ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => onSecondaryAction(item)}
                        disabled={item.disabled}
                      >
                        {item.secondaryActionLabel}
                      </Button>
                    ) : null}
                    <span className={cn("text-[11px] text-muted-foreground", isFocused ? "text-foreground" : null)}>
                      {isActive ? "Selected" : "Open"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </aside>
  );
}
