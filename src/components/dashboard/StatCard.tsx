import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-5 transition-all duration-200 hover:shadow-card animate-fade-in",
        variant === "default" && "bg-card shadow-soft",
        variant === "primary" && "bg-gradient-hero text-primary-foreground",
        variant === "accent" && "bg-horse-sage text-accent-foreground"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "opacity-90"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p
              className={cn(
                "text-xs",
                variant === "default" ? "text-muted-foreground" : "opacity-80"
              )}
            >
              {subtitle}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium flex items-center gap-1",
                trend.isPositive ? "text-horse-sage" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="opacity-70">vs mês anterior</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-lg",
            variant === "default" && "bg-muted",
            variant === "primary" && "bg-primary-foreground/10",
            variant === "accent" && "bg-accent-foreground/10"
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
