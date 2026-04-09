"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Eye, EyeOff, Newspaper, Gift, Bell, RussianRuble, Scale } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Announcement {
  id: string; title: string; type: string; content: string; isActive: boolean; createdAt: string;
}
interface Ticker {
  id: string; type: string; text: string; isActive: boolean; createdAt: string;
}

const typeLabels: Record<string, string> = { news: "Новость", giveaway: "Розыгрыш", update: "Обновление" };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement form
  const [aTitle, setATitle] = useState("");
  const [aType, setAType] = useState("news");
  const [aContent, setAContent] = useState("");
  const [aImageUrl, setAImageUrl] = useState("");
  const [aUploading, setAUploading] = useState(false);
  const [aSaving, setASaving] = useState(false);

  // Ticker form
  const [tType, setTType] = useState("payout");
  const [tText, setTText] = useState("");
  const [tSaving, setTSaving] = useState(false);

  const load = () =>
    Promise.all([
      fetch("/api/announcements").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/tickers").then((r) => (r.ok ? r.json() : [])),
    ]).then(([a, t]) => { setAnnouncements(a); setTickers(t); });

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const createAnnouncement = async () => {
    if (!aTitle.trim() || !aContent.trim()) return;
    setASaving(true);
    await fetch("/api/announcements", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: aTitle, type: aType, content: aContent, imageUrl: aImageUrl || undefined }),
    });
    setATitle(""); setAContent(""); setAType("news"); setAImageUrl("");
    await load(); setASaving(false);
  };

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    await fetch(`/api/announcements/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  };

  const deleteAnnouncement = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    await load();
  };

  const createTicker = async () => {
    if (!tText.trim()) return;
    setTSaving(true);
    await fetch("/api/tickers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tType, text: tText }),
    });
    setTText(""); setTType("payout");
    await load(); setTSaving(false);
  };

  const toggleTicker = async (id: string, isActive: boolean) => {
    await fetch(`/api/tickers/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  };

  const deleteTicker = async (id: string) => {
    await fetch(`/api/tickers/${id}`, { method: "DELETE" });
    await load();
  };

  if (loading) return <LoadingSkeleton />;

  const payoutTickers = tickers.filter((t) => t.type === "payout");
  const courtTickers = tickers.filter((t) => t.type === "court");

  return (
    <div>
      <PageHeader
        title="Объявления и бары"
        description="Управление новостями, розыгрышами и бегущими строками"
        breadcrumbs={[{ title: "Дашборд", href: "/admin/dashboard" }, { title: "Объявления" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* ====== CREATE ANNOUNCEMENT ====== */}
        <Card>
          <CardHeader><CardTitle className="text-base">Новое объявление</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="Заголовок" className="text-sm" />
            <select value={aType} onChange={(e) => setAType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="news">Новость</option>
              <option value="giveaway">Розыгрыш</option>
              <option value="update">Обновление</option>
            </select>
            <textarea value={aContent} onChange={(e) => setAContent(e.target.value)} placeholder="Текст объявления..." className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Изображение (необязательно)</label>
              <input
                type="file"
                accept="image/*"
                disabled={aUploading}
                className="text-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAUploading(true);
                  const fd = new FormData();
                  fd.append("file", file);
                  try {
                    const res = await fetch("/api/upload", { method: "POST", body: fd });
                    if (res.ok) {
                      const data = await res.json();
                      setAImageUrl(data.fileUrl);
                    }
                  } finally { setAUploading(false); }
                }}
              />
              {aUploading && <p className="text-xs text-muted-foreground mt-1">Загрузка...</p>}
              {aImageUrl && <img src={aImageUrl} alt="" className="mt-2 rounded-lg max-h-32 object-cover" />}
            </div>
            <Button size="sm" onClick={createAnnouncement} disabled={aSaving || !aTitle.trim() || !aContent.trim()}>
              <Plus className="h-4 w-4 mr-1" /> {aSaving ? "..." : "Создать"}
            </Button>
          </CardContent>
        </Card>

        {/* ====== CREATE TICKER ====== */}
        <Card>
          <CardHeader><CardTitle className="text-base">Новая запись в бар</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select value={tType} onChange={(e) => setTType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="payout">Выплата партнёру</option>
              <option value="court">Завершённое дело</option>
            </select>
            <textarea value={tText} onChange={(e) => setTText(e.target.value)} placeholder="Текст для бегущей строки..." className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
            <Button size="sm" onClick={createTicker} disabled={tSaving || !tText.trim()}>
              <Plus className="h-4 w-4 mr-1" /> {tSaving ? "..." : "Добавить"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ====== ANNOUNCEMENTS LIST ====== */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Объявления ({announcements.length})</CardTitle></CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Нет объявлений</p>
          ) : (
            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${a.isActive ? "border-border" : "border-border/50 opacity-50"}`}>
                  {a.type === "news" ? <Newspaper className="h-4 w-4 text-blue-500 shrink-0" /> : a.type === "giveaway" ? <Gift className="h-4 w-4 text-orange-500 shrink-0" /> : <Bell className="h-4 w-4 text-green-500 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{a.title}</span>
                      <Badge variant="outline" className="text-[10px]">{typeLabels[a.type]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{a.content.slice(0, 80)}...</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatDate(a.createdAt)}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleAnnouncement(a.id, a.isActive)}>
                    {a.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteAnnouncement(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ====== TICKER BARS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payouts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RussianRuble className="h-4 w-4 text-success" /> Бар выплат ({payoutTickers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payoutTickers.map((t) => (
                <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${t.isActive ? "border-success/20" : "border-border/50 opacity-50"}`}>
                  <span className="flex-1 truncate">{t.text}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleTicker(t.id, t.isActive)}>
                    {t.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteTicker(t.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {payoutTickers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Пусто</p>}
            </div>
          </CardContent>
        </Card>

        {/* Court */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" /> Бар суд. дел ({courtTickers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {courtTickers.map((t) => (
                <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${t.isActive ? "border-primary/20" : "border-border/50 opacity-50"}`}>
                  <span className="flex-1 truncate">{t.text}</span>
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => toggleTicker(t.id, t.isActive)}>
                    {t.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteTicker(t.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {courtTickers.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Пусто</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
