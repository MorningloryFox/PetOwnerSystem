import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RevenueItem {
  name: string;
  revenue: number;
  color: string;
}

interface RevenueChartProps {
  data: RevenueItem[];
}

const colorMap = {
  blue: { bg: "bg-blue-500", text: "text-blue-500" },
  green: { bg: "bg-green-500", text: "text-green-500" },
  purple: { bg: "bg-purple-500", text: "text-purple-500" },
  orange: { bg: "bg-orange-500", text: "text-orange-500" },
};

export function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map(item => item.revenue));
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPercentage = (revenue: number) => {
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Receita por Serviço
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-6 py-6">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum dado de receita disponível</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item, index) => {
              const colorClass = colorMap[item.color as keyof typeof colorMap] || colorMap.blue;
              const percentage = getPercentage(item.revenue);
              
              return (
                <div key={index} data-testid={`revenue-item-${index}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${colorClass.bg} rounded-full`}></div>
                      <span className="text-sm font-medium text-gray-700" data-testid={`service-name-${index}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900" data-testid={`service-revenue-${index}`}>
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Progress value={percentage} className="h-2" />
                  </div>
                </div>
              );
            })}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span 
                  className="text-lg font-bold text-primary" 
                  data-testid="total-revenue"
                >
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
