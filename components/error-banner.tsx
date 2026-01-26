"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, onDismiss, className }: ErrorBannerProps) {
  return (
    <div className={cn(
      "bg-destructive/10 border border-destructive/50 rounded-lg p-4 mb-6 animate-fade-in-up",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-destructive mb-1">
            Something went wrong
          </p>
          <p className="text-sm text-destructive/80">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}