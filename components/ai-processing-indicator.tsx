// ai-processing-indicator.tsx
"use client";

import { Loader2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AIProcessingIndicatorProps {
  variant?: "badge" | "card";
}

export function AIProcessingIndicator({ variant = "badge" }: AIProcessingIndicatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (variant === "badge") {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "font-medium gap-1.5",
          "border-ai-accent/30 bg-ai-accent/10 text-ai-accent",
          "animate-pulse"
        )}
      >
        <Sparkles className="h-3 w-3" />
        AI Processing
      </Badge>
    );
  }

  return (
    <div className="bg-ai-accent/5 border border-ai-accent/20 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-ai-accent/10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-ai-accent animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            AI is processing your expense
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <Clock className="h-3 w-3" />
            Usually takes 3-5 seconds
          </p>
        </div>
      </div>
      <Progress 
        value={progress} 
        className="h-1.5 bg-muted/30" 
        indicatorClassName="bg-gradient-to-r from-ai-accent to-purple-500 transition-all duration-500"
      />
    </div>
  );
}