import { useQuery } from "@tanstack/react-query";

interface DashboardMetrics {
  activePackages: number;
  renewalsThisMonth: number;
  churnRate: number;
  riskyClients: number;
}

export function useDashboardData() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: actionQueue, isLoading: actionQueueLoading } = useQuery<any[]>({
    queryKey: ["/api/dashboard/action-queue"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery<any[]>({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery<any[]>({
    queryKey: ["/api/dashboard/revenue"],
  });

  return {
    metrics,
    actionQueue,
    recentActivity,
    revenue,
    isLoading: metricsLoading || actionQueueLoading || activityLoading || revenueLoading,
  };
}
