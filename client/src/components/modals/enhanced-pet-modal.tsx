import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Heart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const petSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().optional(),
  weight: z.number().positive("Peso deve ser positivo").optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  specialNeeds: z.string().optional(),
  notes: z.string().optional(),
  customerId: z.string().min(1, "Cliente é obrigatório"),
});

type PetFormData = z.infer<typeof petSchema>;

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface EnhancedPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PetFormData) => void;
  customers: Customer[];
  editPet?: any;
  selectedCustomerId?: string;
}

const speciesOptions = [
  { value: "dog", label: "Cão", icon: "🐕" },
  { value: "cat", label: "Gato", icon: "🐱" },
  { value: "bird", label: "Pássaro", icon: "🦜" },
  { value: "rabbit", label: "Coelho", icon: "🐰" },
  { value: "hamster", label: "Hamster", icon: "🐹" },
  { value: "guinea_pig", label: "Porquinho da Índia", icon: "🐹" },
  { value: "ferret", label: "Furão", icon: "🦦" },
  { value: "other", label: "Outro", icon: "🐾" },
];

const commonBreeds = {
  dog: [
    "Labrador", "Golden Retriever", "Bulldog Francês", "Poodle", "Pastor Alemão",
    "Bulldog", "Beagle", "Rottweiler", "Yorkshire", "Dachshund", "Boxer",
    "Shih Tzu", "Maltês", "Border Collie", "Husky Siberiano", "Vira-lata"
  ],
  cat: [
    "Persa", "Siamês", "Maine Coon", "Ragdoll", "Bengal", "British Shorthair",
    "Sphynx", "Russian Blue", "Abyssinian", "Scottish Fold", "Vira-lata"
  ],
  bird: [
    "Canário", "Periquito", "Calopsita", "Agapornis", "Papagaio", "Cacatua",
    "Periquito Australiano", "Diamante Gould"
  ],
  rabbit: [
    "Holandês", "Angorá", "Rex", "Lion Head", "Flemish Giant", "Mini Lop"
  ],
};

export function EnhancedPetModal({ isOpen, onClose, onSubmit, customers, editPet, selectedCustomerId }: EnhancedPetModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: {
      name: editPet?.name || "",
      species: editPet?.species || "",
      breed: editPet?.breed || "",
      weight: editPet?.weight ? parseFloat(editPet.weight) : undefined,
      birthDate: editPet?.birthDate || "",
      gender: editPet?.gender || "",
      color: editPet?.color || "",
      specialNeeds: editPet?.specialNeeds || "",
      notes: editPet?.notes || "",
      customerId: editPet?.customerId || selectedCustomerId || "",
    },
  });

  const selectedSpecies = watch("species");
  const selectedCustomer = customers.find(c => c.id === watch("customerId"));

  const handleFormSubmit = (data: PetFormData) => {
    onSubmit({
      ...data,
      weight: data.weight || undefined,
    });
    reset();
    onClose();
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    
    if (months < 12) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} ${years === 1 ? 'ano' : 'anos'}${remainingMonths > 0 ? ` e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}` : ''}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="modal-enhanced-pet">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2" data-testid="text-modal-title">
            <Heart className="h-5 w-5 text-pink-500" />
            {editPet ? "Editar Pet" : "Cadastrar Novo Pet"}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer and Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerId">Cliente</Label>
                <Select
                  value={watch("customerId")}
                  onValueChange={(value) => setValue("customerId", value)}
                  data-testid="select-customer"
                >
                  <SelectTrigger className={errors.customerId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.phone}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <span className="text-sm text-red-500">{errors.customerId.message}</span>
                )}
                {selectedCustomer && (
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Cliente: {selectedCustomer.name} • {selectedCustomer.phone}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="name">Nome do Pet</Label>
                <Input
                  id="name"
                  {...register("name")}
                  data-testid="input-pet-name"
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Ex: Buddy, Luna, Rex..."
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="species">Espécie</Label>
                <Select
                  value={watch("species")}
                  onValueChange={(value) => {
                    setValue("species", value);
                    setValue("breed", ""); // Reset breed when species changes
                  }}
                  data-testid="select-species"
                >
                  <SelectTrigger className={errors.species ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione a espécie" />
                  </SelectTrigger>
                  <SelectContent>
                    {speciesOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.species && (
                  <span className="text-sm text-red-500">{errors.species.message}</span>
                )}
              </div>

              {selectedSpecies && commonBreeds[selectedSpecies as keyof typeof commonBreeds] && (
                <div>
                  <Label htmlFor="breed">Raça</Label>
                  <Select
                    value={watch("breed")}
                    onValueChange={(value) => setValue("breed", value)}
                    data-testid="select-breed"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a raça" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonBreeds[selectedSpecies as keyof typeof commonBreeds].map(breed => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(!selectedSpecies || !commonBreeds[selectedSpecies as keyof typeof commonBreeds]) && (
                <div>
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    {...register("breed")}
                    data-testid="input-breed"
                    placeholder="Ex: Vira-lata, SRD..."
                  />
                </div>
              )}
            </div>

            {/* Physical Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    {...register("weight", { valueAsNumber: true })}
                    data-testid="input-weight"
                    className={errors.weight ? "border-red-500" : ""}
                    placeholder="Ex: 5.2"
                  />
                  {errors.weight && (
                    <span className="text-sm text-red-500">{errors.weight.message}</span>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select
                    value={watch("gender")}
                    onValueChange={(value) => setValue("gender", value)}
                    data-testid="select-gender"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Macho</SelectItem>
                      <SelectItem value="female">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register("birthDate")}
                  data-testid="input-birth-date"
                />
                {watch("birthDate") && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <Calendar className="h-3 w-3" />
                    Idade: {calculateAge(watch("birthDate") || "")}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  {...register("color")}
                  data-testid="input-color"
                  placeholder="Ex: Dourado, Preto e branco, Rajado..."
                />
              </div>

              <div>
                <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                <Textarea
                  id="specialNeeds"
                  {...register("specialNeeds")}
                  data-testid="input-special-needs"
                  rows={2}
                  placeholder="Ex: Medicação, sensibilidades, comportamento..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="notes">Observações Gerais</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              data-testid="input-notes"
              rows={3}
              placeholder="Informações adicionais sobre o pet..."
            />
          </div>

          {/* Preview Card */}
          {watch("name") && watch("species") && (
            <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{speciesOptions.find(s => s.value === selectedSpecies)?.icon}</span>
                  {watch("name")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Espécie:</strong> {speciesOptions.find(s => s.value === selectedSpecies)?.label}</div>
                  {watch("breed") && <div><strong>Raça:</strong> {watch("breed")}</div>}
                  {watch("weight") && <div><strong>Peso:</strong> {watch("weight")} kg</div>}
                  {watch("gender") && <div><strong>Sexo:</strong> {watch("gender") === "male" ? "Macho" : "Fêmea"}</div>}
                  {watch("color") && <div><strong>Cor:</strong> {watch("color")}</div>}
                  {watch("birthDate") && <div><strong>Idade:</strong> {calculateAge(watch("birthDate") || "")}</div>}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
              Cancelar
            </Button>
            <Button type="submit" data-testid="button-save-pet">
              {editPet ? "Atualizar" : "Cadastrar"} Pet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}