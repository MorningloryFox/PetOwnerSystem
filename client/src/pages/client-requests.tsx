import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Star, HelpCircle, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface ClientRequest {
  id: string;
  customerName: string;
  type: "feedback" | "support" | "suggestion" | "complaint";
  subject: string;
  message: string;
  status: "pending" | "responded" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  rating?: number;
}

export default function ClientRequests() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["/api/client-requests"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "responded": return <MessageSquare className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "responded": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feedback": return <Star className="w-4 h-4" />;
      case "support": return <HelpCircle className="w-4 h-4" />;
      case "suggestion": return <MessageSquare className="w-4 h-4" />;
      case "complaint": return <AlertCircle className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const demoRequests: ClientRequest[] = [
    {
      id: "1",
      customerName: "Maria Silva",
      type: "feedback",
      subject: "Excelente atendimento!",
      message: "Adorei o novo sistema de agendamento. Muito mais fácil marcar os banhos da Luna. A equipe está de parabéns!",
      status: "resolved",
      priority: "low",
      createdAt: "2025-01-10T14:30:00",
      rating: 5
    },
    {
      id: "2",
      customerName: "João Santos",
      type: "support",
      subject: "Dúvida sobre pacote vencido",
      message: "Meu pacote venceu ontem, mas ainda tenho 2 usos disponíveis. É possível usar ou preciso renovar primeiro?",
      status: "pending",
      priority: "medium",
      createdAt: "2025-01-11T09:15:00"
    },
    {
      id: "3",
      customerName: "Ana Costa",
      type: "suggestion",
      subject: "Sugestão para melhorar o app",
      message: "Seria ótimo ter notificações push quando o agendamento for confirmado. Também sugiro um histórico de fotos dos pets após cada sessão.",
      status: "responded",
      priority: "low",
      createdAt: "2025-01-09T16:45:00"
    },
    {
      id: "4",
      customerName: "Carlos Oliveira",
      type: "complaint",
      subject: "Problema com último agendamento",
      message: "Cheguei no horário marcado mas não tinha ninguém para atender. Perdi tempo e meu pet ficou estressado esperando.",
      status: "pending",
      priority: "high",
      createdAt: "2025-01-11T11:20:00"
    }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  const filteredRequests = activeTab === "all" ? demoRequests : demoRequests.filter(r => r.status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitações dos Clientes</h1>
        <p className="text-gray-600 mt-2">
          Gerencie feedbacks, sugestões e solicitações de suporte dos seus clientes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">2</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Respondidas</p>
                <p className="text-2xl font-bold text-blue-600">1</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolvidas</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfação</p>
                <p className="text-2xl font-bold text-purple-600">5.0</p>
              </div>
              <Star className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Solicitações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="responded">Respondidas</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(request.type)}
                          <span className="font-semibold">{request.customerName}</span>
                        </div>
                        <Badge className={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{request.subject}</h3>
                    <p className="text-gray-600 mb-3">{request.message}</p>
                    
                    {request.rating && (
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < request.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-1">({request.rating}/5)</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button size="sm" data-testid={`button-respond-${request.id}`}>
                            Responder
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-mark-resolved-${request.id}`}>
                            Marcar como Resolvido
                          </Button>
                        </>
                      )}
                      {request.status === "responded" && (
                        <Button size="sm" variant="outline" data-testid={`button-mark-resolved-${request.id}`}>
                          Marcar como Resolvido
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma solicitação encontrada nesta categoria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}