import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationPanel } from "./NotificationPanel";
import { UserProfileModal } from "@/components/modals/UserProfileModal";

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar cavalos, clientes..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <NotificationPanel />
          <UserProfileModal />
        </div>
      </div>
    </header>
  );
}
