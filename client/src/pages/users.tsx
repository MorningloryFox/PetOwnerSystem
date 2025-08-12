import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, ShieldCheck, Shield, User as UserIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertUserSchema, type InsertUser, type User as UserType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Schema for user creation with password
const createUserSchema = insertUserSchema.extend({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type CreateUserData = z.infer<typeof createUserSchema>;

function getRoleBadge(role: string) {
  switch (role) {
    case "owner":
      return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"><ShieldCheck className="w-3 h-3 mr-1" />Proprietário</Badge>;
    case "manager":
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Shield className="w-3 h-3 mr-1" />Gestor</Badge>;
    case "employee":
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><UserIcon className="w-3 h-3 mr-1" />Funcionário</Badge>;
    default:
      return <Badge variant="secondary">{role}</Badge>;
  }
}

function getRoleDescription(role: string) {
  switch (role) {
    case "owner":
      return "Acesso total: pode criar usuários, ver dados financeiros e editar tudo";
    case "manager":
      return "Acesso de edição: pode editar clientes e pacotes, mas não vê dados financeiros";
    case "employee":
      return "Acesso limitado: apenas agendamentos e mensagens de clientes";
    default:
      return "Papel não definido";
  }
}

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const { data: users = [], isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/users"],
    retry: false,
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: Omit<CreateUserData, 'confirmPassword'>) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Usuário criado",
        description: "O novo usuário foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Status atualizado",
        description: "Status do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "employee",
      isActive: true,
    },
  });

  const onSubmit = (data: CreateUserData) => {
    const { confirmPassword, ...userData } = data;
    createUserMutation.mutate(userData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e suas permissões de acesso ao sistema
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-user">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-user-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-user-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Papel/Função</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-user-role">
                            <SelectValue placeholder="Selecione o papel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Proprietário - Acesso Total</SelectItem>
                          <SelectItem value="manager">Gestor - Sem Dados Financeiros</SelectItem>
                          <SelectItem value="employee">Funcionário - Apenas Agendamentos</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-user-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} data-testid="input-user-confirm-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                    data-testid="button-cancel-user"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUserMutation.isPending}
                    data-testid="button-save-user"
                  >
                    {createUserMutation.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
              Proprietário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesso total ao sistema, incluindo dados financeiros, criação de usuários e todas as funcionalidades.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Gestor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pode editar clientes, pets, pacotes e agendamentos, mas não tem acesso a dados financeiros.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <UserIcon className="w-5 h-5 mr-2 text-green-600" />
              Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acesso limitado: pode gerenciar agendamentos e responder mensagens de clientes apenas.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((user: UserType) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold" data-testid={`text-user-name-${user.id}`}>
                      {user.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.id}`}>
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getRoleDescription(user.role)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getRoleBadge(user.role)}
                  
                  <Badge 
                    variant={user.isActive ? "default" : "secondary"}
                    data-testid={`badge-user-status-${user.id}`}
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </Badge>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleUserStatusMutation.mutate({
                        userId: user.id,
                        isActive: !user.isActive
                      })}
                      data-testid={`button-toggle-user-${user.id}`}
                    >
                      {user.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {user.isActive ? "Desativar" : "Ativar"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      data-testid={`button-edit-user-${user.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja remover o usuário ${user.name}?`)) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando o primeiro usuário do sistema.
                </p>
                <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-user">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Usuário
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}