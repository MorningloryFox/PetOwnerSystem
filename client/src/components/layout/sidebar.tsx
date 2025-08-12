import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Package,
  Calendar,
  BarChart3,
  MessageSquare,
  HelpCircle,
  Bell,
  Settings,
  X
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Clientes", href: "/customers", icon: Users },
  { name: "Pacotes", href: "/packages", icon: Package },
  { name: "Agendamentos", href: "/appointments", icon: Calendar },
  { name: "Relatórios", href: "/reports", icon: BarChart3 },
  { name: "Mensagens", href: "/messages", icon: MessageSquare },
  { name: "Suporte", href: "/support", icon: HelpCircle },
  { name: "Solicitações", href: "/client-requests", icon: Bell },
  { name: "Usuários", href: "/users", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  const closeMobileSidebar = () => {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.add('-translate-x-full');
      overlay.classList.add('hidden');
    }
  };

  return (
    <div 
      id="mobile-sidebar" 
      className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform -translate-x-full transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0 z-50"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Gloss Pet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            onClick={closeMobileSidebar}
            data-testid="button-close-sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={closeMobileSidebar}
                  data-testid={`link-${item.name.toLowerCase()}`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile - Removed name, keeping only icon in header */}
      </div>
    </div>
  );
}
