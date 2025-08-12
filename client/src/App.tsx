import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Packages from "@/pages/packages";
import Appointments from "@/pages/appointments";
import Reports from "@/pages/reports";
import Messages from "@/pages/messages";
import Support from "@/pages/support";
import ClientRequests from "@/pages/client-requests";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import { useAuth } from "@/hooks/useAuth";

function ProtectedRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">GP</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 font-inter antialiased flex">
      {/* Mobile Sidebar Overlay */}
      <div id="mobile-sidebar-overlay" className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden hidden z-40"></div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/customers" component={Customers} />
              <Route path="/packages" component={Packages} />
              <Route path="/appointments" component={Appointments} />
              <Route path="/reports" component={Reports} />
              <Route path="/messages" component={Messages} />
              <Route path="/support" component={Support} />
              <Route path="/client-requests" component={ClientRequests} />
              <Route path="/users" component={Users} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ProtectedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
