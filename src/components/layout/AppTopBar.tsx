import { Bell, Grid2x2, HelpCircle, Search, Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppTopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/70 bg-primary px-4 text-primary-foreground">
      <SidebarTrigger className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground" />
      <div className="min-w-fit text-sm font-semibold tracking-wide">Pulseway-style RMM dashboard</div>
      <div className="relative ml-3 hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-foreground/70" />
        <Input className="border-primary-foreground/20 bg-primary/40 pl-9 text-primary-foreground placeholder:text-primary-foreground/60" placeholder="Search devices, alerts, clients..." />
      </div>
      <div className="ml-auto flex items-center gap-1">
        {[Grid2x2, Bell, HelpCircle, Settings].map((Icon, idx) => (
          <Button key={idx} variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="hidden text-right text-xs lg:block">
          <p className="font-medium">Lab Environment</p>
          <p className="text-primary-foreground/70">Production</p>
        </div>
        <Avatar className="h-8 w-8 border border-primary-foreground/30">
          <AvatarFallback className="bg-primary/70 text-xs text-primary-foreground">IT</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
