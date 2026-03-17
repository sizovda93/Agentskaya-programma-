"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { DataTable } from "@/components/dashboard/data-table";
import { UserStatusBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatCurrency } from "@/lib/utils";

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
}

export default function ManagerAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.ok ? r.json() : [])
      .then(setAgents)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const filtered = agents.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (a.city || '').toLowerCase().includes(search.toLowerCase())
  );

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
      key: "spec",
      title: "Специализация",
      render: (a: AgentRow) => <span className="text-muted-foreground text-sm">{a.specialization}</span>,
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
      render: (a: AgentRow) => <span className="font-medium">{formatCurrency(Number(a.totalRevenue))}</span>,
      className: "text-right",
    },
    {
      key: "rating",
      title: "Рейтинг",
      render: (a: AgentRow) => <span>⭐ {a.rating}</span>,
    },
    {
      key: "status",
      title: "Статус",
      render: (a: AgentRow) => <UserStatusBadge status={a.userStatus as "active" | "inactive" | "blocked"} />,
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
