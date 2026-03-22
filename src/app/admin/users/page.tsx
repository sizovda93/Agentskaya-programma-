"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { DataTable } from "@/components/dashboard/data-table";
import { RoleBadge, UserStatusBadge, TierBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { UserRole, AgentTier } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface UserRow {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  agentId?: string;
  managerId?: string;
  managerName?: string;
  tier?: string;
}

interface ManagerOption {
  id: string;
  fullName: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const loadUsers = () =>
    fetch("/api/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setUsers(data);
        // Extract managers from users list
        setManagers(
          data
            .filter((u: any) => u.role === "manager")
            .map((u: any) => ({ id: u.id, fullName: u.fullName }))
        );
      });

  useEffect(() => {
    loadUsers().finally(() => setLoading(false));
  }, []);

  const handleAssignManager = async (agentId: string, managerId: string | null) => {
    setSaving(agentId);
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId: managerId || null }),
      });
      await loadUsers();
    } catch { /* ignore */ }
    finally { setSaving(null); }
  };

  if (loading) return <LoadingSkeleton />;

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      title: "Пользователь",
      render: (u: UserRow) => (
        <div>
          <p className="font-medium">{u.fullName}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      title: "Роль",
      render: (u: UserRow) => (
        <div className="flex items-center gap-2">
          <RoleBadge role={u.role as UserRole} />
          {u.role === "agent" && u.tier && <TierBadge tier={u.tier as AgentTier} />}
        </div>
      ),
    },
    {
      key: "manager",
      title: "Менеджер",
      render: (u: UserRow) => {
        if (u.role !== "agent" || !u.agentId) return <span className="text-muted-foreground">—</span>;
        return (
          <select
            className="h-8 rounded-md border border-border bg-background px-2 text-sm"
            value={u.managerId || ""}
            disabled={saving === u.agentId}
            onChange={(e) => handleAssignManager(u.agentId!, e.target.value || null)}
          >
            <option value="">Не назначен</option>
            {managers.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName}</option>
            ))}
          </select>
        );
      },
    },
    {
      key: "status",
      title: "Статус",
      render: (u: UserRow) => <UserStatusBadge status={u.status as "active" | "inactive" | "blocked"} />,
    },
    {
      key: "created",
      title: "Дата",
      render: (u: UserRow) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Пользователи"
        description="Управление пользователями и привязка агентов к менеджерам"
        breadcrumbs={[
          { title: "Дашборд", href: "/admin/dashboard" },
          { title: "Пользователи" },
        ]}
      />
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по имени или email..." />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
