import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PackageUsageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: string;
  customerId: string;
}

const usageSchema = z.object({
  petId: z.string().min(1, "Selecione um pet"),
  serviceId: z.string().min(1, "Selecione um serviço"),
});

type UsageFormData = z.infer<typeof usageSchema>;

export function PackageUsageModal({ isOpen, onOpenChange, packageId, customerId }: PackageUsageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<UsageFormData>({
    resolver: zodResolver(usageSchema),
    defaultValues: {
      petId: "",
      serviceId: "",
    },
  });

  // Fetch pets for the customer
  const { data: pets = [] } = useQuery({
    queryKey: ["/api/pets", customerId],
    enabled: isOpen && !!customerId,
  }) as { data: any[] };

  // Fetch available services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    enabled: isOpen,
  }) as { data: any[] };

  const usePackageMutation = useMutation({
    mutationFn: async (data: UsageFormData) => {
      return await apiRequest(`/api/packages/${packageId}/use`, "POST", {
        petId: data.petId,
        serviceId: data.serviceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Uso registrado",
        description: "O uso do pacote foi registrado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar uso do pacote",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UsageFormData) => {
    usePackageMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Uso do Pacote</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="petId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-pet">
                        <SelectValue placeholder="Selecione o pet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {pets.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.breed || pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serviceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - R$ {service.basePrice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-usage"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={usePackageMutation.isPending}
                data-testid="button-register-usage"
              >
                {usePackageMutation.isPending ? "Registrando..." : "Registrar Uso"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}