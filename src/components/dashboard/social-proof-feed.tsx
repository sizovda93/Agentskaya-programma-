"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCurrency, timeAgo, maskName } from "@/lib/utils";
import { Scale, RussianRuble, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayoutEntry {
  id: string;
  type: "payout";
  fullName: string;
  amount: number;
  tier: "base" | "silver" | "gold";
  partnerNumber: number;
  createdAt: string;
}

interface CourtEntry {
  id: string;
  type: "court";
  text: string;
  createdAt: string;
}

type SocialEntry = PayoutEntry | CourtEntry;

const TIER_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  base: { bg: "bg-zinc-500/10", text: "text-zinc-500", label: "Base" },
  silver: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Silver" },
  gold: { bg: "bg-amber-500/10", text: "text-amber-500", label: "Gold" },
};

const FALLBACK: SocialEntry[] = [
  { id: "f1", type: "payout", fullName: "Иванов Алексей Сергеевич", amount: 20000, tier: "silver", partnerNumber: 892, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "f2", type: "court", text: "Списано 1 500 000 ₽ долгов — Петров П.П. полностью освобождён от обязательств", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "f3", type: "payout", fullName: "Петрова Мария Владимировна", amount: 35000, tier: "gold", partnerNumber: 901, createdAt: new Date(Date.now() - 10800000).toISOString() },
  { id: "f4", type: "payout", fullName: "Козлов Дмитрий Игоревич", amount: 15000, tier: "base", partnerNumber: 915, createdAt: new Date(Date.now() - 18000000).toISOString() },
  { id: "f5", type: "court", text: "Рябинская Юлия Александровна (А53-40604/2024) — полностью освобождена от долгов", createdAt: new Date(Date.now() - 21600000).toISOString() },
];

function PayoutCard({ entry }: { entry: PayoutEntry }) {
  const tier = TIER_COLORS[entry.tier] || TIER_COLORS.base;
  const name = maskName(entry.fullName);

  return (
    <div className="shrink-0 flex items-center gap-3 rounded-xl border border-success/20 bg-success/5 px-4 py-3 w-[280px]">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs bg-success/10 text-success">
          {getInitials(entry.fullName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{name}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", tier.bg, tier.text)}>
            {tier.label}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-sm font-bold text-success">{formatCurrency(entry.amount)}</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(entry.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function CourtCard({ entry }: { entry: CourtEntry }) {
  return (
    <div className="shrink-0 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 w-[320px]">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Scale className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-foreground leading-snug line-clamp-2">{entry.text}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(entry.createdAt)}</p>
      </div>
    </div>
  );
}

export function SocialProofFeed() {
  const [entries, setEntries] = useState<SocialEntry[]>(FALLBACK);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalDeals, setTotalDeals] = useState(0);

  useEffect(() => {
    fetch("/api/social-proof")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.entries?.length > 0) setEntries(data.entries);
        if (data?.totalPaid) setTotalPaid(data.totalPaid);
        if (data?.totalDeals) setTotalDeals(data.totalDeals);
      })
      .catch(() => {});
  }, []);

  if (entries.length === 0) return null;

  // Double for infinite scroll
  const doubled = [...entries, ...entries];
  const duration = Math.max(entries.length * 6, 30);

  return (
    <div className="mb-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
            <Trophy className="h-3 w-3 text-success" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Достижения партнёров</span>
        </div>
        {totalPaid > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <RussianRuble className="h-3.5 w-3.5 text-success" />
              <span className="text-sm font-bold text-success">{formatCurrency(totalPaid)}</span>
              <span className="text-[10px] text-muted-foreground">выплачено</span>
            </div>
            {totalDeals > 0 && (
              <span className="text-[10px] text-muted-foreground">{totalDeals} сделок</span>
            )}
          </div>
        )}</div>

      {/* Scrolling feed */}
      <div className="overflow-hidden rounded-xl relative">
        {/* Gradient fades */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          className="marquee-track flex gap-3 whitespace-nowrap"
          style={{ animationDuration: `${duration}s` }}
        >
          {doubled.map((entry, i) =>
            entry.type === "payout" ? (
              <PayoutCard key={`${entry.id}-${i}`} entry={entry as PayoutEntry} />
            ) : (
              <CourtCard key={`${entry.id}-${i}`} entry={entry as CourtEntry} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
