import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  description?: string;
  className?: string;
  colorClass?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description, 
  className,
  colorClass = "bg-primary"
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold font-display tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl bg-opacity-10", colorClass.replace('bg-', 'bg-opacity-10 text-'))}>
           <Icon className={cn("w-6 h-6", colorClass.replace('bg-', 'text-'))} />
        </div>
      </div>
      {(trend || description) && (
        <div className="mt-4 flex items-center text-sm">
          {trend && (
            <span className="text-emerald-600 font-semibold mr-2">
              {trend}
            </span>
          )}
          {description && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}
