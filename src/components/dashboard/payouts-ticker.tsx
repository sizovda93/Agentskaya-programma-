"use client";

import { useState, useEffect } from "react";
import { RussianRuble, Scale } from "lucide-react";

interface TickerEntry {
  id: string;
  type: string;
  text: string;
  isActive: boolean;
}

// Fallback data while loading
const FALLBACK_PAYOUTS = [
  "Партнёр Иванов Алексей Сергеевич получил выплату 20 000 ₽ — Поздравляем!",
  "Партнёр Петрова Мария Владимировна получила выплату 35 000 ₽ — Поздравляем!",
];
const FALLBACK_COURT = [
  "Поздравляем партнёра Иванова Алексея Сергеевича! Его доверитель Рябинская Юлия Александровна (А53-40604/2024) полностью освобождена от долгов!",
];

function MarqueeBar({
  texts,
  icon,
  colorClass,
  speed = 30,
}: {
  texts: string[];
  icon: React.ReactNode;
  colorClass: string;
  speed?: number;
}) {
  if (texts.length === 0) return null;

  const doubled = [...texts, ...texts];
  const totalChars = texts.reduce((s, t) => s + t.length, 0);
  const duration = Math.max(totalChars / speed, 20);

  return (
    <div className={`rounded-xl border ${colorClass} px-3 py-2 flex items-center gap-3 overflow-hidden`}>
      <div className="shrink-0 z-10">{icon}</div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="marquee-track flex whitespace-nowrap" style={{ animationDuration: `${duration}s` }}>
          {doubled.map((t, i) => (
            <span key={i} className="text-sm mx-8">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PayoutsTicker() {
  const [payouts, setPayouts] = useState<string[]>(FALLBACK_PAYOUTS);
  const [court, setCourt] = useState<string[]>(FALLBACK_COURT);

  useEffect(() => {
    fetch("/api/tickers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: TickerEntry[]) => {
        const active = data.filter((e) => e.isActive);
        const p = active.filter((e) => e.type === "payout").map((e) => e.text);
        const c = active.filter((e) => e.type === "court").map((e) => e.text);
        if (p.length > 0) setPayouts(p);
        if (c.length > 0) setCourt(c);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-3 mb-6">
      <MarqueeBar
        texts={payouts}
        colorClass="border-success/20 bg-success/5"
        icon={
          <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center">
            <RussianRuble className="h-3.5 w-3.5 text-success" />
          </div>
        }
        speed={25}
      />
      <MarqueeBar
        texts={court}
        colorClass="border-primary/20 bg-primary/5"
        icon={
          <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
            <Scale className="h-3.5 w-3.5 text-primary" />
          </div>
        }
        speed={20}
      />
    </div>
  );
}
