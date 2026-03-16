"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockUsers, mockAgents } from "@/lib/mock/data";
import { getInitials } from "@/lib/utils";

export default function AgentProfilePage() {
  const user = mockUsers[0]; // Agent user
  const agent = mockAgents[0];

  return (
    <div>
      <PageHeader
        title="Профиль"
        description="Ваши данные и настройки"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Профиль" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="info">Агент</Badge>
              <Badge variant="success">Активен</Badge>
            </div>
            <div className="w-full mt-6 pt-6 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Город</span>
                <span>{agent.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Специализация</span>
                <span>{agent.specialization}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Рейтинг</span>
                <span>⭐ {agent.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Всего лидов</span>
                <span>{agent.totalLeads}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">ФИО</label>
                  <Input defaultValue={user.fullName} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                  <Input defaultValue={user.email} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Телефон</label>
                  <Input defaultValue={user.phone} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Город</label>
                  <Input defaultValue={agent.city} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Сохранить</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Безопасность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Новый пароль</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Подтверждение</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Сменить пароль</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
