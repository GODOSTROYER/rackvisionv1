import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type HierarchySearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HierarchySearchInput({ value, onChange }: HierarchySearchInputProps) {
  return (
    <div className="sticky top-0 z-10 bg-card pb-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search region, site, rack, device, IP..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
