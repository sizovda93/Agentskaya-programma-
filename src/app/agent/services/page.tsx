"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { AiChat } from "@/components/services/ai-chat";
import { LawyerQuestion } from "@/components/services/lawyer-question";
import { Bot } from "lucide-react";

export default function AgentServicesPage() {
  return (
    <div>
      <PageHeader
        title="Сервис для партнёров"
        description="Юридическая поддержка и консультации"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Сервис" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Вопрос юристу */}
        <Card className="overflow-hidden">
          <LawyerQuestion />
        </Card>

        {/* Чат с ИИ */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Чат с ИИ</h4>
              <p className="text-xs text-muted-foreground">Быстрая юридическая консультация</p>
            </div>
          </div>
          <AiChat />
        </Card>
      </div>
    </div>
  );
}
