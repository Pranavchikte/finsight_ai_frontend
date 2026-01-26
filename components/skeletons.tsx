import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px]" />
      </CardContent>
    </Card>
  );
}

export function TransactionCardSkeleton() {
  return (
    <Card className="mb-4">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export function TransactionTableSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
      <div className="p-6 border-b border-border/50">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BudgetSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AISummarySkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}