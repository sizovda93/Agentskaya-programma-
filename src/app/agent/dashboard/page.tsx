"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Rocket, Lightbulb, UserPlus, BookOpen, Share2, GraduationCap, MessageSquare as MessageSquareIcon, RussianRuble, Newspaper, Bell, FileText, Download, Eye, X } from "lucide-react";
import { Lead, Conversation } from "@/types";
import { AvatarHelper } from "@/components/avatar/avatar-helper";
import { SocialProofFeed } from "@/components/dashboard/social-proof-feed";
import { Button } from "@/components/ui/button";

interface Contract {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

interface ChecklistState {
  profileFilled: boolean;
  learningDone: boolean;
  telegramConnected: boolean;
  firstLead: boolean;
}

export default function AgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<{ totalRevenue?: number }>({});
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<ChecklistState | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "history" | "partner" | "contract">("main");
  const [announcements, setAnnouncements] = useState<{id: string; title: string; type: string; content: string; authorName: string | null; imageUrl: string | null; createdAt: string; commentCount?: number}[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [viewUrl, setViewUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/learning/progress").then((r) => r.json()).catch(() => null),
      fetch("/api/telegram/status").then((r) => r.json()).catch(() => ({ connected: false })),
      fetch("/api/announcements").then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch("/api/contracts").then((r) => r.ok ? r.json() : []).catch(() => []),
    ])
      .then(([ld, cv, st, profile, progress, tgStatus, ann, cnt]) => {
        const leadsArr = Array.isArray(ld) ? ld : [];
        setLeads(leadsArr);
        setConversations(Array.isArray(cv) ? cv : []);
        setStats(st || {});
        setAnnouncements(Array.isArray(ann) ? ann : []);
        setContracts(Array.isArray(cnt) ? cnt : []);

        setChecklist({
          profileFilled: !!(profile?.city && profile?.phone),
          learningDone: progress?.allRequiredDone === true,
          telegramConnected: tgStatus?.connected === true,
          firstLead: leadsArr.length > 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CardSkeleton />;

  const activeLeads = leads.filter((l) => !["won", "lost"].includes(l.status));
  const unreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0;

  const checklistItems = checklist ? [
    { done: checklist.profileFilled, label: "Заполнить профиль (город и телефон)", href: "/agent/profile" },
    { done: checklist.learningDone, label: "Пройти обязательное обучение", href: "/agent/learning" },
    { done: checklist.telegramConnected, label: "Подключить Telegram", href: "/agent/profile" },
    { done: checklist.firstLead, label: "Создать первый лид", href: "/agent/leads" },
  ] : [];

  const completedSteps = checklistItems.filter((i) => i.done).length;
  const allDone = checklist ? checklist.profileFilled && checklist.learningDone && checklist.telegramConnected && checklist.firstLead : true;

  const retentionReminders: { label: string; href: string }[] = [];
  if (allDone && checklist) {
    if (leads.length === 0) retentionReminders.push({ label: "Создайте первый лид — это просто!", href: "/agent/leads" });
    if (leads.length > 0 && leads.length < 3) retentionReminders.push({ label: "Попробуйте маркетинговые материалы для привлечения клиентов", href: "/agent/marketing" });
  }

  return (
    <div>
      <PageHeader
        title="О платформе"
        description="Партнёрская программа по банкротству физических лиц"
      />

      {/* ====== 1. SOCIAL PROOF — Карточки партнёров ====== */}
      <SocialProofFeed />

      {/* ====== TABS ====== */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { key: "main" as const, label: "О платформе" },
          { key: "history" as const, label: "История компании" },
          { key: "partner" as const, label: "Стать партнёром" },
          { key: "contract" as const, label: "Партнёрское соглашение" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "main" && (<>
      {/* ====== 2. AVATAR + HOW TO EARN ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <RussianRuble className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Как зарабатывать с платформой</h3>
                <p className="text-xs text-muted-foreground">5 простых шагов к первому вознаграждению</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { step: "1", text: "Найдите человека с проблемой долгов — среди знакомых, клиентов или через рекламу" },
                { step: "2", text: "Передайте контакт в платформу — создайте лида с именем и телефоном" },
                { step: "3", text: "Менеджер берёт клиента в работу — вы отслеживаете статус в кабинете" },
                { step: "4", text: "Клиент заключает договор на банкротство — сделка переходит в статус «Won»" },
                { step: "5", text: "Вы получаете вознаграждение — выплата фиксируется в разделе «Финансы»" },
              ].map((item) => (
                <div key={item.step} className="flex gap-2.5 items-start">
                  <div className="h-6 w-6 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-green-600">{item.step}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/agent/leads" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                <UserPlus className="h-3.5 w-3.5" /> Передать клиента
              </Link>
              <Link href="/agent/marketing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition-colors">
                <BookOpen className="h-3.5 w-3.5" /> Материалы
              </Link>
              <Link href="/agent/referral" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition-colors">
                <Share2 className="h-3.5 w-3.5" /> Реферальная ссылка
              </Link>
              <Link href="/agent/learning" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition-colors">
                <GraduationCap className="h-3.5 w-3.5" /> Обучение
              </Link>
              <Link href="/agent/messages" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition-colors">
                <MessageSquareIcon className="h-3.5 w-3.5" /> Написать менеджеру
              </Link>
            </div>
          </CardContent>
        </Card>

        <AvatarHelper />
      </div>

      {/* ====== 3. ANNOUNCEMENTS (blog) ====== */}
      {announcements.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4" /> Последние объявления
            </CardTitle>
            <Link href="/agent/announcements" className="text-sm text-primary hover:underline flex items-center gap-1">
              Все <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.slice(0, 5).map((a) => (
                <Link key={a.id} href="/agent/announcements" className="block py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">{a.authorName || "Администратор"}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{formatDate(a.createdAt)}</span>
                    {(a.commentCount ?? 0) > 0 && (
                      <span className="text-xs text-muted-foreground ml-auto">{a.commentCount} комм.</span>
                    )}
                  </div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt="" className="mt-2 rounded-lg max-h-40 object-cover" />
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== 4. REMINDERS ====== */}
      {retentionReminders.length > 0 && (
        <Card className="mb-6 p-4 border-blue-500/20 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Подсказка</span>
          </div>
          <div className="space-y-2">
            {retentionReminders.map((r, i) => (
              <Link key={i} href={r.href} className="flex items-center gap-2 text-sm text-primary hover:underline">
                <ArrowRight className="h-3 w-3" /> {r.label}
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* ====== 5. STATS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Активные лиды" value={activeLeads.length} icon="Users" />
        <StatCard title="Непрочитанные" value={unreadCount} icon="MessageSquare" />
        <StatCard title="Заработано" value={formatCurrency(Number(stats.totalRevenue || 0))} icon="RussianRuble" />
        <StatCard title="Конверсия" value={`${conversionRate}%`} icon="Target" />
      </div>

      </>)}

      {activeTab === "history" && (<>
      {/* ====== COMPANY HISTORY ====== */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <h2 className="text-base font-semibold mb-4">История компании</h2>
          <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
            {[
              { year: "2019", title: "Основание", text: "Команда юристов начала специализироваться на банкротстве физических лиц по ФЗ-127. Первые дела в Арбитражном суде, формирование экспертизы." },
              { year: "2020", title: "Первые 100 клиентов", text: "Выстроена система полного сопровождения: от анализа долгов до завершения процедуры. Заключены соглашения с арбитражными управляющими." },
              { year: "2021", title: "Масштабирование", text: "Открыты представительства в нескольких регионах. Подключение к СРО «Дело» и АСПБ. Команда выросла до 20 специалистов." },
              { year: "2022", title: "Цифровизация", text: "Запуск внутренней CRM для управления делами. Автоматизация документооборота и взаимодействия с судами." },
              { year: "2023", title: "Партнёрская модель", text: "Разработана концепция партнёрской сети. Пилотный запуск с первыми партнёрами, отработка модели вознаграждения." },
              { year: "2024", title: "Запуск платформы Агентум Про", text: "Создана цифровая платформа для партнёров: личный кабинет, передача лидов, отслеживание статусов, выплаты. Присоединение к СРО «Гарантия»." },
              { year: "2025", title: "Рост сети", text: "Партнёрская сеть выросла до 500+ участников. Внедрение ИИ-помощника, системы обучения и маркетинговых материалов для партнёров." },
              { year: "2026", title: "Сегодня", text: "Более 15 000 завершённых дел о банкротстве. Платформа работает по всей России. Средняя сумма списанных долгов — 1.8 млн рублей на клиента." },
            ].map((item) => (
              <div key={item.year} className="relative">
                <div className="absolute -left-[1.95rem] top-0.5 h-3 w-3 rounded-full bg-primary" />
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-xs font-mono text-primary font-semibold">{item.year}</span>
                  <span className="text-sm font-semibold">{item.title}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ====== ONBOARDING CHECKLIST (inside history tab) ====== */}
      {!allDone && checklist && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Начало работы</h3>
                <p className="text-xs text-muted-foreground">{completedSteps} из {checklistItems.length} шагов выполнено</p>
              </div>
            </div>
            <div className="space-y-2">
              {checklistItems.map((item, i) => (
                <Link key={i} href={item.href} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-background/60 transition-colors group">
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                  <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : "font-medium"}`}>{item.label}</span>
                  {!item.done && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      </>)}

      {activeTab === "partner" && (<>
      {/* ====== BECOME A PARTNER ====== */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-primary/5 border-b border-primary/10 p-5">
          <h2 className="text-lg font-semibold">Станьте партнёром ГК «Федеральная Экспертная Служба»</h2>
          <p className="text-sm text-muted-foreground mt-1">Зарабатывайте от 10 000 ₽ за каждую рекомендацию</p>
        </div>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Всё просто — вы рекомендуете нашу компанию как экспертов по списанию долгов,
            а мы выплачиваем вам вознаграждение за каждого клиента, который обратился по вашей рекомендации.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold mb-3">Что получают ваши знакомые</h3>
              <div className="space-y-2.5">
                {[
                  "1–3 гарантированных варианта решения проблем с долгами",
                  "Гарантия списания долгов, прописанная в договоре",
                  "Фиксированная стоимость с рассрочкой на 10–12 месяцев",
                  "Индивидуальный подход к ситуации каждого клиента",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h3 className="text-sm font-semibold mb-3">Что получаете вы</h3>
              <div className="space-y-3">
                {[
                  { num: "01", text: "Благодарность близких за совет, который изменит их жизнь к лучшему" },
                  { num: "02", text: "Вознаграждение от 10 000 ₽ за каждого клиента, заключившего договор на банкротство" },
                  { num: "03", text: "Бесплатная правовая защита для вашей семьи на целый год по любым юридическим вопросам" },
                  { num: "04", text: "Скидки и бонусы от партнёров компании" },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-3">
                    <span className="text-xs font-mono font-bold text-primary shrink-0 mt-0.5">{item.num}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/agent/leads" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <UserPlus className="h-4 w-4" /> Передать первого клиента
            </Link>
            <span className="text-xs text-muted-foreground">Начните зарабатывать прямо сейчас</span>
          </div>
        </CardContent>
      </Card>
      </>)}

      {activeTab === "contract" && (<>
      <Card className="mb-8 overflow-hidden">
        <div className="bg-primary/5 border-b border-primary/10 p-5">
          <h2 className="text-lg font-semibold">Партнёрское соглашение</h2>
          <p className="text-sm text-muted-foreground mt-1">Договор о сотрудничестве с платформой</p>
        </div>
        <CardContent className="p-5">
          {contracts.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Договор пока не загружен</p>
              <p className="text-xs text-muted-foreground mt-1">Обратитесь к менеджеру для получения договора</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.title}</p>
                      <p className="text-xs text-muted-foreground">Загружен {formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setViewUrl(c.fileUrl)}>
                      <Eye className="h-4 w-4 mr-1" /> Читать
                    </Button>
                    <a href={c.fileUrl} download>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" /> Скачать
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {viewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setViewUrl(null)}>
          <div
            className="bg-card border border-border rounded-xl w-full max-w-4xl mx-4 overflow-hidden relative"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Партнёрское соглашение</span>
              <button onClick={() => setViewUrl(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={viewUrl}
              className="w-full"
              style={{ height: "calc(90vh - 49px)" }}
            />
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
