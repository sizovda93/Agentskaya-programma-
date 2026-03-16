"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/dashboard/status-badges";
import { mockLeads, mockConversations, mockPayouts } from "@/lib/mock/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AgentDashboard() {
  const myLeads = mockLeads.filter((l) => l.assignedAgentId === "a1");
  const activeLeads = myLeads.filter((l) => !["won", "lost"].includes(l.status));
  const myConversations = mockConversations.filter((c) => c.agentId === "a1");
  const unreadCount = myConversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const myPayouts = mockPayouts.filter((p) => p.agentId === "a1");

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Обзор вашей активности и ключевые показатели"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Активные лиды"
          value={activeLeads.length}
          change="+2 за неделю"
          changeType="positive"
          icon="Users"
        />
        <StatCard
          title="Непрочитанные"
          value={unreadCount}
          change="3 диалога"
          changeType="neutral"
          icon="MessageSquare"
        />
        <StatCard
          title="Заработано (март)"
          value={formatCurrency(60000)}
          change="+33% к февралю"
          changeType="positive"
          icon="Wallet"
        />
        <StatCard
          title="Конверсия"
          value="24%"
          change="+5% к февралю"
          changeType="positive"
          icon="Target"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Последние лиды</CardTitle>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все лиды <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myLeads.slice(0, 4).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/agent/leads/${lead.id}`}
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

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Активные диалоги</CardTitle>
            <Link
              href="/agent/messages"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все сообщения <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myConversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{conv.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5 ml-3">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
