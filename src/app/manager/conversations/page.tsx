"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { Conversation } from "@/types";
import { DataTable } from "@/components/dashboard/data-table";
import { ConversationStatusBadge, ModeBadge, ChannelBadge } from "@/components/dashboard/status-badges";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";

export default function ManagerConversationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardSkeleton />;

  const filtered = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter((c) => c.status === "active" || c.status === "waiting");
  const escalated = filtered.filter((c) => c.status === "escalated");

  const columns = [
    {
      key: "client",
      title: "Клиент",
      render: (c: Conversation) => <span className="font-medium">{c.clientName}</span>,
    },
    {
      key: "channel",
      title: "Канал",
      render: (c: Conversation) => <ChannelBadge channel={c.channel || "web"} />,
    },
    {
      key: "mode",
      title: "Режим",
      render: (c: Conversation) => <ModeBadge mode={c.mode} />,
    },
    {
      key: "status",
      title: "Статус",
      render: (c: Conversation) => <ConversationStatusBadge status={c.status} />,
    },
    {
      key: "unread",
      title: "Непрочитано",
      render: (c: Conversation) =>
        c.unreadCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5">
            {c.unreadCount}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "lastMsg",
      title: "Последнее сообщение",
      render: (c: Conversation) => (
        <span className="text-muted-foreground text-sm truncate max-w-48 block">{c.lastMessage}</span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Диалоги"
        description="Мониторинг всех диалогов с клиентами"
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Диалоги" },
        ]}
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по имени клиента..." />
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Все ({filtered.length})</TabsTrigger>
          <TabsTrigger value="active">Активные ({active.length})</TabsTrigger>
          <TabsTrigger value="escalated">Эскалации ({escalated.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable columns={columns} data={filtered} onRowClick={(c: Conversation) => router.push(`/manager/conversations/${c.id}`)} />
        </TabsContent>
        <TabsContent value="active">
          <DataTable columns={columns} data={active} onRowClick={(c: Conversation) => router.push(`/manager/conversations/${c.id}`)} />
        </TabsContent>
        <TabsContent value="escalated">
          <DataTable columns={columns} data={escalated} onRowClick={(c: Conversation) => router.push(`/manager/conversations/${c.id}`)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
