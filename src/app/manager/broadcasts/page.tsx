"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function ManagerBroadcastsPage() {
  return (
    <div>
      <PageHeader
        title="Рассылки"
        description="Массовые уведомления для агентов"
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Рассылки" },
        ]}
        actions={
          <Button size="sm">
            <Send className="h-4 w-4 mr-1" /> Новая рассылка
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Создать рассылку</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Тема</label>
              <Input placeholder="Тема рассылки..." />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Сообщение</label>
              <textarea
                className="flex w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-32 resize-y"
                placeholder="Текст рассылки..."
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Получатели</label>
              <Input placeholder="Все агенты" disabled />
            </div>
            <Button className="w-full">
              <Send className="h-4 w-4 mr-1" /> Отправить
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">История рассылок</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Нет рассылок"
              description="Создайте первую рассылку для ваших агентов"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
