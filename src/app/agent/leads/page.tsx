"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { LeadTable } from "@/components/leads/lead-table";
import { mockLeads } from "@/lib/mock/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Lead } from "@/types";

export default function AgentLeadsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const myLeads = mockLeads.filter((l) => l.assignedAgentId === "a1");

  const filtered = myLeads.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase())
  );

  const activeLeads = filtered.filter((l) => !["won", "lost"].includes(l.status));
  const closedLeads = filtered.filter((l) => ["won", "lost"].includes(l.status));

  return (
    <div>
      <PageHeader
        title="Мои лиды"
        description="Управление вашими лидами и заявками"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Лиды" },
        ]}
      />

      <div className="mb-6">
        <SearchInput
          placeholder="Поиск по имени или городу..."
          value={search}
          onChange={setSearch}
        />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Активные ({activeLeads.length})</TabsTrigger>
          <TabsTrigger value="closed">Завершённые ({closedLeads.length})</TabsTrigger>
          <TabsTrigger value="all">Все ({filtered.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <LeadTable leads={activeLeads} onRowClick={(lead: Lead) => router.push(`/agent/leads/${lead.id}`)} />
        </TabsContent>
        <TabsContent value="closed">
          <LeadTable leads={closedLeads} onRowClick={(lead: Lead) => router.push(`/agent/leads/${lead.id}`)} />
        </TabsContent>
        <TabsContent value="all">
          <LeadTable leads={filtered} onRowClick={(lead: Lead) => router.push(`/agent/leads/${lead.id}`)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
