"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCurrency, timeAgo, maskName, cn } from "@/lib/utils";
import { RussianRuble, Users, TrendingUp, Briefcase } from "lucide-react";

interface PartnerEntry {
  id: string;
  fullName: string;
  lastPayout: number;
  totalEarned: number;
  dealCount: number;
  tier: "base" | "silver" | "gold";
  partnerNumber: number;
  createdAt: string;
}

interface SocialProofData {
  totalPaid: number;
  totalDeals: number;
  totalPartners: number;
  entries: PartnerEntry[];
}

const TIER_STYLE: Record<string, { ring: string; label: string; color: string }> = {
  base: { ring: "ring-zinc-400/30", label: "Базовый", color: "text-zinc-500" },
  silver: { ring: "ring-blue-400/40", label: "Серебро", color: "text-blue-500" },
  gold: { ring: "ring-amber-400/50", label: "Золото", color: "text-amber-500" },
};

const FALLBACK_ENTRIES: PartnerEntry[] = [
  { id: "f1", fullName: "Иванов Алексей Сергеевич", lastPayout: 20000, totalEarned: 85000, dealCount: 5, tier: "silver", partnerNumber: 892, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "f2", fullName: "Петрова Мария Владимировна", lastPayout: 35000, totalEarned: 210000, dealCount: 12, tier: "gold", partnerNumber: 901, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "f3", fullName: "Козлов Дмитрий Игоревич", lastPayout: 15000, totalEarned: 30000, dealCount: 2, tier: "base", partnerNumber: 915, createdAt: new Date(Date.now() - 14400000).toISOString() },
  { id: "f4", fullName: "Сидорова Елена Петровна", lastPayout: 25000, totalEarned: 120000, dealCount: 7, tier: "silver", partnerNumber: 923, createdAt: new Date(Date.now() - 21600000).toISOString() },
  { id: "f5", fullName: "Николаев Андрей Васильевич", lastPayout: 40000, totalEarned: 340000, dealCount: 18, tier: "gold", partnerNumber: 888, createdAt: new Date(Date.now() - 28800000).toISOString() },
];

function PartnerCard({ entry }: { entry: PartnerEntry }) {
  const tier = TIER_STYLE[entry.tier] || TIER_STYLE.base;
  const name = maskName(entry.fullName);

  return (
    <div className="shrink-0 w-[260px] rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Top: avatar + name + tier */}
      <div className="flex items-center gap-3">
        <Avatar className={cn("h-10 w-10 ring-2", tier.ring)}>
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{getInitials(entry.fullName)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{name}</p>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-[10px] font-medium", tier.color)}>{tier.label}</span>
            <span className="text-[10px] text-muted-foreground">· №{entry.partnerNumber}</span>
          </div>
        </div>
      </div>

      {/* Stats: last payout + total */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-success/5 border border-success/10 px-2.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Получил сейчас</p>
          <p className="text-sm font-bold text-success">{formatCurrency(entry.lastPayout)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 border border-border px-2.5 py-2 text-center">
          <p className="text-[10px] text-muted-foreground mb-0.5">Всего заработал</p>
          <p className="text-sm font-bold">{formatCurrency(entry.totalEarned)}</p>
        </div>
      </div>

      {/* Bottom: deals + time */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{entry.dealCount} {entry.dealCount === 1 ? "сделка" : entry.dealCount < 5 ? "сделки" : "сделок"}</span>
        <span>{timeAgo(entry.createdAt)}</span>
      </div>
    </div>
  );
}

function TotalBanner({ totalPaid, totalDeals, totalPartners }: { totalPaid: number; totalDeals: number; totalPartners: number }) {
  if (totalPaid <= 0) return null;

  return (
    <div className="flex items-center gap-6 mb-3 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
          <RussianRuble className="h-4 w-4 text-success" />
        </div>
        <div>
          <p className="text-lg font-bold text-success leading-tight">{formatCurrency(totalPaid)}</p>
          <p className="text-[10px] text-muted-foreground">выплачено партнёрам</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{totalDeals}</span> сделок</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{totalPartners}</span> партнёров</span>
        </div>
      </div>
    </div>
  );
}

export function SocialProofFeed() {
  const [entries, setEntries] = useState<PartnerEntry[]>(FALLBACK_ENTRIES);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);
  const [totalPartners, setTotalPartners] = useState(0);

  useEffect(() => {
    fetch("/api/social-proof")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: SocialProofData | null) => {
        if (data?.entries?.length) setEntries(data.entries);
        if (data?.totalPaid) setTotalPaid(data.totalPaid);
        if (data?.totalDeals) setTotalDeals(data.totalDeals);
        if (data?.totalPartners) setTotalPartners(data.totalPartners);
      })
      .catch(() => {});
  }, []);

  if (entries.length === 0) return null;

  const doubled = [...entries, ...entries];
  const duration = Math.max(entries.length * 8, 40);

  return (
    <div className="mb-6">
      {/* Total banner */}
      <TotalBanner totalPaid={totalPaid} totalDeals={totalDeals} totalPartners={totalPartners} />

      {/* Section label */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="h-3.5 w-3.5 text-success" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Последние выплаты партнёрам</span>
      </div>

      {/* Scrolling feed */}
      <div className="overflow-hidden relative rounded-xl">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="marquee-track flex gap-4" style={{ animationDuration: `${duration}s` }}>
          {doubled.map((entry, i) => (
            <PartnerCard key={`${entry.id}-${i}`} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}
