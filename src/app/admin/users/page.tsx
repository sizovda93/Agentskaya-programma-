"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { DataTable } from "@/components/dashboard/data-table";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import { User } from "@/types";
import { Plus } from "lucide-react";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      title: "Пользователь",
      render: (u: User) => (
        <div>
          <p className="font-medium">{u.fullName}</p>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Телефон",
      render: (u: User) => <span className="text-muted-foreground">{u.phone}</span>,
    },
    {
      key: "role",
      title: "Роль",
      render: (u: User) => <RoleBadge role={u.role} />,
    },
    {
      key: "status",
      title: "Статус",
      render: (u: User) => <UserStatusBadge status={u.status} />,
    },
    {
      key: "created",
      title: "Дата регистрации",
      render: (u: User) => <span className="text-muted-foreground">{formatDate(u.createdAt)}</span>,
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
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Добавить
          </Button>
        }
      />
      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по имени или email..." />
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
