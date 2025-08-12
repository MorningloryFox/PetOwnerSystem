import { Menu, Bell, User, LogOut, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomerModal } from "@/components/modals/customer-modal-enhanced";
import { PackageModal } from "@/components/modals/package-modal-enhanced";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const toggleMobileSidebar = () => {
    const sidebar = document.getElementById('mobile-sidebar');
    const overlay = document.getElementById('mobile-sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.toggle('-translate-x-full');
      overlay.classList.toggle('hidden');
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={toggleMobileSidebar}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">PetManager Pro</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => setShowCustomerModal(true)}
                data-testid="button-new-customer"
              >
                Novo Cliente
              </Button>
              
              <Button 
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => setShowPackageModal(true)}
                data-testid="button-new-package"
              >
                Novo Pacote
              </Button>
              
              {/* Notifications */}
              <button 
                className="relative p-2 text-gray-600 hover:text-gray-900"
                data-testid="button-notifications"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white">
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-muted-foreground" disabled>
                    <Building className="mr-2 h-4 w-4" />
                    <span>{user?.company?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={async () => {
                      try {
                        await logout();
                        toast({
                          title: "Logout realizado",
                          description: "Você foi desconectado com sucesso.",
                        });
                      } catch (error) {
                        toast({
                          title: "Erro",
                          description: "Erro ao fazer logout.",
                          variant: "destructive",
                        });
                      }
                    }}
                    data-testid="menu-item-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        id="mobile-sidebar-overlay" 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden hidden z-40"
        onClick={toggleMobileSidebar}
      />

      {/* Modals */}
      <CustomerModal open={showCustomerModal} onOpenChange={setShowCustomerModal} />
      <PackageModal open={showPackageModal} onOpenChange={setShowPackageModal} />
    </>
  );
}
