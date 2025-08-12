import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, User, Package, Plus, Filter, Play, Edit, Check, CalendarClock, X, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  customerName: string;
  petName: string;
  serviceName: string;
  date: string;
  time: string;
  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled";
  duration: number;
  notes?: string;
}

export default function Appointments() {
  const [activeTab, setActiveTab] = useState("today");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerId: "",
    petId: "",
    serviceId: "",
    date: "",
    time: "",
    notes: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: appointmentStats = { today: 0, thisWeek: 0, pending: 0, occupancyRate: 0 } } = useQuery<{
    today: number;
    thisWeek: number; 
    pending: number;
    occupancyRate: number;
  }>({
    queryKey: ["/api/appointments/stats"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const { data: pets = [] } = useQuery<any[]>({
    queryKey: ["/api/pets"],
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/services"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: typeof newAppointment) => {
      return await apiRequest("/api/appointments", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/stats"] });
      toast({
        title: "Agendamento criado!",
        description: "O agendamento foi criado com sucesso.",
      });
      setIsNewAppointmentOpen(false);
      setNewAppointment({ customerId: "", petId: "", serviceId: "", date: "", time: "", notes: "" });
    },
    onError: () => {
      toast({
        title: "Erro ao criar agendamento",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest(`/api/appointments/${id}`, "PATCH", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/stats"] });
      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleStartService = (appointmentId: string) => {
    updateAppointmentMutation.mutate({ id: appointmentId, status: "in_progress" });
  };

  const handleConfirmAppointment = (appointmentId: string) => {
    updateAppointmentMutation.mutate({ id: appointmentId, status: "confirmed" });
  };

  const handleCompleteService = (appointmentId: string) => {
    updateAppointmentMutation.mutate({ id: appointmentId, status: "completed" });
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.customerId || !newAppointment.serviceId || !newAppointment.date || !newAppointment.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    createAppointmentMutation.mutate(newAppointment);
  };

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/appointments/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/stats"] });
      toast({
        title: "Agendamento excluído!",
        description: "O agendamento foi excluído com sucesso.",
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

  const handleDeleteAppointment = (appointmentId: string) => {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    // For now, just show a placeholder message
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A funcionalidade de reagendamento será implementada em breve.",
    });
  };

  const handleEditAppointment = (appointmentId: string) => {
    // For now, just show a placeholder message
    toast({
      title: "Funcionalidade em desenvolvimento", 
      description: "A funcionalidade de edição será implementada em breve.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "confirmed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "Agendado";
      case "confirmed": return "Confirmado";
      case "in_progress": return "Em Andamento";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const demoAppointments: Appointment[] = [
    {
      id: "1",
      customerName: "Maria Silva",
      petName: "Luna",
      serviceName: "Banho & Tosa",
      date: "2025-01-11",
      time: "09:00",
      status: "confirmed",
      duration: 90,
      notes: "Cão muito dócil, gosta de carinho"
    },
    {
      id: "2",
      customerName: "João Santos",
      petName: "Max",
      serviceName: "Tosa Higiênica",
      date: "2025-01-11",
      time: "14:30",
      status: "scheduled",
      duration: 30
    },
    {
      id: "3",
      customerName: "Ana Costa",
      petName: "Mel",
      serviceName: "Banho & Tosa + Hidratação",
      date: "2025-01-12",
      time: "10:00",
      status: "scheduled",
      duration: 120,
      notes: "Pet sensível, usar produtos hipoalergênicos"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600 mt-2">
            Gerencie todos os agendamentos de serviços dos seus clientes.
          </p>
        </div>
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-new-appointment">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select value={newAppointment.customerId} onValueChange={(value) => setNewAppointment({...newAppointment, customerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Pet</label>
                <Select value={newAppointment.petId} onValueChange={(value) => setNewAppointment({...newAppointment, petId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets.filter((pet: any) => pet.customerId === newAppointment.customerId).map((pet: any) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Serviço</label>
                <Select value={newAppointment.serviceId} onValueChange={(value) => setNewAppointment({...newAppointment, serviceId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: any) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {service.basePrice}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Data</label>
                  <Input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Horário</label>
                  <Input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  placeholder="Observações sobre o atendimento..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createAppointmentMutation.isPending}>
                {createAppointmentMutation.isPending ? "Criando..." : "Criar Agendamento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{appointmentStats.today}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">{appointmentStats.thisWeek}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{appointmentStats.pending}</p>
              </div>
              <User className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa Ocupação</p>
                <p className="text-2xl font-bold text-purple-600">{appointmentStats.occupancyRate}%</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Agendamentos</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Esta Semana</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 space-y-4">
              {appointments.map((appointment: any) => (
                <Card key={appointment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {appointment.customerName || 'Cliente não encontrado'} - {appointment.petName || 'Pet não encontrado'}
                          </h3>
                          <p className="text-sm text-gray-600">{appointment.serviceName || 'Serviço não encontrado'}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(appointment.scheduledDate).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {new Date(appointment.scheduledDate).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                          {appointment.serviceDuration && ` (${appointment.serviceDuration}min)`}
                        </div>
                      </div>
                    </div>
                    
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                        <strong>Observações:</strong> {appointment.notes}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      {appointment.status === "scheduled" && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleConfirmAppointment(appointment.id)}
                            data-testid={`button-confirm-${appointment.id}`}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReschedule(appointment.id)}
                            data-testid={`button-reschedule-${appointment.id}`}
                          >
                            <CalendarClock className="w-4 h-4 mr-1" />
                            Reagendar
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStartService(appointment.id)}
                          data-testid={`button-start-${appointment.id}`}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar Atendimento
                        </Button>
                      )}
                      {appointment.status === "in_progress" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteService(appointment.id)}
                          data-testid={`button-complete-${appointment.id}`}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Finalizar Serviço
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditAppointment(appointment.id)}
                        data-testid={`button-edit-${appointment.id}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        data-testid={`button-delete-${appointment.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {appointments.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Nenhum agendamento encontrado</p>
                  <p className="text-sm">Clique em "Novo Agendamento" para começar</p>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Carregando agendamentos...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}