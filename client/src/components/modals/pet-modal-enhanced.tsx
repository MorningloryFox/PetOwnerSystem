import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertPetSchema, type InsertPet, type Customer } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";

// Schema estendido para o pet
const petFormSchema = insertPetSchema.omit({ customerId: true }).extend({
  customerId: z.string().optional(),
});

type PetFormData = z.infer<typeof petFormSchema>;

interface Pet {
  id: string;
  customerId: string;
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

interface PetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedCustomerId?: string;
  pet?: Pet | null;
}

export function PetModal({ open, onOpenChange, preSelectedCustomerId, pet }: PetModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PetFormData>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: pet?.name || "",
      species: pet?.species || "",
      breed: pet?.breed || "",
      color: pet?.color || "",
      gender: pet?.gender || "",
      birthDate: pet?.birthDate ? pet.birthDate.toString().split('T')[0] : undefined,
      weight: pet?.weight || undefined,
      notes: pet?.notes || "",
      specialNeeds: pet?.specialNeeds || "",
      preferredFood: pet?.preferredFood || "",
      customerId: pet?.customerId || preSelectedCustomerId || "",
    },
  });

  // Buscar clientes para o dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    enabled: !preSelectedCustomerId, // Só busca se não tem cliente pré-selecionado
  }) as { data: Customer[] };

  // Resetar formulário quando pet ou modal abrem/fecham
  useEffect(() => {
    if (open) {
      form.reset({
        name: pet?.name || "",
        species: pet?.species || "",
        breed: pet?.breed || "",
        color: pet?.color || "",
        gender: pet?.gender || "",
        birthDate: pet?.birthDate ? pet.birthDate.toString().split('T')[0] : undefined,
        weight: pet?.weight || undefined,
        notes: pet?.notes || "",
        specialNeeds: pet?.specialNeeds || "",
        preferredFood: pet?.preferredFood || "",
        customerId: pet?.customerId || preSelectedCustomerId || "",
      });
    } else {
      // Limpa o formulário quando o modal fecha
      form.reset({
        name: "",
        species: "",
        breed: "",
        color: "",
        gender: "",
        birthDate: undefined,
        weight: undefined,
        notes: "",
        specialNeeds: "",
        preferredFood: "",
        customerId: preSelectedCustomerId || "",
      });
    }
  }, [open, pet, preSelectedCustomerId, form]);

  const savePetMutation = useMutation({
    mutationFn: async (data: PetFormData) => {
      console.log("Mutation triggered - Sending pet data:", data);
      
      const petData = {
        ...data,
        customerId: data.customerId || preSelectedCustomerId,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        weight: data.weight ? Number(data.weight) : null,
      };
      
      try {
        if (pet) {
          // Edit existing pet
          console.log("Making PUT request to /api/pets");
          const result = await apiRequest(`/api/pets/${pet.id}`, "PUT", petData);
          console.log("Pet update response:", result);
          return result;
        } else {
          // Create new pet
          console.log("Making POST request to /api/pets");
          const result = await apiRequest("/api/pets", "POST", petData);
          console.log("Pet creation response:", result);
          return result;
        }
      } catch (error) {
        console.error("Error in pet mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: pet ? "Pet atualizado" : "Pet cadastrado",
        description: pet ? "Pet editado com sucesso!" : "Pet criado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || (pet ? "Erro ao atualizar pet" : "Erro ao cadastrar pet"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PetFormData) => {
    console.log("Form submitted with pet data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form valid:", form.formState.isValid);
    
    // Validação manual
    if (!data.name || !data.species) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o nome e espécie do pet.",
        variant: "destructive",
      });
      return;
    }

    if (!data.customerId && !preSelectedCustomerId) {
      toast({
        title: "Cliente obrigatório",
        description: "Selecione um cliente para o pet.",
        variant: "destructive",
      });
      return;
    }
    
    console.log("Triggering pet mutation...");
    savePetMutation.mutate(data);
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="modal-pet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            {pet ? "Editar Pet" : (preSelectedCustomerId ? "Novo Pet" : "Cadastrar Pet")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
        })} className="space-y-6">
          
          {/* Informações do Cliente */}
          {!preSelectedCustomerId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="customerId">Cliente *</Label>
                  <Select 
                    value={form.watch("customerId")} 
                    onValueChange={(value) => form.setValue("customerId", value)}
                  >
                    <SelectTrigger data-testid="select-customer">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.customerId && (
                    <span className="text-sm text-red-500">
                      {form.formState.errors.customerId.message}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Básicas do Pet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Pet *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Rex, Mimi, Thor"
                    data-testid="input-pet-name"
                    className={form.formState.errors.name ? "border-red-500" : ""}
                  />
                  {form.formState.errors.name && (
                    <span className="text-sm text-red-500">
                      {form.formState.errors.name.message}
                    </span>
                  )}
                </div>

                <div>
                  <Label htmlFor="species">Espécie *</Label>
                  <Select 
                    value={form.watch("species")} 
                    onValueChange={(value) => form.setValue("species", value)}
                  >
                    <SelectTrigger data-testid="select-species">
                      <SelectValue placeholder="Selecione a espécie" />
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
                  {form.formState.errors.species && (
                    <span className="text-sm text-red-500">
                      {form.formState.errors.species.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    {...form.register("breed")}
                    placeholder="Ex: Labrador, Persa, SRD"
                    data-testid="input-pet-breed"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Input
                    id="color"
                    {...form.register("color")}
                    placeholder="Ex: Marrom, Preto, Branco"
                    data-testid="input-pet-color"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select 
                    value={form.watch("gender") || ""} 
                    onValueChange={(value) => form.setValue("gender", value)}
                  >
                    <SelectTrigger data-testid="select-gender">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Macho">Macho</SelectItem>
                      <SelectItem value="Fêmea">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    {...form.register("birthDate")}
                    data-testid="input-pet-birthdate"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    {...form.register("weight", { valueAsNumber: true })}
                    placeholder="5.5"
                    data-testid="input-pet-weight"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="preferredFood">Ração Preferida</Label>
                <Input
                  id="preferredFood"
                  {...form.register("preferredFood")}
                  placeholder="Ex: Royal Canin, Premier, Pedigree"
                  data-testid="input-pet-food"
                />
              </div>

              <div>
                <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                <Textarea
                  id="specialNeeds"
                  {...form.register("specialNeeds")}
                  placeholder="Ex: Medicamentos, alergias, cuidados especiais..."
                  data-testid="input-pet-special-needs"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações Gerais</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder="Outras informações importantes sobre o pet..."
                  data-testid="input-pet-notes"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              data-testid="button-pet-cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={savePetMutation.isPending}
              data-testid="button-pet-save"
              onClick={(e) => {
                console.log("Pet save button clicked");
                console.log("Form valid:", form.formState.isValid);
                console.log("Form errors:", form.formState.errors);
                console.log("Form values:", form.getValues());
              }}
            >
              {savePetMutation.isPending ? 
                (pet ? "Atualizando..." : "Cadastrando...") : 
                (pet ? "Atualizar Pet" : "Cadastrar Pet")
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}