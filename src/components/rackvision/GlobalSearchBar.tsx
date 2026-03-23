import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type GlobalSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function GlobalSearchBar({ value, onChange }: GlobalSearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search hostname, system ID, rack ID, site, IP"
        className="pl-8"
      />
    </div>
  );
}
