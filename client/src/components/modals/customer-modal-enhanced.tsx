import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomerSchema, type InsertCustomer } from "@shared/schema";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2, Plus, Trash2, PawPrint, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";

// Extended form schema to include pets and packages
const extendedCustomerSchema = insertCustomerSchema.extend({
  pets: z.array(z.object({
    name: z.string().min(1, "Nome do pet é obrigatório"),
    species: z.string().min(1, "Espécie é obrigatória"),
    breed: z.string().optional(),
    color: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    weight: z.number().optional(),
    specialNeeds: z.string().optional(),
  })).optional(),
  packages: z.array(z.object({
    packageTypeId: z.string().min(1, "Selecione um tipo de pacote"),
    startDate: z.string().min(1, "Data de início é obrigatória"),
  })).optional(),
});

type ExtendedCustomerFormData = z.infer<typeof extendedCustomerSchema>;

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null; // For editing existing customers
}

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
  pets?: any[];
  packages?: any[];
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!customer;
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const form = useForm<ExtendedCustomerFormData>({
    resolver: zodResolver(extendedCustomerSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
      address: "",
      cep: "",
      city: "",
      state: "",
      neighborhood: "",
      complement: "",
      pets: [],
      packages: [],
    },
  });

  // Field arrays for pets and packages
  const { fields: petFields, append: appendPet, remove: removePet } = useFieldArray({
    control: form.control,
    name: "pets",
  });

  const { fields: packageFields, append: appendPackage, remove: removePackage } = useFieldArray({
    control: form.control,
    name: "packages",
  });

  // Fetch package types for the dropdown
  const { data: packageTypes = [] } = useQuery({
    queryKey: ["/api/package-types"],
    enabled: open,
  }) as { data: any[] };

  // Fetch full customer data when editing
  const { data: fullCustomerData } = useQuery({
    queryKey: ["/api/customers", customer?.id],
    enabled: !!customer?.id && open,
  }) as { data: Customer | undefined };

  // Reset form when customer changes or full data is loaded
  useEffect(() => {
    const customerData = fullCustomerData || customer;
    if (customerData) {
      // Transform pets data for the form
      const formattedPets = customerData.pets?.map(pet => ({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        color: pet.color || "",
        gender: pet.gender || "",
        birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : "",
        weight: pet.weight ? parseFloat(pet.weight) : undefined,
        specialNeeds: pet.specialNeeds || "",
      })) || [];

      // Transform packages data for the form
      const formattedPackages = customerData.packages?.map(pkg => ({
        packageTypeId: pkg.packageTypeId || "",
        startDate: pkg.acquiredAt ? new Date(pkg.acquiredAt).toISOString().split('T')[0] : "",
      })) || [];

      form.reset({
        name: customerData.name || "",
        phone: customerData.phone || "",
        email: customerData.email || "",
        notes: customerData.notes || "",
        address: customerData.address || "",
        cep: customerData.cep || "",
        city: customerData.city || "",
        state: customerData.state || "",
        neighborhood: customerData.neighborhood || "",
        complement: customerData.complement || "",
        pets: formattedPets,
        packages: formattedPackages,
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        email: "",
        notes: "",
        address: "",
        cep: "",
        city: "",
        state: "",
        neighborhood: "",
        complement: "",
        pets: [],
        packages: [],
      });
    }
  }, [customer, fullCustomerData, form]);

  // Helper functions for pets and packages
  const addNewPet = () => {
    appendPet({
      name: "",
      species: "",
      breed: "",
      color: "",
      gender: "",
      birthDate: "",
      weight: undefined,
      specialNeeds: "",
    });
  };

  const addNewPackage = () => {
    appendPackage({
      packageTypeId: "",
      startDate: new Date().toISOString().split('T')[0], // Today's date
    });
  };

  const customerMutation = useMutation({
    mutationFn: async (data: ExtendedCustomerFormData) => {
      console.log("Mutation triggered - Sending customer data:", data);
      
      if (isEditing) {
        // When editing, only update customer basic data
        const { pets, packages, ...customerData } = data;
        const url = `/api/customers/${customer!.id}`;
        console.log(`Making PUT request to ${url}`);
        return await apiRequest(url, "PUT", customerData);
      } else {
        // When creating, send all data to the POST endpoint
        console.log("Making POST request to /api/customers");
        return await apiRequest("/api/customers", "POST", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer-packages"] });
      toast({
        title: isEditing ? "Cliente atualizado" : "Cliente criado",
        description: isEditing ? "Cliente atualizado com sucesso!" : "Cliente e itens vinculados criados com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} cliente`,
        variant: "destructive",
      });
    },
  });

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.setValue("address", data.logradouro || "");
        form.setValue("city", data.localidade || "");
        form.setValue("state", data.uf || "");
        form.setValue("neighborhood", data.bairro || "");
        // Format CEP with dash
        form.setValue("cep", `${cleanCep.substring(0, 5)}-${cleanCep.substring(5)}`);
        
        toast({
          title: "CEP encontrado",
          description: `Endereço preenchido automaticamente para ${data.localidade}-${data.uf}`,
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP digitado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao buscar CEP",
        variant: "destructive",
      });
    }
    setIsLoadingCep(false);
  };

  const onSubmit = (data: InsertCustomer) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form valid:", form.formState.isValid);
    console.log(`Triggering customer ${isEditing ? 'update' : 'creation'} mutation...`);
    customerMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-customer">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
        })} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Dados Básicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Nome do cliente"
                  data-testid="input-customer-name"
                  className={form.formState.errors.name ? "border-red-500" : ""}
                />
                {form.formState.errors.name && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="(11) 99999-9999"
                  data-testid="input-customer-phone"
                  className={form.formState.errors.phone ? "border-red-500" : ""}
                />
                {form.formState.errors.phone && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </span>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="cliente@email.com"
                  data-testid="input-customer-email"
                  className={form.formState.errors.email ? "border-red-500" : ""}
                />
                {form.formState.errors.email && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Endereço para Taxidog */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-700">
                Endereço (para serviço de Taxidog)
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <div className="relative">
                  <Input
                    id="cep"
                    {...form.register("cep")}
                    placeholder="00000-000"
                    data-testid="input-customer-cep"
                    className={form.formState.errors.cep ? "border-red-500" : ""}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    maxLength={9}
                  />
                  {isLoadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                {form.formState.errors.cep && (
                  <span className="text-sm text-red-500">
                    {form.formState.errors.cep.message}
                  </span>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  {...form.register("address")}
                  placeholder="Rua, Avenida..."
                  data-testid="input-customer-address"
                />
              </div>

              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  {...form.register("neighborhood")}
                  placeholder="Bairro"
                  data-testid="input-customer-neighborhood"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Cidade"
                  data-testid="input-customer-city"
                />
              </div>

              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="SP"
                  data-testid="input-customer-state"
                  maxLength={2}
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...form.register("complement")}
                  placeholder="Apartamento, casa, referência..."
                  data-testid="input-customer-complement"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Observações sobre o cliente ou pets..."
              data-testid="textarea-customer-notes"
              rows={3}
            />
          </div>

          {/* Seção de Pets */}
          {(
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-medium text-gray-700">
                      {isEditing ? `Pets do Cliente (${petFields.length})` : "Pets do Cliente"}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewPet}
                    data-testid="button-add-pet"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {isEditing ? "Adicionar Novo Pet" : "Adicionar Pet"}
                  </Button>
                </div>

                {petFields.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum pet adicionado. Clique em "Adicionar Pet" para começar.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {petFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {form.watch(`pets.${index}.species`) === "Cão" ? "🐶" : 
                               form.watch(`pets.${index}.species`) === "Gato" ? "🐱" : 
                               form.watch(`pets.${index}.species`) === "Coelho" ? "🐰" : 
                               form.watch(`pets.${index}.species`) === "Hamster" ? "🐹" : 
                               form.watch(`pets.${index}.species`) === "Pássaro" ? "🦜" : "🐾"}
                            </span>
                            <h4 className="text-sm font-medium">
                              {form.watch(`pets.${index}.name`) || `Pet ${index + 1}`}
                            </h4>
                            {isEditing && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch(`pets.${index}.species`) ? "Existente" : "Novo"}
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePet(index)}
                            data-testid={`button-remove-pet-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`pets.${index}.name`}>Nome *</Label>
                            <Input
                              {...form.register(`pets.${index}.name`)}
                              placeholder="Nome do pet"
                              data-testid={`input-pet-name-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`pets.${index}.species`}>Espécie *</Label>
                            <Select
                              value={form.watch(`pets.${index}.species`)}
                              onValueChange={(value) => form.setValue(`pets.${index}.species`, value)}
                            >
                              <SelectTrigger data-testid={`select-pet-species-${index}`}>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cão">🐶 Cão</SelectItem>
                                <SelectItem value="Gato">🐱 Gato</SelectItem>
                                <SelectItem value="Coelho">🐰 Coelho</SelectItem>
                                <SelectItem value="Hamster">🐹 Hamster</SelectItem>
                                <SelectItem value="Pássaro">🦜 Pássaro</SelectItem>
                                <SelectItem value="Outro">🐾 Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`pets.${index}.breed`}>Raça</Label>
                            <Input
                              {...form.register(`pets.${index}.breed`)}
                              placeholder="Raça do pet"
                              data-testid={`input-pet-breed-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`pets.${index}.color`}>Cor</Label>
                            <Input
                              {...form.register(`pets.${index}.color`)}
                              placeholder="Cor do pet"
                              data-testid={`input-pet-color-${index}`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor={`pets.${index}.gender`}>Sexo</Label>
                            <Select
                              value={form.watch(`pets.${index}.gender`)}
                              onValueChange={(value) => form.setValue(`pets.${index}.gender`, value)}
                            >
                              <SelectTrigger data-testid={`select-pet-gender-${index}`}>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Macho">Macho</SelectItem>
                                <SelectItem value="Fêmea">Fêmea</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`pets.${index}.birthDate`}>Data de Nascimento</Label>
                            <Input
                              type="date"
                              {...form.register(`pets.${index}.birthDate`)}
                              data-testid={`input-pet-birthdate-${index}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Seção de Pacotes */}
          {(
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-medium text-gray-700">
                      {isEditing ? `Pacotes do Cliente (${packageFields.length})` : "Pacotes do Cliente"}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewPackage}
                    data-testid="button-add-package"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    {isEditing ? "Adicionar Novo Pacote" : "Adicionar Pacote"}
                  </Button>
                </div>

                {packageFields.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Nenhum pacote adicionado. Clique em "Adicionar Pacote" para começar.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {packageFields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-500" />
                            <h4 className="text-sm font-medium">
                              {packageTypes.find(pt => pt.id === form.watch(`packages.${index}.packageTypeId`))?.name || `Pacote ${index + 1}`}
                            </h4>
                            {isEditing && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch(`packages.${index}.packageTypeId`) ? "Existente" : "Novo"}
                              </Badge>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePackage(index)}
                            data-testid={`button-remove-package-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`packages.${index}.packageTypeId`}>Tipo de Pacote *</Label>
                            <Select
                              value={form.watch(`packages.${index}.packageTypeId`)}
                              onValueChange={(value) => form.setValue(`packages.${index}.packageTypeId`, value)}
                            >
                              <SelectTrigger data-testid={`select-package-type-${index}`}>
                                <SelectValue placeholder="Selecione o pacote" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageTypes.map((packageType) => (
                                  <SelectItem key={packageType.id} value={packageType.id}>
                                    {packageType.name} - R$ {packageType.price}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor={`packages.${index}.startDate`}>Data de Início *</Label>
                            <Input
                              type="date"
                              {...form.register(`packages.${index}.startDate`)}
                              data-testid={`input-package-startdate-${index}`}
                            />
                          </div>
                        </div>
                        
                        {form.watch(`packages.${index}.packageTypeId`) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            {(() => {
                              const selectedPackage = packageTypes.find(
                                p => p.id === form.watch(`packages.${index}.packageTypeId`)
                              );
                              return selectedPackage ? (
                                <div className="text-sm">
                                  <div className="flex items-center gap-4 text-gray-600">
                                    <span>💰 <strong>R$ {selectedPackage.price}</strong></span>
                                    <span>📅 <strong>{selectedPackage.validityDays} dias</strong></span>
                                    <span>🔄 <strong>{selectedPackage.totalUses} usos</strong></span>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-customer-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={customerMutation.isPending}
              data-testid="button-customer-save"
              onClick={(e) => {
                console.log("Save button clicked");
                console.log("Form valid:", form.formState.isValid);
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
                // Let the form handle the submit
              }}
            >
              {customerMutation.isPending ? "Salvando..." : isEditing ? "Atualizar Cliente" : "Salvar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}