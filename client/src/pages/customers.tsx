import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Phone, Mail, MapPin, User, Heart, PawPrint } from "lucide-react";
import { CustomerModal } from "@/components/modals/customer-modal-enhanced";
import { PetModal } from "@/components/modals/pet-modal-enhanced";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Customer {
  id: string;
  companyId: string;
  name: string;
  email: string | null;
  phone: string;
  notes: string | null;
  address: string | null;
  cep: string | null;
  city: string | null;
  state: string | null;
  neighborhood: string | null;
  complement: string | null;
  createdAt: Date;
  petCount: number;
}

interface Pet {
  id: string;
  customerId: string;
  customerName?: string;
  name: string;
  species: string;
  breed: string | null;
  color: string | null;
  gender: string | null;
  birthDate: Date | null;
  weight: number | null;
  notes: string | null;
  specialNeeds: string | null;
  preferredFood: string | null;
  createdAt: Date;
}

export default function Customers() {
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isNewPetOpen, setIsNewPetOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [activeTab, setActiveTab] = useState("customers");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: pets = [], isLoading: petsLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/customers/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente removido!",
        description: "Cliente excluído com sucesso.",
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

  const deletePetMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/pets/${id}`, "DELETE", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Pet removido!",
        description: "Pet excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o pet.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestão de Clientes & Pets</h1>
          <p className="text-gray-600 mt-2">Gerencie clientes, pets e relacionamentos</p>
        </div>
        <div className="flex gap-2">
          {/* Desktop Buttons */}
          <div className="hidden sm:flex gap-2">
            <Button
              onClick={() => setIsNewCustomerOpen(true)}
              data-testid="button-new-customer"
              variant={activeTab === "customers" ? "default" : "outline"}
            >
              <User className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
            <Button
              onClick={() => setIsNewPetOpen(true)}
              data-testid="button-new-pet"
              variant={activeTab === "pets" ? "default" : "outline"}
            >
              <PawPrint className="w-4 h-4 mr-2" />
              Novo Pet
            </Button>
          </div>

          {/* Mobile Compact Buttons */}
          <div className="flex sm:hidden gap-2 w-full">
            <Button
              onClick={() => setIsNewCustomerOpen(true)}
              data-testid="button-new-customer-mobile"
              variant={activeTab === "customers" ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <User className="w-4 h-4 mr-1" />
              Cliente
            </Button>
            <Button
              onClick={() => setIsNewPetOpen(true)}
              data-testid="button-new-pet-mobile"
              variant={activeTab === "pets" ? "default" : "outline"}
              size="sm"
              className="flex-1"
            >
              <PawPrint className="w-4 h-4 mr-1" />
              Pet
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs para Clientes e Pets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Clientes ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <PawPrint className="w-4 h-4" />
            Pets ({pets.length})
          </TabsTrigger>
        </TabsList>

        {/* Aba de Clientes */}
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Clientes Cadastrados ({customers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customersLoading ? (
                <div className="text-center py-8">Carregando clientes...</div>
              ) : customers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum cliente cadastrado</p>
                  <p className="text-sm mt-2">Clique em "Novo Cliente" para começar</p>
                </div>
              ) : (
                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Pets</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Mail className="w-3 h-3 mr-1" />
                          {customer.email || "Não informado"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-red-500" />
                        <span className="font-medium">{customer.petCount || 0}</span>
                        <span className="text-sm text-gray-500 ml-1">
                          {customer.petCount === 1 ? 'pet' : 'pets'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {customer.neighborhood && customer.city ? `${customer.neighborhood}, ${customer.city}` : customer.city || "Não informado"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                      >
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCustomer(customer)}
                          data-testid={`button-edit-customer-${customer.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomerMutation.mutate(customer.id)}
                          data-testid={`button-delete-customer-${customer.id}`}
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
        </TabsContent>

        {/* Aba de Pets */}
        <TabsContent value="pets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PawPrint className="w-5 h-5 mr-2 text-orange-500" />
                Pets Cadastrados ({pets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {petsLoading ? (
                <div className="text-center py-8">Carregando pets...</div>
              ) : pets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PawPrint className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum pet cadastrado</p>
                  <p className="text-sm mt-2">Clique em "Novo Pet" para começar</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Informações</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <span className="text-2xl">{pet.species === "Cão" ? "🐕" : pet.species === "Gato" ? "🐱" : pet.species === "Coelho" ? "🐰" : pet.species === "Hamster" ? "🐹" : pet.species === "Pássaro" ? "🦜" : "🐾"}</span>
                              {pet.name}
                              {pet.birthDate && (
                                <span className="text-sm text-gray-500">
                                  • {Math.floor((new Date().getTime() - new Date(pet.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pet.species} • {pet.breed || "SRD"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {pet.customerName ? `${pet.customerName}` : "Cliente não identificado"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Cor:</span> {pet.color || "N/A"}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Sexo:</span> {pet.gender || "N/A"}
                            </div>
                            {pet.weight && (
                              <div className="text-sm">
                                <span className="font-medium">Peso:</span> {pet.weight}kg
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {pet.birthDate && (
                              <div className="text-sm">
                                <span className="font-medium">Nascimento:</span> {new Date(pet.birthDate).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                            {pet.preferredFood && (
                              <div className="text-sm">
                                <span className="font-medium">Ração:</span> {pet.preferredFood}
                              </div>
                            )}
                            {pet.specialNeeds && (
                              <div className="text-sm text-amber-600">
                                <span className="font-medium">Cuidados:</span> {pet.specialNeeds}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Ativo</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEditingPet(pet)}
                              data-testid={`button-edit-pet-${pet.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => deletePetMutation.mutate(pet.id)}
                              data-testid={`button-delete-pet-${pet.id}`}
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
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CustomerModal 
        open={isNewCustomerOpen} 
        onOpenChange={setIsNewCustomerOpen} 
      />
      <CustomerModal 
        open={!!editingCustomer} 
        onOpenChange={(open) => !open && setEditingCustomer(null)}
        customer={editingCustomer}
      />
      <PetModal 
        open={isNewPetOpen} 
        onOpenChange={setIsNewPetOpen} 
      />
      <PetModal 
        open={!!editingPet} 
        onOpenChange={(open) => !open && setEditingPet(null)}
        pet={editingPet}
      />
    </div>
  );
}
