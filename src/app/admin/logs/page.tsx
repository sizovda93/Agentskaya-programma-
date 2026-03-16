"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { SearchInput } from "@/components/dashboard/search-input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";

const mockLogs = [
  { id: "log1", action: "user.login", user: "petrov@example.com", details: "Успешный вход в систему", level: "info" as const, createdAt: "2026-03-16T10:30:00Z" },
  { id: "log2", action: "lead.created", user: "system", details: "Создан лид: Иванов Иван Иванович", level: "info" as const, createdAt: "2026-03-16T10:15:00Z" },
  { id: "log3", action: "lead.assigned", user: "volkova@example.com", details: "Лид назначен агенту Алексей Петров", level: "info" as const, createdAt: "2026-03-16T10:10:00Z" },
  { id: "log4", action: "conversation.escalated", user: "system", details: "Диалог с Поповой Н.Д. эскалирован", level: "warning" as const, createdAt: "2026-03-16T09:00:00Z" },
  { id: "log5", action: "payout.rejected", user: "morozov@example.com", details: "Выплата отклонена: не завершён онбординг", level: "error" as const, createdAt: "2026-03-14T09:00:00Z" },
  { id: "log6", action: "user.registered", user: "system", details: "Новый агент зарегистрирован", level: "info" as const, createdAt: "2026-03-13T08:00:00Z" },
  { id: "log7", action: "document.signed", user: "petrov@example.com", details: "Документ подписан: Агентский договор", level: "success" as const, createdAt: "2026-03-12T15:00:00Z" },
  { id: "log8", action: "settings.updated", user: "novikova@example.com", details: "Обновлены настройки комиссий", level: "info" as const, createdAt: "2026-03-11T10:00:00Z" },
];

const levelConfig: Record<string, { label: string; variant: "info" | "warning" | "destructive" | "success" }> = {
  info: { label: "INFO", variant: "info" },
  warning: { label: "WARN", variant: "warning" },
  error: { label: "ERROR", variant: "destructive" },
  success: { label: "OK", variant: "success" },
};

export default function AdminLogsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Логи"
        description="Журнал действий системы"
        breadcrumbs={[
          { title: "Дашборд", href: "/admin/dashboard" },
          { title: "Логи" },
        ]}
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по действию или пользователю..." />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((log) => {
              const level = levelConfig[log.level];
              return (
                <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <Badge variant={level.variant} className="mt-0.5 shrink-0 font-mono text-[10px]">
                    {level.label}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-primary font-mono">{log.action}</code>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{log.user}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
