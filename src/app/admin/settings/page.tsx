"use client";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Настройки"
        description="Конфигурация платформы"
        breadcrumbs={[
          { title: "Дашборд", href: "/admin/dashboard" },
          { title: "Настройки" },
        ]}
      />

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Общие настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Название платформы</label>
              <Input defaultValue="ПравоТех" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email поддержки</label>
              <Input defaultValue="support@legaltech.ru" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Телефон поддержки</label>
              <Input defaultValue="+7 (800) 100-00-00" />
            </div>
            <div className="flex justify-end">
              <Button>Сохранить</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Комиссии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Базовая ставка агента (%)</label>
                <Input type="number" defaultValue="30" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Бонус за квалификацию (%)</label>
                <Input type="number" defaultValue="5" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button>Сохранить</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Уведомления</CardTitle>
              <Badge variant="success">Активно</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Email уведомления", active: true },
              { label: "Telegram уведомления", active: false },
              { label: "Уведомления об эскалациях", active: true },
              { label: "Уведомления о новых лидах", active: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2">
                <span className="text-sm">{item.label}</span>
                <div
                  className={`h-6 w-11 rounded-full transition-colors cursor-pointer ${
                    item.active ? "bg-primary" : "bg-secondary"
                  } relative`}
                >
                  <div
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      item.active ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
