import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Filter, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportReport = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      setIsExporting(false);
      toast({
        title: "Relatório exportado!",
        description: "O arquivo PDF foi baixado com sucesso.",
      });
    }, 2000);
  };

  const revenueData = [
    { name: "Jan", valor: 4800 },
    { name: "Fev", valor: 5200 },
    { name: "Mar", valor: 4600 },
    { name: "Abr", valor: 6100 },
    { name: "Mai", valor: 5800 },
    { name: "Jun", valor: 7200 },
  ];

  const servicesData = [
    { name: "Banho & Tosa", value: 45, color: "#3B82F6" },
    { name: "Tosa Higiênica", value: 25, color: "#10B981" },
    { name: "Hidratação", value: 15, color: "#F59E0B" },
    { name: "Corte de Unhas", value: 10, color: "#EF4444" },
    { name: "Outros", value: 5, color: "#8B5CF6" },
  ];

  const customerGrowthData = [
    { name: "Jan", novos: 12, ativos: 85 },
    { name: "Fev", novos: 15, ativos: 92 },
    { name: "Mar", novos: 18, ativos: 98 },
    { name: "Abr", novos: 22, ativos: 108 },
    { name: "Mai", novos: 19, ativos: 115 },
    { name: "Jun", novos: 25, ativos: 128 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">
            Análise detalhada do desempenho do seu negócio.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40" data-testid="select-report-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={isExporting}
            data-testid="button-export-report"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">R$ 7.200</p>
                <p className="text-sm text-green-500">+24% vs mês anterior</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
                <p className="text-2xl font-bold text-blue-600">128</p>
                <p className="text-sm text-blue-500">+11% vs mês anterior</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacotes Vendidos</p>
                <p className="text-2xl font-bold text-purple-600">42</p>
                <p className="text-sm text-purple-500">+18% vs mês anterior</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-600">R$ 85</p>
                <p className="text-sm text-orange-500">+7% vs mês anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                <Bar dataKey="valor" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Services Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {servicesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Customer Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="novos" stroke="#10B981" name="Novos Clientes" />
              <Line type="monotone" dataKey="ativos" stroke="#3B82F6" name="Clientes Ativos" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes (Por Receita)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Maria Silva", revenue: "R$ 480", visits: 8 },
                { name: "João Santos", revenue: "R$ 420", visits: 6 },
                { name: "Ana Costa", revenue: "R$ 380", visits: 7 },
                { name: "Carlos Oliveira", revenue: "R$ 320", visits: 5 }
              ].map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.visits} visitas</p>
                  </div>
                  <p className="font-bold text-green-600">{client.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { service: "Banho & Tosa", count: 45, revenue: "R$ 2.250" },
                { service: "Tosa Higiênica", count: 25, revenue: "R$ 625" },
                { service: "Hidratação", count: 15, revenue: "R$ 525" },
                { service: "Corte de Unhas", count: 10, revenue: "R$ 150" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{item.service}</p>
                    <p className="text-sm text-gray-600">{item.count} realizados</p>
                  </div>
                  <p className="font-bold text-blue-600">{item.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
