"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { StatCard } from "@/components/dashboard/stat-card";
import { DataTable } from "@/components/dashboard/data-table";
import { LifecycleBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { UserPlus } from "lucide-react";
import type { AgentLifecycle } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AgentRow {
  id: string;
  fullName: string;
  email: string;
  city: string;
  specialization: string;
  activeLeads: number;
  totalLeads: number;
  totalRevenue: number;
  rating: number;
  userStatus: string;
  lifecycle: AgentLifecycle;
}

type TabFilter = "all" | "learning" | "ready" | "active" | "problem";

export default function ManagerAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [unassigned, setUnassigned] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showUnassigned, setShowUnassigned] = useState(false);

  const loadData = () =>
    Promise.all([
      fetch("/api/agents").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/agents?unassigned=true").then((r) => (r.ok ? r.json() : [])),
    ]).then(([myAgents, free]) => {
      setAgents(myAgents);
      setUnassigned(free);
    });

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleClaim = async (agentId: string) => {
    setClaiming(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: "self" }),
      });
      if (res.ok) {
        await loadData();
        setShowUnassigned(unassigned.length > 1); // hide if was last one
      }
    } catch { /* ignore */ }
    finally { setClaiming(null); }
  };

  if (loading) return <LoadingSkeleton />;

  // Stats
  const learning = agents.filter((a) => ["registered", "learning_in_progress"].includes(a.lifecycle));
  const activated = agents.filter((a) => a.lifecycle === "activated");
  const active = agents.filter((a) => a.lifecycle === "active");
  const problem = agents.filter((a) => ["inactive", "blocked", "rejected"].includes(a.lifecycle));

  // Filter by tab
  const tabFiltered = (() => {
    switch (tab) {
      case "learning": return learning;
      case "ready": return activated;
      case "active": return active;
      case "problem": return problem;
      default: return agents;
    }
  })();

  // Filter by search
  const filtered = tabFiltered.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: "all", label: "Все", count: agents.length },
    { key: "learning", label: "Обучаются", count: learning.length },
    { key: "ready", label: "Готовы к работе", count: activated.length },
    { key: "active", label: "Активные", count: active.length },
    { key: "problem", label: "Проблемные", count: problem.length },
  ];

  const columns = [
    {
      key: "name",
      title: "Агент",
      render: (a: AgentRow) => (
        <div>
          <p className="font-medium">{a.fullName}</p>
          <p className="text-xs text-muted-foreground">{a.city}</p>
        </div>
      ),
    },
    {
      key: "lifecycle",
      title: "Статус",
      render: (a: AgentRow) => <LifecycleBadge lifecycle={a.lifecycle} />,
    },
    {
      key: "leads",
      title: "Лиды",
      render: (a: AgentRow) => (
        <span>
          <span className="font-medium">{a.activeLeads}</span>
          <span className="text-muted-foreground"> / {a.totalLeads}</span>
        </span>
      ),
    },
    {
      key: "revenue",
      title: "Доход",
      render: (a: AgentRow) => (
        <span className="font-medium">{formatCurrency(Number(a.totalRevenue))}</span>
      ),
      className: "text-right",
    },
    {
      key: "rating",
      title: "Рейтинг",
      render: (a: AgentRow) => <span>⭐ {a.rating}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Агенты"
        description="Управление агентской сетью"
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Агенты" },
        ]}
        actions={
          unassigned.length > 0 ? (
            <Button size="sm" variant="outline" onClick={() => setShowUnassigned(!showUnassigned)}>
              <UserPlus className="h-4 w-4 mr-1" />
              Незакреплённые ({unassigned.length})
            </Button>
          ) : undefined
        }
      />

      {/* Unassigned agents panel */}
      {showUnassigned && unassigned.length > 0 && (
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Агенты без менеджера</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unassigned.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-background/60">
                  <div>
                    <p className="text-sm font-medium">{a.fullName}</p>
                    <p className="text-xs text-muted-foreground">{a.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleClaim(a.id)}
                    disabled={claiming === a.id}
                  >
                    {claiming === a.id ? "..." : "Закрепить за собой"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Всего" value={agents.length} icon="Users" />
        <StatCard title="Обучаются" value={learning.length} icon="BookOpen" />
        <StatCard title="Активные" value={active.length} icon="UserCheck" />
        <StatCard title="Проблемные" value={problem.length} icon="AlertTriangle" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-70">{t.count}</span>
          </Button>
        ))}
      </div>

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск агента..." />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={(a: AgentRow) => router.push(`/manager/agents/${a.id}`)}
      />
    </div>
  );
}
