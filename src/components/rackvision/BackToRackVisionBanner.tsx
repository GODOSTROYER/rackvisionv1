import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type BackToRackVisionBannerProps = {
  href: string;
  label?: string;
};

export function BackToRackVisionBanner({ href, label = "Back to RackVision" }: BackToRackVisionBannerProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-2">
      <Button asChild variant="outline" size="sm">
        <Link to={href}>
          <ArrowLeft className="mr-1 h-4 w-4" /> {label}
        </Link>
      </Button>
    </div>
  );
}
