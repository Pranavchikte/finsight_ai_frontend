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
      displayVariant === "warning" && "border-orange-500/30 bg-orange-500/5",
      displayVariant === "success" && "border-green-500/30 bg-green-500/5"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {displayVariant === "warning" && isNegative ? (
          <AlertTriangle className="h-4 w-4 text-destructive" />
        ) : (
          <Icon className={cn(
            "h-4 w-4",
            displayVariant === "warning" && "text-orange-500",
            displayVariant === "success" && "text-green-500",
            displayVariant === "default" && "text-muted-foreground"
          )} />
        )}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold",
          displayVariant === "warning" && isNegative && "text-destructive",
          displayVariant === "warning" && !isNegative && "text-orange-600",
          displayVariant === "success" && "text-green-600"
        )}>
          {value}
        </div>
        {displayVariant === "warning" && isNegative && (
          <p className="text-xs text-destructive/80 mt-1">
            Your spending exceeds your income
          </p>
        )}
      </CardContent>
    </Card>
  );
}