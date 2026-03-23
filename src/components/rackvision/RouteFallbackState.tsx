import { AlertCircle } from "lucide-react";

type RouteFallbackStateProps = {
  title: string;
  description: string;
};

export function RouteFallbackState({ title, description }: RouteFallbackStateProps) {
  return (
    <section className="grid min-h-[360px] place-items-center rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="space-y-2">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
