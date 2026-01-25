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
      "transition-all duration-200 hover:shadow-md",
      displayVariant === "warning" && "border-destructive/50 bg-destructive/5"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {displayVariant === "warning" ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          displayVariant === "warning" && "text-destructive flex items-center gap-2"
        )}>
          {value}
        </div>
        {displayVariant === "warning" && (
          <p className="text-xs text-destructive/80 mt-1">
            Your spending exceeds your income
          </p>
        )}
      </CardContent>
    </Card>
  );
}