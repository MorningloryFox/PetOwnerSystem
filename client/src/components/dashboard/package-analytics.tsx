import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Package, Users, TrendingUp, BarChart3 } from "lucide-react";

interface PackageAnalytics {
  packageTypes: {
    id: string;
    name: string;
    price: string;
    activeClients: number;
    totalRevenue: number;
    averageUsage: number;
  }[];
  mostUsedServices: {
    serviceName: string;
    usageCount: number;
    percentage: number;
  }[];
  overallStats: {
    totalActivePackages: number;
    totalActiveClients: number;
    averagePackageUtilization: number;
    monthlyRecurringRevenue: number;
  };
}

export function PackageAnalytics() {
  const { data: analytics, isLoading } = useQuery<PackageAnalytics>({
    queryKey: ["/api/analytics/packages"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Análise de Pacotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Análise de Pacotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Análise de Pacotes
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Pacotes Ativos</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {analytics.overallStats.totalActivePackages}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Clientes Ativos</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {analytics.overallStats.totalActiveClients}
            </div>
          </div>
        </div>

        {/* Tipos de Pacotes */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Pacotes por Tipo
          </h4>
          <div className="space-y-3">
            {analytics.packageTypes.map((packageType) => (
              <div key={packageType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{packageType.name}</h5>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {packageType.activeClients} clientes
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        R$ {packageType.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      R$ {packageType.price}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Uso Médio</span>
                    <span>{packageType.averageUsage}%</span>
                  </div>
                  <Progress 
                    value={packageType.averageUsage} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Serviços Mais Utilizados */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Serviços Mais Utilizados
          </h4>
          <div className="space-y-2">
            {analytics.mostUsedServices.map((service, index) => (
              <div key={service.serviceName} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {service.serviceName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {service.usageCount} usos
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {service.percentage}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas de Performance */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Métricas Chave</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Utilização Média</span>
              <div className="font-semibold text-gray-900">
                {analytics.overallStats.averagePackageUtilization}%
              </div>
            </div>
            <div>
              <span className="text-gray-600">Receita Mensal</span>
              <div className="font-semibold text-gray-900">
                R$ {analytics.overallStats.monthlyRecurringRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}