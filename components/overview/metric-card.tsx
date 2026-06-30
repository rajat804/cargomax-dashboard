import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { IconType } from "react-icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: "increase" | "decrease";
  icon: IconType;
  description: string;
  trend?: "up" | "down";
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
  trend,
  className,
}: MetricCardProps) {
  const isPositive = changeType === "increase";
  const trendIcon = isPositive ? (
    <ArrowUp className="h-2.5 w-2.5" />
  ) : (
    <ArrowDown className="h-2.5 w-2.5" />
  );

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-gray-500 truncate">
              {title}
            </p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {value}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2 p-1.5 bg-gray-50 rounded-full">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className={cn(
              "text-[10px] font-medium inline-flex items-center gap-0.5",
              isPositive ? "text-green-600" : "text-red-600"
            )}
          >
            {trendIcon}
            {Math.abs(change)}%
          </span>
          <span className="text-[10px] text-gray-400 truncate">
            {description}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}