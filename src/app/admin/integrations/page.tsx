"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, MessageSquare, Bot, CreditCard, Workflow, Database } from "lucide-react";

const integrations = [
  {
    name: "Supabase",
    description: "База данных и аутентификация",
    icon: Database,
    status: "planned" as const,
    category: "Инфраструктура",
  },
  {
    name: "Telegram Bot",
    description: "Приём заявок и коммуникации через Telegram",
    icon: MessageSquare,
    status: "planned" as const,
    category: "Мессенджеры",
  },
  {
    name: "WhatsApp Business",
    description: "Коммуникации через WhatsApp API",
    icon: MessageSquare,
    status: "planned" as const,
    category: "Мессенджеры",
  },
  {
    name: "AI Engine (OpenAI)",
    description: "AI-ассистент для обработки обращений",
    icon: Bot,
    status: "planned" as const,
    category: "AI",
  },
  {
    name: "n8n Workflows",
    description: "Автоматизация бизнес-процессов",
    icon: Workflow,
    status: "planned" as const,
    category: "Автоматизация",
  },
  {
    name: "Платёжная система",
    description: "Обработка платежей и выплат агентам",
    icon: CreditCard,
    status: "planned" as const,
    category: "Финансы",
  },
];

const statusConfig = {
  active: { label: "Активно", variant: "success" as const },
  planned: { label: "Запланировано", variant: "secondary" as const },
  error: { label: "Ошибка", variant: "destructive" as const },
};

export default function AdminIntegrationsPage() {
  return (
    <div>
      <PageHeader
        title="Интеграции"
        description="Подключённые сервисы и API"
        breadcrumbs={[
          { title: "Дашборд", href: "/admin/dashboard" },
          { title: "Интеграции" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const status = statusConfig[integration.status];
          return (
            <Card key={integration.name} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <h3 className="font-medium mb-1">{integration.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                <span className="text-xs text-muted-foreground">{integration.category}</span>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plug className="h-3.5 w-3.5 mr-1" /> Настроить
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
