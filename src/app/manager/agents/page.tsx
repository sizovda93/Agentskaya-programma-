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
import { formatCurrency } from "@/lib/utils";
import type { AgentLifecycle } from "@/types";

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
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("all");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

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
      />

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
