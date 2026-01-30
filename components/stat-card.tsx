import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: "default" | "warning" | "success";
}

export function StatCard({ title, value, icon: Icon, variant = "default" }: StatCardProps) {
  const isNegative = value.includes("-");
  const displayVariant = isNegative ? "warning" : variant;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 ease-out group card-hover",
      "border-border/50 bg-card/80 backdrop-blur-sm",
      displayVariant === "warning" && "border-destructive/20 bg-card",
      displayVariant === "success" && "border-success/20 bg-card"
    )}>
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        displayVariant === "default" && "bg-gradient-to-br from-card-elevated/50 to-transparent",
        displayVariant === "warning" && "bg-gradient-to-br from-destructive/5 to-transparent",
        displayVariant === "success" && "bg-gradient-to-br from-success/5 to-transparent"
      )} />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          {title}
        </CardTitle>
        
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200",
          "group-hover:scale-110 group-hover:shadow-lg",
          displayVariant === "default" && "bg-muted/50",
          displayVariant === "warning" && isNegative && "bg-destructive/10",
          displayVariant === "warning" && !isNegative && "bg-warning/10",
          displayVariant === "success" && "bg-success/10"
        )}>
          {displayVariant === "warning" && isNegative ? (
            <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
          ) : (
            <Icon className={cn(
              "h-4 w-4",
              displayVariant === "warning" && "text-warning",
              displayVariant === "success" && "text-success",
              displayVariant === "default" && "text-muted-foreground"
            )} />
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className={cn(
          "text-3xl font-bold tracking-tight transition-all duration-200",
          "group-hover:scale-105",
          displayVariant === "warning" && isNegative && "text-destructive",
          displayVariant === "warning" && !isNegative && "text-warning",
          displayVariant === "success" && "text-success",
          displayVariant === "default" && "text-foreground"
        )}>
          {value}
        </div>
        
        {displayVariant === "warning" && isNegative && (
          <div className="mt-2 flex items-center gap-1.5 animate-fade-in">
            <div className="h-1 w-1 rounded-full bg-destructive animate-pulse" />
            <p className="text-xs text-destructive/90 font-medium">
              Spending exceeds income
            </p>
          </div>
        )}
      </CardContent>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300",
        "opacity-0 group-hover:opacity-100",
        displayVariant === "default" && "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
        displayVariant === "warning" && "bg-gradient-to-r from-transparent via-destructive/50 to-transparent",
        displayVariant === "success" && "bg-gradient-to-r from-transparent via-success/50 to-transparent"
      )} />
    </Card>
  );
}