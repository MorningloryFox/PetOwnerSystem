import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red";
  change?: string;
  changeText?: string;
  testId?: string;
  description?: string; // Descrição para o tooltip
}

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600", 
  red: "bg-red-100 text-red-600",
};

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeText,
  testId,
  description
}: MetricCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {description && <InfoTooltip content={description} />}
            </div>
            <p className="text-3xl font-bold text-gray-900" data-testid={`${testId}-value`}>
              {value}
            </p>
          </div>
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClasses[color])}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {change && changeText && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">{change}</span>
            <span className="text-gray-500 ml-1">{changeText}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
