// error-banner.tsx
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
      "bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 animate-fade-in backdrop-blur-sm",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-destructive mb-1">
            Something went wrong
          </p>
          <p className="text-sm text-destructive/90 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8 text-destructive hover:bg-destructive/10 transition-all"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}