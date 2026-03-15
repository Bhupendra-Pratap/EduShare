import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, iconColor = "bg-navy-950", trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-body font-semibold text-ink-500 uppercase tracking-wide">{title}</p>
        <p className="font-display text-2xl font-semibold text-ink-900 mt-0.5">{value}</p>
        {trend && (
          <p className={cn("text-xs font-body mt-1", trendUp ? "text-emerald-600" : "text-red-500")}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
