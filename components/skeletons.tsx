// skeletons.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <Skeleton className="h-3 w-24 bg-muted/50" />
        <Skeleton className="h-9 w-9 rounded-lg bg-muted/50" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-32 bg-muted/50" />
      </CardContent>
    </Card>
  );
}

export function TransactionCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-muted/50" />
            <Skeleton className="h-3 w-1/2 bg-muted/50" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <Skeleton className="h-6 w-24 rounded-full bg-muted/50" />
          <Skeleton className="h-6 w-20 bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="border border-border/50 bg-card/80 backdrop-blur-sm rounded-lg overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-4 w-1/4 bg-muted/50" />
            <Skeleton className="h-6 w-24 rounded-full bg-muted/50" />
            <Skeleton className="h-4 w-24 bg-muted/50 ml-auto" />
            <Skeleton className="h-4 w-28 bg-muted/50" />
            <Skeleton className="h-8 w-8 rounded-md bg-muted/50" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetSkeleton() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <Skeleton className="h-6 w-40 bg-muted/50" />
        <Skeleton className="h-8 w-24 rounded-md bg-muted/50" />
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 p-4 rounded-lg bg-muted/20">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 bg-muted/50" />
                <Skeleton className="h-3 w-20 bg-muted/50" />
              </div>
              <Skeleton className="h-5 w-16 bg-muted/50" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full bg-muted/50" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AISummarySkeleton() {
  return (
    <Card className="border-ai-accent/20 bg-card/80 backdrop-blur-sm animate-pulse">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg bg-muted/50" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 bg-muted/50" />
            <Skeleton className="h-3 w-64 bg-muted/50" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 p-5 bg-muted/30 rounded-lg">
          <Skeleton className="h-3 w-full bg-muted/50" />
          <Skeleton className="h-3 w-full bg-muted/50" />
          <Skeleton className="h-3 w-3/4 bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}