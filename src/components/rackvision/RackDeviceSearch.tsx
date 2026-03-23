import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type RackDeviceSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function RackDeviceSearch({ value, onChange }: RackDeviceSearchProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search hostname or IP"
        className="h-9 pl-9"
      />
    </div>
  );
}
