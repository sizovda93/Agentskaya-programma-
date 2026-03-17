"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import { getInitials } from "@/lib/utils";

interface ProfileData {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  city?: string;
  specialization?: string;
  rating?: number;
  totalLeads?: number;
  agentId?: string;
}

export default function AgentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({ fullName: data.fullName || "", phone: data.phone || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: form.fullName, phone: form.phone }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
        setMessage("Сохранено");
      } else {
        const err = await res.json();
        setMessage(err.error || "Ошибка сохранения");
      }
    } catch {
      setMessage("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CardSkeleton />;
  if (!profile) return <div className="p-8 text-muted-foreground">Профиль не найден</div>;

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
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarFallback className="text-xl">{getInitials(profile.fullName)}</AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">{profile.fullName}</h2>
            <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="info">Агент</Badge>
              <Badge variant="success">{profile.status === "active" ? "Активен" : profile.status}</Badge>
            </div>
            <div className="w-full mt-6 pt-6 border-t border-border space-y-3 text-sm">
              {profile.city && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Город</span>
                  <span>{profile.city}</span>
                </div>
              )}
              {profile.specialization && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Специализация</span>
                  <span>{profile.specialization}</span>
                </div>
              )}
              {profile.rating !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Рейтинг</span>
                  <span>⭐ {profile.rating}</span>
                </div>
              )}
              {profile.totalLeads !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Всего лидов</span>
                  <span>{profile.totalLeads}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">ФИО</label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                  <Input value={profile.email} disabled />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Телефон</label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>{saving ? "Сохранение..." : "Сохранить"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
