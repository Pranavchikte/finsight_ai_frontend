// section-card.tsx
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <Card className={cn(
      "border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg",
      className
    )}>
      {children}
    </Card>
  );
}