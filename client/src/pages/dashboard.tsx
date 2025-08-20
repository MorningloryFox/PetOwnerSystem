import { MetricCard } from "@/components/dashboard/metric-card";
import { ActionQueue } from "@/components/dashboard/action-queue";
import { PackageAnalytics } from "@/components/dashboard/package-analytics";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, RefreshCw, TrendingDown, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { metrics, actionQueue, recentActivity, revenue, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Pacotes Ativos"
          value={metrics?.activePackages || 0}
          icon={Package}
          color="blue"
          testId="metric-active-packages"
          description="Número total de pacotes de serviços que estão atualmente ativos e válidos. Inclui todos os pacotes comprados pelos clientes que ainda têm usos disponíveis e não expiraram."
        />
        
        <MetricCard
          title="Renovações/Mês"
          value={metrics?.renewalsThisMonth || 0}
          icon={RefreshCw}
          color="green"
          testId="metric-renewals"
          description="Quantidade de clientes que renovaram seus pacotes neste mês. Uma renovação acontece quando um cliente compra um novo pacote antes ou depois do anterior expirar."
        />
        
        <MetricCard
          title="Taxa de Churn"
          value={`${metrics?.churnRate || 0}%`}
          icon={TrendingDown}
          color="orange"
          testId="metric-churn"
          description="Porcentagem de clientes que cancelaram ou não renovaram seus pacotes nos últimos 30 dias. Calculado como: (clientes perdidos / total de clientes ativos) x 100."
        />
        
        <MetricCard
          title="Clientes em Risco"
          value={metrics?.riskyClients || 0}
          icon={AlertTriangle}
          color="red"
          testId="metric-risky-clients"
          description="Clientes que estão próximos de perder interesse ou cancelar. Inclui aqueles com pacotes vencendo em 7 dias, baixo uso recente ou histórico de atrasos nos agendamentos."
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Action Queue */}
        <div className="lg:col-span-2">
          <ActionQueue items={actionQueue || []} />
        </div>

        {/* Active Packages */}
        <div>
          <PackageAnalytics />
        </div>
      </div>

      {/* Recent Activity & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity activities={recentActivity || []} />
        <RevenueChart data={revenue || []} />
      </div>
    </div>
  );
}
