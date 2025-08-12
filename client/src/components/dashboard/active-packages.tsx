import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { PackageUsageModal } from "@/components/modals/package-usage-modal";
import { useState } from "react";

interface ActivePackage {
  id: string;
  customerId: string;
  packageTypeId: string;
  remainingUses: number;
  validUntil: string;
  purchasePrice: string;
  packageType?: {
    name: string;
    totalUses: number;
  };
  customer?: {
    name: string;
  };
}

export function ActivePackages() {
  const [selectedPackage, setSelectedPackage] = useState<ActivePackage | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);

  const { data: packages, isLoading } = useQuery<ActivePackage[]>({
    queryKey: ["/api/packages/active"],
  });

  const handleUsePackage = (pkg: ActivePackage) => {
    setSelectedPackage(pkg);
    setShowUsageModal(true);
  };

  const handleRenewPackage = (pkg: ActivePackage) => {
    // TODO: Implement package renewal
    console.log('Renewing package:', pkg.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUsagePercentage = (used: number, total: number) => {
    return ((total - used) / total) * 100;
  };

  const isExpiringSoon = (validUntil: string) => {
    const now = new Date();
    const expiry = new Date(validUntil);
    const daysDiff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Pacotes Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Pacotes Ativos
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-6 py-4 space-y-4">
          {!packages || packages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum pacote ativo no momento</p>
            </div>
          ) : (
            packages.slice(0, 3).map((pkg) => {
              const totalUses = pkg.packageType?.totalUses || 10;
              const usedCount = totalUses - pkg.remainingUses;
              const usagePercent = getUsagePercentage(pkg.remainingUses, totalUses);
              const isExpiring = isExpiringSoon(pkg.validUntil);
              
              return (
                <div 
                  key={pkg.id}
                  className={cn(
                    "border rounded-lg p-4 transition-all hover:shadow-md",
                    isExpiring ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
                  )}
                  data-testid={`package-${pkg.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900 text-sm" data-testid={`package-name-${pkg.id}`}>
                        {pkg.packageType?.name || "Pacote"}
                      </h4>
                      <p className="text-xs text-gray-600" data-testid={`customer-name-${pkg.id}`}>
                        Cliente: {pkg.customer?.name || "Cliente"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900" data-testid={`package-price-${pkg.id}`}>
                        R$ {pkg.purchasePrice}
                      </span>
                      {isExpiring && (
                        <div className="text-xs text-red-600 font-medium">
                          Expira em breve!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar with enhanced styling */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 font-medium">Usos</span>
                      <span className="font-semibold text-gray-800" data-testid={`usage-count-${pkg.id}`}>
                        {pkg.remainingUses}/{totalUses}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={cn(
                          "h-3 rounded-full transition-all duration-300",
                          pkg.remainingUses <= 1 ? "bg-red-500" : 
                          pkg.remainingUses <= 2 ? "bg-yellow-500" : "bg-blue-500"
                        )}
                        style={{ width: `${((totalUses - pkg.remainingUses) / totalUses) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(((totalUses - pkg.remainingUses) / totalUses) * 100)}% utilizado
                    </div>
                  </div>
                  
                  {/* Date and Actions */}
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="text-gray-500">Válido até: </span>
                      <span 
                        className={cn(
                          "font-medium",
                          isExpiring ? "text-red-600" : "text-gray-700"
                        )}
                        data-testid={`valid-until-${pkg.id}`}
                      >
                        {formatDate(pkg.validUntil)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-xs py-1.5 h-auto"
                        onClick={() => handleUsePackage(pkg)}
                        data-testid={`button-use-${pkg.id}`}
                      >
                        Usar
                      </Button>
                      
                      {(isExpiring || pkg.remainingUses <= 1) && (
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 text-xs py-1.5 h-auto"
                          onClick={() => handleRenewPackage(pkg)}
                          data-testid={`button-renew-${pkg.id}`}
                        >
                          Renovar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
        
        {packages && packages.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <button 
              className="text-sm font-medium text-primary hover:text-primary/80"
              data-testid="button-view-all-packages"
            >
              Ver todos os pacotes →
            </button>
          </div>
        )}
      </Card>

      {/* Package Usage Modal */}
      <PackageUsageModal 
        open={showUsageModal}
        onOpenChange={setShowUsageModal}
        package={selectedPackage}
      />
    </>
  );
}
