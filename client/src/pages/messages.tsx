import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send, Phone, Mail, Clock, CheckCircle, Plus, Filter, Calendar } from "lucide-react";

interface Message {
  id: string;
  customerName: string;
  customerId: string;
  type: "whatsapp" | "email" | "sms";
  subject?: string;
  content: string;
  status: "sent" | "delivered" | "read" | "failed";
  createdAt: string;
  direction: "sent" | "received";
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState("all");
  const [newMessage, setNewMessage] = useState<{
    customerId: string;
    type: "whatsapp" | "email" | "sms";
    subject: string;
    content: string;
  }>({
    customerId: "",
    type: "whatsapp",
    subject: "",
    content: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: typeof newMessage) => {
      return await apiRequest("/api/messages/send", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso.",
      });
      setNewMessage({ customerId: "", type: "whatsapp", subject: "", content: "" });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "read": return "bg-purple-100 text-purple-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent": return "Enviada";
      case "delivered": return "Entregue";
      case "read": return "Lida";
      case "failed": return "Falha";
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageSquare className="w-4 h-4" />;
      case "email": return <Mail className="w-4 h-4" />;
      case "sms": return <Phone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const demoMessages: Message[] = [
    {
      id: "1",
      customerName: "Maria Silva",
      customerId: "customer-1",
      type: "whatsapp",
      content: "Olá Maria! Seu pet Luna está agendado para amanhã às 10h. Confirma presença?",
      status: "read",
      createdAt: "2025-01-10T14:30:00",
      direction: "sent"
    },
    {
      id: "2",
      customerName: "João Santos",
      customerId: "customer-2",
      type: "whatsapp",
      content: "Oi! Confirmo sim, obrigada! 😊",
      status: "delivered",
      createdAt: "2025-01-10T16:15:00",
      direction: "received"
    },
    {
      id: "3",
      customerName: "Ana Costa",
      customerId: "customer-3",
      type: "email",
      subject: "Lembrete: Pacote vencendo em 7 dias",
      content: "Olá Ana! Seu pacote de 8 banhos vence em 7 dias. Que tal renovar com desconto especial?",
      status: "sent",
      createdAt: "2025-01-11T09:00:00",
      direction: "sent"
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.customerId || !newMessage.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cliente e digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(newMessage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-600 mt-2">
            Gerencie a comunicação com seus clientes via WhatsApp, email e SMS.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enviadas Hoje</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Entrega</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tempo Resp. Médio</p>
                <p className="text-2xl font-bold text-orange-600">2h</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Não Lidas</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <MessageSquare className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Message Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nova Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Cliente</label>
                <Select 
                  value={newMessage.customerId} 
                  onValueChange={(value) => setNewMessage({...newMessage, customerId: value})}
                >
                  <SelectTrigger data-testid="select-message-customer">
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
                <label className="text-sm font-medium">Tipo</label>
                <Select 
                  value={newMessage.type} 
                  onValueChange={(value) => setNewMessage({...newMessage, type: value as any})}
                >
                  <SelectTrigger data-testid="select-message-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newMessage.type === "email" && (
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="Assunto do email"
                    data-testid="input-message-subject"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  placeholder="Digite sua mensagem..."
                  rows={4}
                  data-testid="textarea-message-content"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                {sendMessageMutation.isPending ? "Enviando..." : "Enviar Mensagem"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Messages List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Histórico de Mensagens</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="sent">Enviadas</TabsTrigger>
                <TabsTrigger value="received">Recebidas</TabsTrigger>
                <TabsTrigger value="failed">Falhas</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6 space-y-4">
                {demoMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg border ${
                      message.direction === "sent" 
                        ? "bg-blue-50 border-blue-200 ml-8" 
                        : "bg-gray-50 border-gray-200 mr-8"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(message.type)}
                        <span className="font-semibold">{message.customerName}</span>
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusText(message.status)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    
                    {message.subject && (
                      <p className="font-medium text-gray-900 mb-1">{message.subject}</p>
                    )}
                    
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))}
                
                {demoMessages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma mensagem encontrada</p>
                    <p className="text-sm">Envie sua primeira mensagem para começar</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col" data-testid="button-reminder-renewals">
              <Clock className="w-6 h-6 mb-2" />
              Lembretes de Renovação
            </Button>
            <Button variant="outline" className="h-20 flex-col" data-testid="button-appointment-confirmations">
              <Calendar className="w-6 h-6 mb-2" />
              Confirmações de Agendamento
            </Button>
            <Button variant="outline" className="h-20 flex-col" data-testid="button-promotional-campaigns">
              <Send className="w-6 h-6 mb-2" />
              Campanhas Promocionais
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}