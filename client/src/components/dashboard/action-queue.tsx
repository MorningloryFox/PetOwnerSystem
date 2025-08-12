import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { openWhatsApp } from "@/lib/whatsapp";

interface ActionQueueItem {
  id: string;
  customerId: string;
  customerName: string;
  petName: string;
  petBreed: string;
  petImage: string;
  packageId: string;
  priority: "high" | "medium" | "low";
  reason: string;
  expiresIn?: number;
  remainingUses?: number;
  lastUsedDays?: number;
}

interface ActionQueueProps {
  items: ActionQueueItem[];
}

const priorityColors = {
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-800",
};

const priorityLabels = {
  high: "Alta Prioridade",
  medium: "Média Prioridade", 
  low: "Baixa Prioridade",
};

export function ActionQueue({ items }: ActionQueueProps) {
  const handleWhatsApp = (item: ActionQueueItem) => {
    openWhatsApp(item.customerId, `Olá ${item.customerName}! Como está o ${item.petName}? ${item.reason}`);
  };

  const handleSchedule = (item: ActionQueueItem) => {
    // TODO: Implement appointment scheduling
    console.log('Opening appointment scheduler for:', item.customerName);
  };

  const handleRenew = (item: ActionQueueItem) => {
    // TODO: Implement package renewal
    console.log('Initiating package renewal for:', item.customerName);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Fila de Ações
          </CardTitle>
          <Badge variant="destructive" data-testid="action-queue-count">
            {items.length} pendentes
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <p>Nenhuma ação pendente no momento</p>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className="px-4 py-4 hover:bg-gray-50 transition-colors border-l-4 border-l-orange-400"
                data-testid={`action-item-${item.id}`}
              >
                <div className="flex items-start space-x-3">
                  {/* Pet Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {item.petName.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900" data-testid={`pet-name-${item.id}`}>
                            {item.petName}
                          </h4>
                          <span className="text-xs text-gray-500">({item.petBreed})</span>
                          <Badge
                            variant="secondary"
                            className={cn("text-xs", priorityColors[item.priority])}
                            data-testid={`priority-${item.id}`}
                          >
                            {priorityLabels[item.priority]}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600" data-testid={`customer-info-${item.id}`}>
                          Cliente: <span className="font-medium">{item.customerName}</span>
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.reason}
                        </p>
                        
                        {/* Status Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.expiresIn !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              ⏰ Expira em {item.expiresIn} dias
                            </span>
                          )}
                          {item.remainingUses !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              📦 {item.remainingUses} usos restantes
                            </span>
                          )}
                          {item.lastUsedDays !== undefined && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                              🕐 Último uso há {item.lastUsedDays} dias
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-1.5 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleWhatsApp(item)}
                          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 h-auto"
                          data-testid={`button-whatsapp-${item.id}`}
                        >
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSchedule(item)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1.5 h-auto"
                          data-testid={`button-schedule-${item.id}`}
                        >
                          Agendar
                        </Button>
                        {item.priority !== "low" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRenew(item)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50 text-xs px-3 py-1.5 h-auto"
                            data-testid={`button-renew-${item.id}`}
                          >
                            Renovar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <button 
              className="text-sm font-medium text-primary hover:text-primary/80"
              data-testid="button-view-all-actions"
            >
              Ver todos os {items.length} itens →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
