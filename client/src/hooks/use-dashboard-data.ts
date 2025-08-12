import { useQuery } from "@tanstack/react-query";

export function useDashboardData() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: actionQueue, isLoading: actionQueueLoading } = useQuery({
    queryKey: ["/api/dashboard/action-queue"],
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
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
