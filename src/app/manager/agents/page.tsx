"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { DataTable } from "@/components/dashboard/data-table";
import { UserStatusBadge } from "@/components/dashboard/status-badges";
import { Badge } from "@/components/ui/badge";
import { mockAgents } from "@/lib/mock/data";
import { formatCurrency } from "@/lib/utils";
import { Agent } from "@/types";

export default function ManagerAgentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = mockAgents.filter(
    (a) =>
      a.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      title: "Агент",
      render: (a: Agent) => (
        <div>
          <p className="font-medium">{a.user.fullName}</p>
          <p className="text-xs text-muted-foreground">{a.city}</p>
        </div>
      ),
    },
    {
      key: "spec",
      title: "Специализация",
      render: (a: Agent) => <span className="text-muted-foreground text-sm">{a.specialization}</span>,
    },
    {
      key: "leads",
      title: "Лиды",
      render: (a: Agent) => (
        <span>
          <span className="font-medium">{a.activeLeads}</span>
          <span className="text-muted-foreground"> / {a.totalLeads}</span>
        </span>
      ),
    },
    {
      key: "revenue",
      title: "Доход",
      render: (a: Agent) => <span className="font-medium">{formatCurrency(a.totalRevenue)}</span>,
      className: "text-right",
    },
    {
      key: "rating",
      title: "Рейтинг",
      render: (a: Agent) => <span>⭐ {a.rating}</span>,
    },
    {
      key: "status",
      title: "Статус",
      render: (a: Agent) => <UserStatusBadge status={a.user.status} />,
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
        onRowClick={(a: Agent) => router.push(`/manager/agents/${a.id}`)}
      />
    </div>
  );
}
