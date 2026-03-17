"use client";

import { use, useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { LeadDetailsPanel } from "@/components/leads/lead-details-panel";
import { LeadTimeline } from "@/components/leads/lead-timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lead, TimelineEvent } from "@/types";
import { UserPlus, MessageSquare } from "lucide-react";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";

export default function ManagerLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLead(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
