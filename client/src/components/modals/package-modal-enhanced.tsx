import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertPackageTypeSchema, type InsertPackageType, type Service } from "@shared/schema";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Package, Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// Schema estendido para incluir serviços do pacote
const packageWithServicesSchema = insertPackageTypeSchema.omit({ companyId: true, price: true, totalUses: true }).extend({
  services: z.array(z.object({
    serviceId: z.string().min(1, "Selecione um serviço"),
    includedUses: z.number().min(1, "Quantidade deve ser maior que 0"),
    unitPrice: z.string().min(1, "Preço é obrigatório"),
  })).min(1, "Adicione pelo menos um serviço"),
});

type PackageWithServices = z.infer<typeof packageWithServicesSchema>;

interface PackageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPackage?: any; // Package being edited (optional)
}

export function PackageModal({ open, onOpenChange, editingPackage }: PackageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!editingPackage;

  const form = useForm<PackageWithServices>({
    resolver: zodResolver(packageWithServicesSchema),
    defaultValues: {
      name: editingPackage?.name || "",
      description: editingPackage?.description || "",
      validityDays: editingPackage?.validityDays || 30,
      totalUses: editingPackage?.totalUses || 0,
      price: editingPackage?.price || "",
      maxPets: editingPackage?.maxPets || 1,
      active: editingPackage?.active ?? true,
      services: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  // Buscar serviços disponíveis
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  }) as { data: Service[] };

  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageWithServices) => {
      console.log("Mutation triggered - Sending package data:", data);
      const url = isEditing ? `/api/package-types/${editingPackage.id}` : "/api/package-types";
      const method = isEditing ? "PUT" : "POST";
      console.log(`Making ${method} request to ${url}`);
      
      try {
        const result = await apiRequest(url, method, data);
        console.log(`Package ${isEditing ? 'update' : 'creation'} response:`, result);
        return result;
      } catch (error) {
        console.error("Error in package mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/package-types"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      toast({
        title: isEditing ? "Pacote atualizado" : "Pacote criado",
        description: isEditing ? "Pacote atualizado com sucesso!" : "Pacote criado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} pacote`,
        variant: "destructive",
      });
    },
  });

  // Calcular preço total automaticamente
  const calculateTotalPrice = () => {
    const services = form.watch("services");
    if (!services || services.length === 0) return "0.00";
    
    const total = services.reduce((sum: number, service: any) => {
      const unitPrice = parseFloat(service.unitPrice || "0");
      const uses = service.includedUses || 0;
      return sum + (unitPrice * uses);
    }, 0);
    
    return total.toFixed(2);
  };

  // Calcular total de usos
  const calculateTotalUses = () => {
    const services = form.watch("services");
    if (!services || services.length === 0) return 0;
    
    return services.reduce((sum: number, service: any) => sum + (service.includedUses || 0), 0);
  };

  const addService = () => {
    append({
      serviceId: "",
      includedUses: 1,
      unitPrice: "",
    });
  };

  const onSubmit = (data: PackageWithServices) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form valid:", form.formState.isValid);
    
    // Atualizar preço total e usos totais calculados
    const totalPrice = calculateTotalPrice();
    const totalUses = calculateTotalUses();
    
    // Verificar se há serviços adicionados
    if (!data.services || data.services.length === 0) {
      toast({
        title: "Serviços obrigatórios",
        description: "Adicione pelo menos um serviço ao pacote.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se todos os serviços estão preenchidos
    const hasInvalidServices = data.services.some((service: any) =>
      !service.serviceId || !service.unitPrice || service.includedUses <= 0
    );

    if (hasInvalidServices) {
      toast({
        title: "Serviços incompletos",
        description: "Preencha todos os campos dos serviços (serviço, quantidade e preço).",
        variant: "destructive",
      });
      return;
    }
    
    const packageData = {
      name: data.name,
      description: data.description || null,
      validityDays: data.validityDays,
      maxPets: data.maxPets,
      price: totalPrice,
      totalUses: totalUses,
      companyId: "550e8400-e29b-41d4-a716-446655440000", // Gloss Pet company ID
      active: true,
    };
    
    console.log("Enviando dados do pacote:", packageData);
    console.log("Triggering package creation mutation...");
    createPackageMutation.mutate(packageData);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-package">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {isEditing ? "Editar Pacote de Serviços" : "Novo Pacote de Serviços"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifique as informações do pacote de serviços."
              : "Crie um novo pacote de serviços combinando diferentes serviços com preços especiais."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
        })} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Pacote *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Pacote Completo Mensal"
                    data-testid="input-package-name"
                    className={form.formState.errors.name ? "border-red-500" : ""}
                  />
                  {form.formState.errors.name && (
                    <span className="text-sm text-red-500">
                      {String(form.formState.errors.name?.message)}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="validityDays">Validade (dias) *</Label>
                  <Input
                    id="validityDays"
                    type="number"
                    {...form.register("validityDays", { valueAsNumber: true })}
                    placeholder="30"
                    data-testid="input-package-validity"
                    className={form.formState.errors.validityDays ? "border-red-500" : ""}
                  />
                  {form.formState.errors.validityDays && (
                    <span className="text-sm text-red-500">
                      {String(form.formState.errors.validityDays?.message)}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxPets">Máximo de Pets</Label>
                  <Input
                    id="maxPets"
                    type="number"
                    {...form.register("maxPets", { valueAsNumber: true })}
                    placeholder="1"
                    data-testid="input-package-max-pets"
                    min="1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="Descrição do pacote de serviços..."
                    data-testid="textarea-package-description"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Serviços do Pacote */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Serviços Inclusos</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addService}
                  data-testid="button-add-service"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum serviço adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Serviço" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label htmlFor={`services.${index}.serviceId`}>Serviço</Label>
                          <select
                            {...form.register(`services.${index}.serviceId`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            data-testid={`select-service-${index}`}
                          >
                            <option value="">Selecione um serviço</option>
                            {services.map((service: Service) => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          {(form.formState.errors.services as any)?.[index]?.serviceId && (
                            <span className="text-sm text-red-500">
                              {String((form.formState.errors.services as any)[index]?.serviceId?.message)}
                            </span>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`services.${index}.includedUses`}>Quantidade</Label>
                          <Input
                            type="number"
                            {...form.register(`services.${index}.includedUses`, { valueAsNumber: true })}
                            placeholder="1"
                            data-testid={`input-service-uses-${index}`}
                            min="1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`services.${index}.unitPrice`}>Preço Unitário</Label>
                          <div className="flex">
                            <Input
                              {...form.register(`services.${index}.unitPrice`)}
                              placeholder="0,00"
                              data-testid={`input-service-price-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                              className="ml-2"
                              data-testid={`button-remove-service-${index}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {form.formState.errors.services && (
                <span className="text-sm text-red-500">
                  {String((form.formState.errors.services as any)?.message)}
                </span>
              )}
            </CardContent>
          </Card>

          {/* Resumo Calculado */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Resumo do Pacote
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total de Usos:</p>
                  <p className="font-semibold text-lg">{calculateTotalUses()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Preço Total:</p>
                  <p className="font-semibold text-lg text-green-600">
                    R$ {calculateTotalPrice()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Validade:</p>
                  <p className="font-semibold text-lg">
                    {form.watch("validityDays") || 0} dias
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-package-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createPackageMutation.isPending || fields.length === 0}
              data-testid="button-package-save"
              onClick={(e) => {
                console.log("Package save button clicked");
                console.log("Form valid:", form.formState.isValid);
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
                console.log("Services array (fields):", fields);
                console.log("Services from form:", form.getValues("services"));
                console.log("Calculated price:", calculateTotalPrice());
                console.log("Calculated uses:", calculateTotalUses());
                // Let the form handle the submit
              }}
            >
              {createPackageMutation.isPending ? "Criando..." : "Criar Pacote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}