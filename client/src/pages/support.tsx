import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, MessageCircle, Bug, HelpCircle, Phone } from "lucide-react";

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: ""
  });
  const { toast } = useToast();

  const sendSupportEmail = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/support/send-email", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Mensagem enviada!",
        description: "Recebemos sua solicitação e responderemos em breve.",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: ""
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar",
        description: "Tente novamente ou entre em contato diretamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para enviar.",
        variant: "destructive",
      });
      return;
    }
    sendSupportEmail.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Central de Suporte</h1>
        <p className="text-gray-600 mt-2">
          Precisa de ajuda? Entre em contato conosco para suporte técnico, dúvidas ou sugestões.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contato Direto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Email do Desenvolvedor</Label>
                <p className="text-sm text-gray-600">morningloryfox@gmail.com</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Tempo de Resposta</Label>
                <p className="text-sm text-gray-600">Até 24 horas úteis</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-red-500" />
                <span className="text-sm">Bugs e problemas técnicos</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Dúvidas sobre o sistema</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Sugestões e melhorias</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Enviar Solicitação de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Seu nome"
                      data-testid="input-support-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="seu.email@exemplo.com"
                      data-testid="input-support-email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger data-testid="select-support-category">
                      <SelectValue placeholder="Selecione o tipo de solicitação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug/Problema Técnico</SelectItem>
                      <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                      <SelectItem value="help">Ajuda/Dúvida</SelectItem>
                      <SelectItem value="feedback">Feedback/Sugestão</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="subject">Assunto *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Breve descrição do problema ou solicitação"
                    data-testid="input-support-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Descreva detalhadamente sua solicitação..."
                    rows={6}
                    data-testid="textarea-support-message"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={sendSupportEmail.isPending}
                  data-testid="button-send-support"
                >
                  {sendSupportEmail.isPending ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}