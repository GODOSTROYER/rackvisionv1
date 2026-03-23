import { toast } from "@/hooks/use-toast";

export async function runActionToast(actionLabel: string, description?: string) {
  toast({ title: actionLabel, description: "Executing mock action..." });
  await new Promise((resolve) => window.setTimeout(resolve, 420));
  toast({
    title: `${actionLabel} completed`,
    description: description ?? "This is a simulated UI-only action response.",
  });
}
