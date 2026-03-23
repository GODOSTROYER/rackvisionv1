import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DateRangePickerStub() {
  return (
    <Button variant="outline" className="gap-2">
      <CalendarRange className="h-4 w-4" /> Last 7 days
    </Button>
  );
}
