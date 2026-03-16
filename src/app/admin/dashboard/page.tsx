"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockUsers, mockAgents, mockLeads, mockConversations } from "@/lib/mock/data";
import { RoleBadge, UserStatusBadge } from "@/components/dashboard/status-badges";
import { formatDate } from "@/lib/utils";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Панель администратора"
        description="Мониторинг системы и управление платформой"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Пользователей"
          value={mockUsers.length}
          change="+1 за неделю"
          changeType="positive"
          icon="Users"
        />
        <StatCard
          title="Агентов"
          value={mockAgents.length}
          change="2 активных"
          changeType="neutral"
          icon="UserPlus"
        />
        <StatCard
          title="Лидов в системе"
          value={mockLeads.length}
          change="+5 за неделю"
          changeType="positive"
          icon="Target"
        />
        <StatCard
          title="Диалогов"
          value={mockConversations.length}
          change="1 эскалация"
          changeType="negative"
          icon="MessageSquare"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Последние пользователи</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email} · {formatDate(user.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={user.role} />
                    <UserStatusBadge status={user.status} />
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
                <span className="text-muted-foreground">Next.js</span>
                <span className="font-mono">15.x</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Supabase</span>
                <span className="text-warning">Не подключён</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">AI Engine</span>
                <span className="text-warning">Не подключён</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">Telegram Bot</span>
                <span className="text-warning">Не подключён</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground">n8n Workflows</span>
                <span className="text-warning">Не подключён</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
