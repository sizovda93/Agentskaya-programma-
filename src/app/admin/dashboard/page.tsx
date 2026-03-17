"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { UserRole } from "@/types";

interface UserRow {
  id: string;
  role: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
}

interface Stats {
  leads: { total: string; newCount: string; wonCount: string; totalRevenue: string };
  agents: { total: string; active: string };
  conversations: { total: string; active: string; escalated: string };
  payouts: { totalPaid: string; processing: string; pending: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/users'),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Панель администратора"
        description="Мониторинг системы и управление платформой"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Пользователей" value={users.length} icon="Users" />
        <StatCard title="Агентов" value={stats?.agents.total || 0} change={`${stats?.agents.active || 0} активных`} changeType="neutral" icon="UserPlus" />
        <StatCard title="Лидов в системе" value={stats?.leads.total || 0} icon="Target" />
        <StatCard title="Диалогов" value={stats?.conversations.total || 0} change={Number(stats?.conversations.escalated) > 0 ? `${stats?.conversations.escalated} эскалаций` : undefined} changeType="negative" icon="MessageSquare" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Последние пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 6).map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email} · {formatDate(user.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role as UserRole} />
                    <UserStatusBadge status={user.status as "active" | "inactive" | "blocked"} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Системная информация</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Версия платформы</span>
                <span className="font-mono">1.0.0-beta</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">База данных</span>
                <span className="text-success">Подключена</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Файловое хранилище</span>
                <span className="text-success">Активно</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Авторизация</span>
                <span className="text-success">JWT + httpOnly</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Telegram Bot</span>
                <span className="text-warning">Не подключён</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">AI Engine</span>
                <span className="text-warning">Не подключён</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
