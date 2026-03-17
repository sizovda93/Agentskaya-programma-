"use client";

import { use, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadDetailsPanel } from "@/components/leads/lead-details-panel";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lead, LeadStatus, TimelineEvent } from "@/types";
import { UserPlus, MessageSquare } from "lucide-react";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Новый" },
  { value: "contacted", label: "Контакт" },
  { value: "qualified", label: "Квалифицирован" },
  { value: "proposal", label: "Предложение" },
  { value: "negotiation", label: "Переговоры" },
  { value: "won", label: "Закрыт (выигран)" },
  { value: "lost", label: "Потерян" },
];

export default function ManagerLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLead(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead || newStatus === lead.status) return;
    setStatusSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
        setStatusMsg("Статус обновлён");
      } else {
        const err = await res.json();
        setStatusMsg(err.error || "Ошибка");
      }
    } catch {
      setStatusMsg("Ошибка сети");
    } finally {
      setStatusSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (loading) return <CardSkeleton />;

  if (!lead) {
    return (
      <div>
        <PageHeader title="Лид не найден" breadcrumbs={[{ title: "Лиды", href: "/manager/leads" }, { title: "Не найден" }]} />
      </div>
    );
  }

  const timeline: TimelineEvent[] = [
    { id: "t1", title: "Лид создан", description: "Дата создания", date: lead.createdAt, type: "status_change" },
  ];

  return (
    <div>
      <PageHeader
        title={lead.fullName}
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Лиды", href: "/manager/leads" },
          { title: lead.fullName },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-1" /> Назначить агента
            </Button>
            <Button size="sm">
              <MessageSquare className="h-4 w-4 mr-1" /> Открыть диалог
            </Button>
          </div>
        }
      />

      {/* Status changer */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <span className="text-sm font-medium">Статус:</span>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusSaving}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {statusSaving && <span className="text-xs text-muted-foreground">Сохранение...</span>}
          {statusMsg && <span className="text-xs text-muted-foreground">{statusMsg}</span>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LeadDetailsPanel lead={lead} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">История</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadTimeline events={timeline} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
