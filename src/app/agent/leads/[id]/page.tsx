"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadDetailsPanel } from "@/components/leads/lead-details-panel";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { TimelineEvent, Lead } from "@/types";

const EVENT_TITLES: Record<string, string> = {
  created: "Лид создан",
  status_changed: "Смена статуса",
  agent_assigned: "Назначен партнёр",
  agent_reassigned: "Переназначен партнёр",
  ownership_assigned: "Вы закреплены за лидом",
  ownership_confirmed: "Закрепление подтверждено",
  ownership_overridden: "Лид переназначен другому партнёру",
  duplicate_detected: "Обнаружен возможный дубль",
  conflict_resolved: "Конфликт решён",
  payout_created: "Создана выплата",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  contacted: "Контакт",
  qualified: "Квалифицирован",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Договор заключён",
  lost: "Потерян",
};

const EVENT_TYPE: Record<string, TimelineEvent["type"]> = {
  status_changed: "status_change",
  agent_assigned: "assignment",
  agent_reassigned: "assignment",
  ownership_assigned: "assignment",
  ownership_confirmed: "assignment",
  ownership_overridden: "assignment",
  payout_created: "payment",
  duplicate_detected: "note",
  conflict_resolved: "note",
  created: "note",
};

const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

function formatDescription(eventType: string, details?: string): string | undefined {
  if (!details) return undefined;
  if (eventType === "ownership_assigned" || eventType === "agent_assigned" || eventType === "agent_reassigned") {
    return undefined;
  }
  if (eventType === "status_changed") {
    const m = details.match(/^(\w+)\s*→\s*(\w+)$/);
    if (m) return `${STATUS_LABELS[m[1]] || m[1]} → ${STATUS_LABELS[m[2]] || m[2]}`;
    return details;
  }
  if (eventType === "duplicate_detected") {
    if (details.includes("email")) return "Совпадение с другим лидом по e-mail";
    if (details.includes("phone")) return "Совпадение с другим лидом по телефону";
    return "Совпадение с другим лидом в системе";
  }
  if (eventType === "conflict_resolved" || eventType === "ownership_confirmed" || eventType === "ownership_overridden") {
    return details.replace(UUID_RE, "").replace(/\s+/g, " ").trim() || undefined;
  }
  return details;
}

export default function AgentLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [leadRes, eventsRes] = await Promise.all([
          fetch(`/api/leads/${id}`),
          fetch(`/api/leads/${id}/events`),
        ]);
        if (!leadRes.ok) {
          setError(leadRes.status === 404 ? 'not_found' : 'error');
          return;
        }
        const leadData = await leadRes.json();
        setLead(leadData);

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData.map((e: { id: string; eventType: string; details?: string; createdAt: string }) => ({
            id: e.id,
            title: EVENT_TITLES[e.eventType] || e.eventType.replace(/_/g, " "),
            description: formatDescription(e.eventType, e.details),
            date: e.createdAt,
            type: EVENT_TYPE[e.eventType] || "note",
          })));
        }
      } catch {
        setError('error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (error === 'not_found' || !lead) {
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
              {events.length > 0 ? (
                <LeadTimeline events={events} />
              ) : (
                <p className="text-sm text-muted-foreground">Нет событий</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
