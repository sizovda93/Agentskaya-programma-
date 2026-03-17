"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { DataTable } from "@/components/dashboard/data-table";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { UserRole } from "@/types";

interface UserRow {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.ok ? r.json() : [])
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

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
      key: "phone",
      title: "Телефон",
      render: (u: UserRow) => <span className="text-muted-foreground">{u.phone}</span>,
    },
    {
      key: "role",
      title: "Роль",
      render: (u: UserRow) => <RoleBadge role={u.role as UserRole} />,
    },
    {
      key: "status",
      title: "Статус",
      render: (u: UserRow) => <UserStatusBadge status={u.status as "active" | "inactive" | "blocked"} />,
    },
    {
      key: "created",
      title: "Дата регистрации",
      render: (u: UserRow) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Пользователи"
        description="Управление пользователями системы"
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
