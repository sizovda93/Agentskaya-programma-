"use client";

import { use } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadDetailsPanel } from "@/components/leads/lead-details-panel";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockLeads } from "@/lib/mock/data";
import { TimelineEvent } from "@/types";
import { MessageSquare, Phone } from "lucide-react";

const mockTimeline: TimelineEvent[] = [
  { id: "t1", title: "Лид создан", description: "Заявка с сайта", date: "2026-03-15T14:30:00Z", type: "status_change" },
  { id: "t2", title: "Назначен агент", description: "Алексей Петров", date: "2026-03-15T14:35:00Z", type: "assignment" },
  { id: "t3", title: "Первый контакт", description: "Звонок, клиент заинтересован", date: "2026-03-15T15:00:00Z", type: "message" },
  { id: "t4", title: "Статус: Контакт", date: "2026-03-15T15:05:00Z", type: "status_change" },
];

export default function AgentLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lead = mockLeads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div>
        <PageHeader title="Лид не найден" breadcrumbs={[{ title: "Лиды", href: "/agent/leads" }, { title: "Не найден" }]} />
        <p className="text-muted-foreground">Лид с ID {id} не найден.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={lead.fullName}
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Лиды", href: "/agent/leads" },
          { title: lead.fullName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" /> Позвонить
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-1" /> Написать
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadDetailsPanel lead={lead} />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">История</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadTimeline events={mockTimeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
