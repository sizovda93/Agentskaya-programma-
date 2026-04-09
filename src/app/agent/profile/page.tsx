"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import { getInitials } from "@/lib/utils";
import { Send, Unlink, MessageCircle, Check, Eye, EyeOff, Shield, MapPin, Star, Users, Briefcase, HeadphonesIcon } from "lucide-react";

interface ProfileData {
  id: string; role: string; fullName: string; email: string; phone: string | null;
  avatarUrl: string | null; status: string; city?: string; specialization?: string;
  rating?: number; totalLeads?: number; agentId?: string; gender?: string;
  birthYear?: number | null; birthDay?: number | null; birthMonth?: number | null;
  profession?: string | null; preferredMessenger?: string; partnerNumber?: number;
}

interface TelegramStatus {
  connected: boolean; telegramUsername?: string; telegramFirstName?: string;
}

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

export default function AgentProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "", phone: "", gender: "not_specified", birthYear: "" as string,
    birthDay: "" as string, birthMonth: "" as string, profession: "",
    preferredMessenger: "telegram", city: "", specialization: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [tgStatus, setTgStatus] = useState<TelegramStatus | null>(null);
  const [tgLoading, setTgLoading] = useState(false);
  const [tgDeepLink, setTgDeepLink] = useState<string | null>(null);
  const [fbType, setFbType] = useState("platform");
  const [fbMessage, setFbMessage] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const [fbSent, setFbSent] = useState(false);

  const loadTgStatus = useCallback(() => {
    fetch("/api/telegram/status").then((r) => r.json()).then(setTgStatus).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      setProfile(data);
      setForm({
        fullName: data.fullName || "", phone: data.phone || "",
        gender: data.gender || "not_specified",
        birthYear: data.birthYear ? String(data.birthYear) : "",
        birthDay: data.birthDay ? String(data.birthDay) : "",
        birthMonth: data.birthMonth ? String(data.birthMonth) : "",
        profession: data.profession || "",
        preferredMessenger: data.preferredMessenger || "telegram",
        city: data.city || "", specialization: data.specialization || "",
      });
    }).catch(() => {}).finally(() => setLoading(false));
    loadTgStatus();
  }, [loadTgStatus]);

  const handleTgConnect = async () => {
    setTgLoading(true);
    try { const r = await fetch("/api/telegram/link", { method: "POST" }); if (r.ok) { const d = await r.json(); setTgDeepLink(d.deepLink); } }
    catch {} finally { setTgLoading(false); }
  };
  const handleTgDisconnect = async () => {
    setTgLoading(true);
    try { const r = await fetch("/api/telegram/link", { method: "DELETE" }); if (r.ok) { setTgStatus({ connected: false }); setTgDeepLink(null); } }
    catch {} finally { setTgLoading(false); }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true); setMessage(null);
    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName, phone: form.phone, gender: form.gender,
          birthYear: form.birthYear ? Number(form.birthYear) : null,
          birthDay: form.birthDay ? Number(form.birthDay) : null,
          birthMonth: form.birthMonth ? Number(form.birthMonth) : null,
          profession: form.profession || null, preferredMessenger: form.preferredMessenger,
          city: form.city, specialization: form.specialization,
        }),
      });
      if (res.ok) { const u = await res.json(); setProfile((p) => p ? { ...p, ...u } : p); setMessage("Изменения сохранены"); }
      else { const e = await res.json(); setMessage(e.error || "Ошибка"); }
    } catch { setMessage("Ошибка сети"); } finally { setSaving(false); }
  };

  if (loading) return <CardSkeleton />;
  if (!profile) return <div className="p-8 text-muted-foreground">Профиль не найден</div>;

  const stats = [
    { icon: MapPin, label: "Город", value: profile.city || "—" },
    { icon: Users, label: "Возраст", value: profile.birthYear ? String(new Date().getFullYear() - profile.birthYear) : "—" },
    { icon: Star, label: "Рейтинг", value: profile.rating !== undefined ? String(profile.rating) : "—" },
    { icon: Briefcase, label: "Лиды", value: profile.totalLeads !== undefined ? String(profile.totalLeads) : "0" },
  ];

  const selectClass = "w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div>
      <PageHeader
        title="Профиль"
        description="Управление личной информацией и настройками аккаунта"
        breadcrumbs={[{ title: "О платформе", href: "/agent/dashboard" }, { title: "Профиль" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[370px_1fr] gap-6 items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="space-y-5">
          {/* Profile card */}
          <Card className="overflow-hidden">
            <div className="bg-primary/5 px-6 pt-8 pb-6 flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3 ring-4 ring-background shadow-lg">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">{getInitials(profile.fullName)}</AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{profile.fullName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{profile.email}</p>
              {profile.partnerNumber && (
                <p className="text-xs text-primary font-mono mt-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full">
                  Партнёр №{profile.partnerNumber}
                </p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="info">Партнёр</Badge>
                <Badge variant="success">{profile.status === "active" ? "Активен" : profile.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
              {stats.map((s) => (
                <div key={s.label} className="py-3 px-2 text-center">
                  <s.icon className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Connections card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Send className="h-4 w-4" /> Подключения
              </h3>
              <div className="space-y-3">
                {/* Telegram */}
                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-[#2AABEE]/10 flex items-center justify-center">
                      <Send className="h-4 w-4 text-[#2AABEE]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Telegram</p>
                      {tgStatus?.connected ? (
                        <p className="text-[11px] text-green-600">{tgStatus.telegramUsername ? `@${tgStatus.telegramUsername}` : "Подключён"}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">Не подключён</p>
                      )}
                    </div>
                  </div>
                  {tgStatus?.connected ? (
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleTgDisconnect} disabled={tgLoading}>
                      <Unlink className="h-3 w-3 mr-1" /> Отключить
                    </Button>
                  ) : tgDeepLink ? (
                    <div className="flex items-center gap-2">
                      <a href={tgDeepLink} target="_blank" rel="noopener noreferrer"
                         className="px-3 py-1.5 rounded-lg bg-[#2AABEE] text-white text-xs font-medium hover:bg-[#229ED9] transition-colors">
                        Открыть
                      </a>
                      <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground p-1" onClick={() => { setTgDeepLink(null); loadTgStatus(); }}>
                        Обновить
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" className="text-xs" onClick={handleTgConnect} disabled={tgLoading}>
                      {tgLoading ? "..." : "Подключить"}
                    </Button>
                  )}
                </div>

                {/* MAX */}
                <MaxRow />
              </div>
            </CardContent>
          </Card>

          {/* Support card */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <HeadphonesIcon className="h-4 w-4" /> Поддержка
              </h3>
              {fbSent ? (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="h-4 w-4" /> Спасибо! Мы получили ваше обращение.
                </div>
              ) : (
                <div className="space-y-3">
                  <select className={selectClass} value={fbType} onChange={(e) => setFbType(e.target.value)}>
                    <option value="platform">О платформе</option>
                    <option value="onboarding">Об обучении</option>
                    <option value="suggestion">Предложение</option>
                    <option value="problem">Проблема</option>
                  </select>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[70px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Опишите вопрос..."
                    value={fbMessage}
                    onChange={(e) => setFbMessage(e.target.value)}
                  />
                  <Button size="sm" className="w-full text-xs" disabled={fbSending || !fbMessage.trim()} onClick={async () => {
                    setFbSending(true);
                    try { const r = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: fbType, message: fbMessage }) }); if (r.ok) { setFbSent(true); setFbMessage(""); } }
                    catch {} finally { setFbSending(false); }
                  }}>
                    {fbSending ? "Отправка..." : "Написать в поддержку"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ==================== RIGHT COLUMN ==================== */}
        <div className="space-y-5">
          {/* Personal info — main card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-6">Личная информация</h3>

              {/* Section: Basic */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Основная информация</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">ФИО</label>
                  <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                  <Input value={profile.email} disabled className="bg-muted/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Телефон</label>
                  <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+7 (900) 000-00-00" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Город</label>
                  <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
              </div>

              {/* Section: Professional */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Профессиональная информация</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Специализация</label>
                  <Input value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Профессия</label>
                  <Input value={form.profession} onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))} placeholder="Юрист, риэлтор..." />
                </div>
              </div>

              {/* Section: Additional */}
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Дополнительные данные</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Пол</label>
                  <select className={selectClass} value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
                    <option value="not_specified">Не указан</option>
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Дата рождения</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" min={1} max={31} placeholder="День" value={form.birthDay} onChange={(e) => setForm((f) => ({ ...f, birthDay: e.target.value }))} />
                    <select className={selectClass} value={form.birthMonth} onChange={(e) => setForm((f) => ({ ...f, birthMonth: e.target.value }))}>
                      <option value="">Месяц</option>
                      {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                    <Input type="number" min={1940} max={2010} placeholder="Год" value={form.birthYear} onChange={(e) => setForm((f) => ({ ...f, birthYear: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Предпочтительный мессенджер</label>
                  <select className={selectClass} value={form.preferredMessenger} onChange={(e) => setForm((f) => ({ ...f, preferredMessenger: e.target.value }))}>
                    <option value="telegram">Telegram</option>
                    <option value="max">MAX</option>
                    <option value="vk">VK</option>
                  </select>
                </div>
              </div>

              {/* Action zone */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {message ? <span className={message === "Изменения сохранены" ? "text-green-600" : "text-destructive"}>{message}</span> : "Все изменения сохраняются вручную"}
                </p>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving ? "Сохранение..." : "Сохранить изменения"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security card */}
          <SecurityCard />
        </div>
      </div>
    </div>
  );
}

// ==================== Security Card ====================
function SecurityCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = async () => {
    setMessage(""); setError("");
    if (newPassword !== confirmPassword) { setError("Пароли не совпадают"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Ошибка");
      else { setMessage("Пароль обновлён"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    } catch { setError("Ошибка соединения"); } finally { setSaving(false); }
  };

  const pwInput = "w-full h-9 rounded-lg border border-border bg-background px-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
          <Shield className="h-4 w-4" /> Безопасность
        </h3>
        <p className="text-xs text-muted-foreground mb-5">Изменение пароля для входа в аккаунт</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Текущий пароль</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Введите текущий пароль" className={pwInput} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Новый пароль</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Минимум 6 символов" className={pwInput} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Подтвердите пароль</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Повторите новый пароль" className={pwInput.replace("pr-10", "")} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        {message && <p className="text-sm text-green-600 mt-3">{message}</p>}

        <div className="flex justify-end mt-5 pt-4 border-t border-border">
          <Button size="sm" onClick={handleChange} disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
            {saving ? "Обновление..." : "Обновить пароль"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAX Row ====================
function MaxRow() {
  const [status, setStatus] = useState<{ connected: boolean; maxUsername?: string; maxFirstName?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  const loadStatus = useCallback(() => { fetch("/api/max/status").then((r) => r.json()).then(setStatus).catch(() => {}); }, []);
  useEffect(() => { loadStatus(); }, [loadStatus]);

  const handleConnect = async () => { setLoading(true); try { const r = await fetch("/api/max/link", { method: "POST" }); const d = await r.json(); if (r.ok) setDeepLink(d.deepLink); } finally { setLoading(false); } };
  const handleDisconnect = async () => { setLoading(true); try { await fetch("/api/max/link", { method: "DELETE" }); setStatus({ connected: false }); } finally { setLoading(false); } };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-[#5B6AED]/10 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-[#5B6AED]" />
        </div>
        <div>
          <p className="text-sm font-medium">MAX</p>
          {status?.connected ? (
            <p className="text-[11px] text-green-600">{status.maxUsername ? `@${status.maxUsername}` : "Подключён"}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Не подключён</p>
          )}
        </div>
      </div>
      {status?.connected ? (
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleDisconnect} disabled={loading}>
          <Unlink className="h-3 w-3 mr-1" /> Отключить
        </Button>
      ) : deepLink ? (
        <div className="flex items-center gap-2">
          <a href={deepLink} target="_blank" rel="noopener noreferrer"
             className="px-3 py-1.5 rounded-lg bg-[#5B6AED] text-white text-xs font-medium hover:bg-[#4A59DC] transition-colors">
            Открыть
          </a>
          <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground p-1" onClick={() => { setDeepLink(null); loadStatus(); }}>
            Обновить
          </Button>
        </div>
      ) : (
        <Button size="sm" className="text-xs" onClick={handleConnect} disabled={loading}>
          {loading ? "..." : "Подключить"}
        </Button>
      )}
    </div>
  );
}
