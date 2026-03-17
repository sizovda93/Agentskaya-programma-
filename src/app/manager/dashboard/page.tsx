"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadStatusBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LeadStatus } from "@/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AgentRow {
  id: string;
  fullName: string;
  email: string;
  city: string;
  activeLeads: number;
  totalRevenue: number;
  userStatus: string;
}

interface LeadRow {
  id: string;
  fullName: string;
  city: string;
  status: string;
  createdAt: string;
}

interface Stats {
  leads: { total: string; newCount: string; wonCount: string; totalRevenue: string };
  agents: { total: string; active: string };
  conversations: { total: string; active: string; escalated: string };
  payouts: { totalPaid: string; processing: string; pending: string };
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, agentsRes, leadsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/agents'),
          fetch('/api/leads'),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
        if (leadsRes.ok) setLeads(await leadsRes.json());
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSkeleton />;

  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.status)).length;
  const escalatedCount = stats ? Number(stats.conversations.escalated) : 0;
  const totalRevenue = agents.reduce((acc, a) => acc + Number(a.totalRevenue || 0), 0);

  return (
    <div>
      <PageHeader
        title="Дашборд менеджера"
        description="Обзор агентской сети и показателей"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Агентов" value={agents.length} change={`${stats?.agents.active || 0} активных`} changeType="positive" icon="Users" />
        <StatCard title="Лидов в работе" value={activeLeads} icon="UserPlus" />
        <StatCard title="Эскалации" value={escalatedCount} change={escalatedCount > 0 ? "Требуют внимания" : undefined} changeType="negative" icon="MessageSquare" />
        <StatCard title="Общий доход" value={formatCurrency(totalRevenue)} icon="Wallet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Агенты</CardTitle>
            <Link href="/manager/agents" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все агенты <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/manager/agents/${agent.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{agent.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.city} · {agent.activeLeads} активных лидов
                    </p>
                  </div>
                  <UserStatusBadge status={agent.userStatus as "active" | "inactive" | "blocked"} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Новые лиды</CardTitle>
            <Link href="/manager/leads" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все лиды <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/manager/leads/${lead.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">{lead.city} · {formatDate(lead.createdAt)}</p>
                  </div>
                  <LeadStatusBadge status={lead.status as LeadStatus} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
