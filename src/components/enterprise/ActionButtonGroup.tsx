import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function ActionButtonGroup({ actions }: { actions: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action}
          variant="outline"
          size="sm"
          onClick={() => toast({ title: `${action} queued`, description: "Placeholder action completed." })}
        >
          {action}
        </Button>
      ))}
    </div>
  );
}
