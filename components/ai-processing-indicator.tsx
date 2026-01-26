"use client";

import { Loader2, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";

interface AIProcessingIndicatorProps {
  variant?: "badge" | "card";
}

export function AIProcessingIndicator({ variant = "badge" }: AIProcessingIndicatorProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate progress for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Cap at 90% until actual completion
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (variant === "badge") {
    return (
      <Badge variant="outline" className="font-medium animate-pulse border-purple-500/50 bg-purple-500/10">
        <Sparkles className="h-3 w-3 mr-1 text-purple-500" />
        AI Processing...
      </Badge>
    );
  }

  return (
    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            AI is processing your expense
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            Usually takes 3-5 seconds
          </p>
        </div>
      </div>
      <Progress value={progress} className="h-2" indicatorClassName="bg-purple-500" />
    </div>
  );
}