import { Heart, Calendar, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HorseCardProps {
  name: string;
  breed: string;
  age: string;
  status: "saudável" | "em tratamento" | "observação";
  imageUrl?: string;
  nextEvent?: string;
}

const statusConfig = {
  saudável: {
    color: "bg-horse-sage-light text-horse-sage",
    dot: "bg-horse-sage",
  },
  "em tratamento": {
    color: "bg-horse-gold-light text-horse-gold",
    dot: "bg-horse-gold",
  },
  observação: {
    color: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
};

export function HorseCard({
  name,
  breed,
  age,
  status,
  imageUrl,
  nextEvent,
}: HorseCardProps) {
  const config = statusConfig[status];

  return (
    <div className="group bg-card rounded-xl shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden animate-fade-in">
      {/* Image */}
      <div className="relative h-40 bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-horse-cream to-muted">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-16 w-16 text-horse-brown-light/30"
            >
              <path d="M22 10c0-1.5-1-3-2.5-3.5L17 6l-1-4-6 4-4 2c-1.5 1-2.5 2.5-2.5 4.5 0 1.5.5 3 1.5 4L6 18l1 3h2l1-3 2-1 3 1 1 3h2l1-3c1-1 1.5-2.5 1.5-4 0-1-.5-2-1.5-3l1.5-1Z" />
              <circle cx="18" cy="8" r="1" />
            </svg>
          </div>
        )}
        <Badge
          className={cn(
            "absolute top-3 left-3 gap-1.5 text-xs font-medium",
            config.color
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
          {status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">
            {breed} • {age}
          </p>
        </div>

        {owner && (
          <p className="text-xs text-muted-foreground">
            Proprietário: <span className="font-medium">{owner}</span>
          </p>
        )}

        {nextEvent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Calendar className="h-3.5 w-3.5 text-horse-sage" />
            <span>Próximo: {nextEvent}</span>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1 text-xs">
            Ver Detalhes
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
