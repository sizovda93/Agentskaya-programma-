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
import { Send, Unlink, MessageCircle, Check } from "lucide-react";

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

  // Telegram
  const [tgStatus, setTgStatus] = useState<TelegramStatus | null>(null);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [tgLoading, setTgLoading] = useState(false);

  // Feedback
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
      if (res.ok) setMessage("Сохранено");
      else setMessage("Ошибка сохранения");
    } catch { setMessage("Ошибка"); }
    finally { setSaving(false); }
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
        description="Личные данные и настройки"
        breadcrumbs={[
          { title: "О платформе", href: "/manager/dashboard" },
          { title: "Профиль" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: profile card + telegram */}
        <div className="self-start space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-4">
                <AvatarFallback className="text-xl">{getInitials(profile.fullName)}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{profile.fullName}</h2>
              <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="warning">Менеджер</Badge>
                <Badge variant="success">{profile.status === "active" ? "Активен" : profile.status}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4" /> Telegram
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tgStatus?.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="success">Подключён</Badge>
                    {tgStatus.telegramUsername && <span className="text-sm text-muted-foreground">@{tgStatus.telegramUsername}</span>}
                    {!tgStatus.telegramUsername && tgStatus.telegramFirstName && <span className="text-sm text-muted-foreground">{tgStatus.telegramFirstName}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">Вы получаете уведомления в Telegram.</p>
                  <Button variant="outline" size="sm" onClick={handleTgDisconnect} disabled={tgLoading}>
                    <Unlink className="h-3.5 w-3.5 mr-1" /> {tgLoading ? "..." : "Отключить"}
                  </Button>
                </div>
              ) : tgDeepLink ? (
                <div className="space-y-3">
                  <p className="text-sm">Откройте ссылку и нажмите Start в боте:</p>
                  <a href={tgDeepLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2AABEE] text-white text-sm font-medium hover:bg-[#229ED9] transition-colors">
                    <Send className="h-4 w-4" /> Открыть Telegram
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => { setTgDeepLink(null); loadTgStatus(); }}>Обновить статус</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Подключите Telegram для уведомлений.</p>
                  <Button onClick={handleTgConnect} disabled={tgLoading}>
                    <Send className="h-4 w-4 mr-1" /> {tgLoading ? "..." : "Подключить Telegram"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: edit form */}
        <div className="lg:col-span-2">
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

      {/* Feedback — full width */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> Обратная связь
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fbSent ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" /> Спасибо за обратную связь!
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Расскажите, что можно улучшить</p>
              <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={fbType} onChange={(e) => setFbType(e.target.value)}>
                <option value="platform">О платформе</option>
                <option value="suggestion">Предложение</option>
                <option value="problem">Проблема</option>
              </select>
              <textarea className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Ваш комментарий..." value={fbMessage} onChange={(e) => setFbMessage(e.target.value)} />
              <div className="flex justify-end">
                <Button size="sm" disabled={fbSending || !fbMessage.trim()} onClick={async () => {
                  setFbSending(true);
                  try { const res = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: fbType, message: fbMessage }) }); if (res.ok) { setFbSent(true); setFbMessage(""); } } catch {}
                  finally { setFbSending(false); }
                }}>{fbSending ? "Отправка..." : "Отправить"}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
