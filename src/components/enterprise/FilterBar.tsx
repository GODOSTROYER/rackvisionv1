import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterBarProps = {
  filters: string[];
};

export function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
      <Input placeholder="Search assets, tickets, workflows..." className="max-w-sm" />
      {filters.map((item, index) => (
        <Button key={item} variant={index === 0 ? "default" : "outline"} size="sm">
          {item}
        </Button>
      ))}
      <Button variant="ghost" size="sm" className="ml-auto">
        Clear
      </Button>
    </div>
  );
}
