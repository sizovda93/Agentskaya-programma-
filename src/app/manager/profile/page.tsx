"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import { getInitials } from "@/lib/utils";
import { Send, Unlink, MessageCircle, Check, Link2, Plug } from "lucide-react";

interface ProfileData {
  id: string;
  role: string;
  fullName: string;
  email: string;
  phone: string | null;
  status: string;
}

interface TelegramStatus {
  connected: boolean;
  telegramUsername?: string;
  telegramFirstName?: string;
}

export default function ManagerProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ fullName: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [tgStatus, setTgStatus] = useState<TelegramStatus | null>(null);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [tgLoading, setTgLoading] = useState(false);

  const [fbType, setFbType] = useState("platform");
  const [fbMessage, setFbMessage] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const [fbSent, setFbSent] = useState(false);

  const loadTgStatus = () => {
    fetch("/api/telegram/status").then((r) => r.json()).then(setTgStatus).catch(() => {});
  };

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({ fullName: data.fullName || "", phone: data.phone || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    loadTgStatus();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setMessage("Изменения сохранены");
      else setMessage("Ошибка сохранения");
    } catch { setMessage("Ошибка соединения"); }
    finally { setSaving(false); setTimeout(() => setMessage(""), 3000); }
  };

  const handleTgConnect = async () => {
    setTgLoading(true);
    try {
      const res = await fetch("/api/telegram/link", { method: "POST" });
      const data = await res.json();
      if (data.linkUrl) setTgDeepLink(data.linkUrl);
    } catch { /* ignore */ }
    finally { setTgLoading(false); }
  };

  const handleTgDisconnect = async () => {
    setTgLoading(true);
    try {
      await fetch("/api/telegram/link", { method: "DELETE" });
      setTgStatus({ connected: false });
    } catch { /* ignore */ }
    finally { setTgLoading(false); }
  };

  if (loading || !profile) return <CardSkeleton />;

  return (
    <div>
      <PageHeader
        title="Профиль"
        description="Управление личными данными и настройками"
        breadcrumbs={[
          { title: "О платформе", href: "/manager/dashboard" },
          { title: "Профиль" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 items-start">

        {/* ====== LEFT: Identity + Integrations ====== */}
        <div className="space-y-5">

          {/* Profile card — compact */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-semibold">{getInitials(profile.fullName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{profile.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[10px] font-normal">Менеджер</Badge>
                <Badge variant="outline" className="text-[10px] font-normal text-success border-success/30">
                  {profile.status === "active" ? "Активен" : profile.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Integrations — Telegram */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Plug className="h-3 w-3" /> Подключения
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-[#2AABEE]/10 flex items-center justify-center">
                    <Send className="h-3.5 w-3.5 text-[#2AABEE]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telegram</p>
                    {tgStatus?.connected ? (
                      <p className="text-[11px] text-success">
                        {tgStatus.telegramUsername ? `@${tgStatus.telegramUsername}` : "Подключён"}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">Не подключён</p>
                    )}
                  </div>
                </div>
                {tgStatus?.connected ? (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={handleTgDisconnect} disabled={tgLoading}>
                    <Unlink className="h-3 w-3 mr-1" /> Отключить
                  </Button>
                ) : tgDeepLink ? (
                  <a href={tgDeepLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="h-7 text-xs bg-[#2AABEE] hover:bg-[#229ED9]">
                      <Link2 className="h-3 w-3 mr-1" /> Открыть
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleTgConnect} disabled={tgLoading}>
                    {tgLoading ? "..." : "Подключить"}
                  </Button>
                )}
              </div>
              {tgDeepLink && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] text-muted-foreground mb-2">Нажмите Start в боте, затем:</p>
                  <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={() => { setTgDeepLink(null); loadTgStatus(); }}>
                    Обновить статус
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ====== RIGHT: Forms ====== */}
        <div className="space-y-5">

          {/* Personal info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Личные данные</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Основная информация вашего аккаунта</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">ФИО</label>
                  <Input className="h-9 text-sm" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <Input className="h-9 text-sm bg-muted/50" value={profile.email} disabled />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Телефон</label>
                  <Input className="h-9 text-sm" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+7 (___) ___-__-__" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                {message ? (
                  <p className="text-xs text-success flex items-center gap-1"><Check className="h-3 w-3" /> {message}</p>
                ) : (
                  <div />
                )}
                <Button size="sm" className="h-8" onClick={handleSave} disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" /> Обратная связь
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Помогите нам улучшить платформу</p>
            </CardHeader>
            <CardContent className="pt-0">
              {fbSent ? (
                <div className="flex items-center gap-2 text-sm text-success py-3">
                  <Check className="h-4 w-4" /> Спасибо! Ваше сообщение отправлено.
                </div>
              ) : (
                <div className="space-y-3">
                  <select className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-xs" value={fbType} onChange={(e) => setFbType(e.target.value)}>
                    <option value="platform">О платформе</option>
                    <option value="suggestion">Предложение</option>
                    <option value="problem">Проблема</option>
                  </select>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[70px] resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Опишите вашу идею или проблему..."
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline" className="h-8 text-xs" disabled={fbSending || !fbMessage.trim()} onClick={async () => {
                      setFbSending(true);
                      try { const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: fbType, message: fbMessage }) }); if (res.ok) { setFbSent(true); setFbMessage(""); setTimeout(() => setFbSent(false), 4000); } } catch {}
                      finally { setFbSending(false); }
                    }}>{fbSending ? "..." : "Отправить"}</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
