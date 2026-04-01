"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { AiChat } from "@/components/services/ai-chat";
import { LawyerQuestion } from "@/components/services/lawyer-question";
import { Bot, Scale } from "lucide-react";

type Tab = "lawyer" | "ai";

export default function AgentServicesPage() {
  const [tab, setTab] = useState<Tab>("lawyer");

  return (
    <div>
      <PageHeader
        title="Правовая защита для партнёра"
        description="Юридическая поддержка и консультации"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Правовая защита" },
        ]}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("lawyer")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "lawyer"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-4 w-4" /> Обращение к юристу
        </button>
        <button
          onClick={() => setTab("ai")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "ai"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bot className="h-4 w-4" /> Чат с ИИ
        </button>
      </div>

      {tab === "lawyer" && (
        <Card className="overflow-hidden">
          <LawyerQuestion />
        </Card>
      )}

      {tab === "ai" && (
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 p-4 pb-0">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Чат с ИИ</h4>
              <p className="text-xs text-muted-foreground">Быстрая юридическая консультация по вопросам БФЛ</p>
            </div>
          </div>
          <AiChat />
        </Card>
      )}
    </div>
  );
}
