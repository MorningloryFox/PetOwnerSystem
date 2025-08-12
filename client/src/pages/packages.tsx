import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Package, DollarSign, Calendar, Users } from "lucide-react";
import { PackageModal } from "@/components/modals/package-modal-enhanced";

interface PackageType {
  id: string;
  name: string;
  description: string;
  price: string;
  totalUses: number;
  validityDays: number;
  maxPets: number;
  active: boolean;
  createdAt: Date;
}

interface CustomerPackage {
  id: string;
  customerName: string;
  packageTypeName: string;
  purchaseDate: string;
  expiryDate: string;
  remainingUses: number;
  totalUses: number;
  status: string;
}

export default function Packages() {
  const [isNewPackageOpen, setIsNewPackageOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: packageTypes = [], isLoading } = useQuery<PackageType[]>({
    queryKey: ["/api/package-types"],
  });

  const { data: customerPackages = [] } = useQuery<CustomerPackage[]>({
    queryKey: ["/api/customer-packages"],
  });





  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/package-types/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/package-types"] });
      toast({
        title: "Pacote removido!",
        description: "Tipo de pacote excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Pacotes</h1>
          <p className="text-gray-600 mt-2">Gerencie tipos de pacotes e pacotes de clientes</p>
        </div>
        <Button 
          onClick={() => setIsNewPackageOpen(true)}
          data-testid="button-new-package"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Pacote
        </Button>
      </div>

      {/* Package Modal */}
      <PackageModal open={isNewPackageOpen} onOpenChange={setIsNewPackageOpen} />

      {/* Package Types List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Tipos de Pacotes ({packageTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando pacotes...</div>
          ) : packageTypes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum tipo de pacote cadastrado</p>
              <p className="text-sm mt-2">Clique em "Novo Pacote" para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Sessões</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packageTypes.map((packageType) => (
                  <TableRow key={packageType.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{packageType.name}</div>
                        <div className="text-sm text-gray-500">
                          {packageType.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        R$ {packageType.price}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {packageType.totalUses} sessões
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {packageType.validityDays} dias
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={packageType.active ? "default" : "secondary"}>
                        {packageType.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingPackage(packageType)}
                          data-testid={`button-edit-package-${packageType.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePackageMutation.mutate(packageType.id)}
                          data-testid={`button-delete-package-${packageType.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Packages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Pacotes de Clientes ({customerPackages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum pacote de cliente ativo</p>
              <p className="text-sm mt-2">Os pacotes comprados pelos clientes aparecerão aqui</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Usos Restantes</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerPackages.map((customerPackage) => {
                  const expiryDate = customerPackage.expiryDate ? new Date(customerPackage.expiryDate) : null;
                  const isExpiringSoon = expiryDate && expiryDate <= new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
                  const progressPercentage = customerPackage.totalUses ? 
                    ((customerPackage.totalUses - customerPackage.remainingUses) / customerPackage.totalUses) * 100 : 0;
                  
                  return (
                    <TableRow key={customerPackage.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium text-gray-900">{customerPackage.customerName || 'Cliente não identificado'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{customerPackage.packageTypeName || 'Pacote não identificado'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">
                              {customerPackage.remainingUses} / {customerPackage.totalUses || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {Math.round(progressPercentage)}% usado
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                progressPercentage > 80 ? 'bg-red-500' : 
                                progressPercentage > 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                            {expiryDate ? expiryDate.toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </div>
                          {expiryDate && (
                            <div className="text-xs text-gray-500">
                              {(() => {
                                const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expirado';
                              })()}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={customerPackage.status === 'ativo' ? 'default' : 'secondary'}
                          className={
                            customerPackage.status === 'ativo' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' :
                            customerPackage.status === 'expirado' ? 'bg-red-100 text-red-800 border-red-200' :
                            customerPackage.status === 'consumido' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }
                        >
                          {customerPackage.status === 'ativo' ? 'Ativo' : 
                           customerPackage.status === 'consumido' ? 'Consumido' :
                           customerPackage.status === 'expirado' ? 'Expirado' : 'Usado'}
                        </Badge>
                        {isExpiringSoon && customerPackage.status === 'ativo' && (
                          <div className="text-xs text-red-600 mt-1 font-medium">
                            ⚠️ Expira em breve
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal para criar novo pacote */}
      <PackageModal 
        open={isNewPackageOpen} 
        onOpenChange={setIsNewPackageOpen}
      />

      {/* Modal para editar pacote */}
      {editingPackage && (
        <PackageModal 
          open={!!editingPackage} 
          onOpenChange={(open) => !open && setEditingPackage(null)}
          editingPackage={editingPackage}
        />
      )}
    </div>
  );
}
