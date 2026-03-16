"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadStatusBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { mockLeads, mockAgents, mockConversations } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ManagerDashboard() {
  const escalated = mockConversations.filter((c) => c.status === "escalated");
  const totalRevenue = mockAgents.reduce((acc, a) => acc + a.totalRevenue, 0);

  return (
    <div>
      <PageHeader
        title="Дашборд менеджера"
        description="Обзор агентской сети и показателей"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Агентов"
          value={mockAgents.length}
          change="2 активных"
          changeType="positive"
          icon="Users"
        />
        <StatCard
          title="Лидов в работе"
          value={mockLeads.filter((l) => !["won", "lost"].includes(l.status)).length}
          change="+3 за неделю"
          changeType="positive"
          icon="UserPlus"
        />
        <StatCard
          title="Эскалации"
          value={escalated.length}
          change="Требуют внимания"
          changeType="negative"
          icon="MessageSquare"
        />
        <StatCard
          title="Общий доход"
          value={formatCurrency(totalRevenue)}
          change="+18% к февралю"
          changeType="positive"
          icon="Wallet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agents */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Агенты</CardTitle>
            <Link href="/manager/agents" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все агенты <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAgents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/manager/agents/${agent.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{agent.user.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.city} · {agent.activeLeads} активных лидов
                    </p>
                  </div>
                  <UserStatusBadge status={agent.user.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Новые лиды</CardTitle>
            <Link href="/manager/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все лиды <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockLeads.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/manager/leads/${lead.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">{lead.city} · {formatDate(lead.createdAt)}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
