"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LeadStatusBadge } from "@/components/dashboard/status-badges";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Rocket, Lightbulb } from "lucide-react";
import { Lead, Conversation, AgentTier } from "@/types";
import { TierBadge } from "@/components/dashboard/status-badges";

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
  const [showChecklist, setShowChecklist] = useState(false);
  const [agentRank, setAgentRank] = useState<{ rank: number | null; totalAgents: number } | null>(null);
  const [agentTier, setAgentTier] = useState<AgentTier>("base");

  useEffect(() => {
    Promise.all([
      fetch("/api/leads").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/learning/progress").then((r) => r.json()).catch(() => null),
      fetch("/api/telegram/status").then((r) => r.json()).catch(() => ({ connected: false })),
      fetch("/api/analytics").then((r) => r.ok ? r.json() : null).catch(() => null),
    ])
      .then(([ld, cv, st, profile, progress, tgStatus, analyticsData]) => {
        const leadsArr = Array.isArray(ld) ? ld : [];
        setLeads(leadsArr);
        setConversations(Array.isArray(cv) ? cv : []);
        setStats(st || {});

        // Build checklist from existing data
        const cl: ChecklistState = {
          profileFilled: !!(profile?.city && profile?.phone),
          learningDone: progress?.allRequiredDone === true,
          telegramConnected: tgStatus?.connected === true,
          firstLead: leadsArr.length > 0,
        };
        setChecklist(cl);

        // Show checklist if not all done
        const allDone = cl.profileFilled && cl.learningDone && cl.telegramConnected && cl.firstLead;
        setShowChecklist(!allDone);

        if (analyticsData?.agentRank) {
          setAgentRank(analyticsData.agentRank);
        }
        if (profile?.tier) {
          setAgentTier(profile.tier as AgentTier);
        }
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

  // Retention reminders (for agents who finished checklist but need nudges)
  const retentionReminders: { label: string; href: string }[] = [];
  if (!showChecklist && checklist) {
    if (leads.length === 0) {
      retentionReminders.push({ label: "Создайте первый лид — это просто!", href: "/agent/leads" });
    }
    if (leads.length > 0 && leads.length < 3) {
      retentionReminders.push({ label: "Попробуйте маркетинговые материалы для привлечения клиентов", href: "/agent/marketing" });
    }
  }

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Обзор вашей активности и ключевые показатели"
      />

      {/* Onboarding Checklist */}
      {showChecklist && checklist && (
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
                <Link
                  key={i}
                  href={item.href}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-background/60 transition-colors group"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`text-sm ${item.done ? "text-muted-foreground line-through" : "font-medium"}`}>
                    {item.label}
                  </span>
                  {!item.done && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retention reminders */}
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

      {/* Rank + Tier */}
      {agentRank?.rank && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Ваш рейтинг:</span>
              <span className="text-lg font-bold">#{agentRank.rank}</span>
              <span className="text-sm text-muted-foreground">из {agentRank.totalAgents}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Уровень:</span>
              <TierBadge tier={agentTier} />
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Активные лиды"
          value={activeLeads.length}
          icon="Users"
        />
        <StatCard
          title="Непрочитанные"
          value={unreadCount}
          icon="MessageSquare"
        />
        <StatCard
          title="Заработано"
          value={formatCurrency(Number(stats.totalRevenue || 0))}
          icon="Wallet"
        />
        <StatCard
          title="Конверсия"
          value={`${conversionRate}%`}
          icon="Target"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Последние лиды</CardTitle>
            <Link
              href="/agent/leads"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все лиды <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leads.slice(0, 4).map((lead) => (
                <Link
                  key={lead.id}
                  href={`/agent/leads/${lead.id}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{lead.fullName}</p>
                    <p className="text-xs text-muted-foreground">{lead.city} · {formatDate(lead.createdAt)}</p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Активные диалоги</CardTitle>
            <Link
              href="/agent/messages"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Все сообщения <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversations.slice(0, 4).map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{conv.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1.5 ml-3">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
