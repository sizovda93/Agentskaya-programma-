"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platformName, setPlatformName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => {
        setPlatformName(data.platform_name || "");
        setSupportEmail(data.support_email || "");
        setSupportPhone(data.support_phone || "");
        const rate = data.commission_rate ? String(Math.round(parseFloat(data.commission_rate) * 100)) : "30";
        setCommissionRate(rate);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveGeneral = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform_name: platformName,
        support_email: supportEmail,
        support_phone: supportPhone,
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Сохранено" : "Ошибка сохранения");
  };

  const saveCommission = async () => {
    setSaving(true);
    setMessage(null);
    const rate = (parseFloat(commissionRate) / 100).toFixed(2);
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commission_rate: rate }),
    });
    setSaving(false);
    setMessage(res.ok ? "Сохранено" : "Ошибка сохранения");
  };

  if (loading) return <LoadingSkeleton />;

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

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message === "Сохранено" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {message}
        </div>
      )}

      <div className="space-y-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Общие настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Название платформы</label>
              <Input value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Email поддержки</label>
              <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Телефон поддержки</label>
              <Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveGeneral} disabled={saving}>Сохранить</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Комиссии</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Базовая ставка агента (%)</label>
              <Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button onClick={saveCommission} disabled={saving}>Сохранить</Button>
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
