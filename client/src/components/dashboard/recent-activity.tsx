import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Plus, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  details: string;
  icon: string;
  color: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const iconMap = {
  check: Check,
  plus: Plus,
  refresh: RefreshCw,
  message: MessageSquare,
};

const colorMap = {
  green: "bg-green-100 text-green-600",
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
};

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-4 space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma atividade recente</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const IconComponent = iconMap[activity.icon as keyof typeof iconMap] || Check;
            const colorClass = colorMap[activity.color as keyof typeof colorMap] || colorMap.green;
            
            return (
              <div 
                key={index} 
                className="flex items-start space-x-3"
                data-testid={`activity-${index}`}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900" data-testid={`activity-title-${index}`}>
                    <span className="font-medium">{activity.title}</span> - {activity.description}
                  </p>
                  <p className="text-xs text-gray-500" data-testid={`activity-details-${index}`}>
                    {activity.details}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
