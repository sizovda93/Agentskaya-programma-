"use client";

import { use } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/dashboard/status-badges";
import { StatCard } from "@/components/dashboard/stat-card";
import { mockAgents, mockLeads } from "@/lib/mock/data";
import { getInitials, formatCurrency } from "@/lib/utils";

const onboardingLabels: Record<string, string> = {
  pending: "Ожидание",
  in_progress: "В процессе",
  completed: "Завершён",
  rejected: "Отклонён",
};

export default function ManagerAgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const agent = mockAgents.find((a) => a.id === id);

  if (!agent) {
    return (
      <div>
        <PageHeader title="Агент не найден" breadcrumbs={[{ title: "Агенты", href: "/manager/agents" }, { title: "Не найден" }]} />
      </div>
    );
  }

  const agentLeads = mockLeads.filter((l) => l.assignedAgentId === agent.id);

  return (
    <div>
      <PageHeader
        title={agent.user.fullName}
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Агенты", href: "/manager/agents" },
          { title: agent.user.fullName },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-16 w-16 mb-4">
              <AvatarFallback className="text-lg">{getInitials(agent.user.fullName)}</AvatarFallback>
            </Avatar>
            <h2 className="font-semibold">{agent.user.fullName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{agent.user.email}</p>
            <div className="flex gap-2 mt-3">
              <UserStatusBadge status={agent.user.status} />
              <Badge variant="outline">{onboardingLabels[agent.onboardingStatus]}</Badge>
            </div>
            <div className="w-full mt-6 pt-6 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Город</span>
                <span>{agent.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Специализация</span>
                <span>{agent.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон</span>
                <span>{agent.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Рейтинг</span>
                <span>⭐ {agent.rating}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard title="Активные лиды" value={agent.activeLeads} icon="Users" />
          <StatCard title="Всего лидов" value={agent.totalLeads} icon="UserPlus" />
          <StatCard title="Общий доход" value={formatCurrency(agent.totalRevenue)} icon="Wallet" />
          <StatCard title="Конверсия" value="24%" change="+5%" changeType="positive" icon="Target" />
        </div>
      </div>
    </div>
  );
}
