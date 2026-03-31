"use client";

import { RussianRuble, Scale } from "lucide-react";

interface TickerEntry {
  text: string;
}

// --- Выплаты партнёрам (mock) ---
const PAYOUT_ENTRIES: TickerEntry[] = [
  { text: "Партнёр Иванов А. получил выплату 20 000 ₽ — Поздравляем!" },
  { text: "Партнёр Петрова М. получила выплату 35 000 ₽ — Поздравляем!" },
  { text: "Партнёр Сидоров К. получил выплату 15 000 ₽ — Поздравляем!" },
  { text: "Партнёр Козлова Е. получила выплату 28 000 ₽ — Поздравляем!" },
  { text: "Партнёр Новиков Д. получил выплату 42 000 ₽ — Поздравляем!" },
];

// --- Завершённые дела из Арбитражного суда (mock) ---
const COURT_ENTRIES: TickerEntry[] = [
  { text: "Поздравляем партнёра Иванова! Его доверитель Рябинская Юлия Александровна (А53-40604/2024) полностью освобождена от долгов!" },
  { text: "Поздравляем партнёра Петрову! Её доверитель Кузнецов Андрей Викторович (А41-18753/2024) полностью освобождён от долгов!" },
  { text: "Поздравляем партнёра Сидорова! Его доверитель Белова Марина Сергеевна (А40-92147/2024) полностью освобождена от долгов!" },
  { text: "Поздравляем партнёра Козлову! Её доверитель Тарасов Игорь Николаевич (А56-31285/2024) полностью освобождён от долгов!" },
  { text: "Поздравляем партнёра Новикова! Его доверитель Фёдорова Анна Павловна (А32-7849/2025) полностью освобождена от долгов!" },
];

function MarqueeBar({
  entries,
  icon,
  colorClass,
  speed = 30,
}: {
  entries: TickerEntry[];
  icon: React.ReactNode;
  colorClass: string;
  speed?: number;
}) {
  // Duplicate entries for seamless loop
  const doubled = [...entries, ...entries];
  const totalChars = entries.reduce((s, e) => s + e.text.length, 0);
  const duration = Math.max(totalChars / speed, 20);

  return (
    <div className={`rounded-xl border ${colorClass} px-3 py-2 flex items-center gap-3 overflow-hidden`}>
      <div className="shrink-0 z-10">{icon}</div>
      <div className="flex-1 overflow-hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />
        <div className="marquee-track flex whitespace-nowrap" style={{ animationDuration: `${duration}s` }}>
          {doubled.map((e, i) => (
            <span key={i} className="text-sm mx-8">{e.text}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PayoutsTicker() {
  return (
    <div className="space-y-3 mb-6">
      <MarqueeBar
        entries={PAYOUT_ENTRIES}
        colorClass="border-success/20 bg-success/5"
        icon={
          <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center">
            <RussianRuble className="h-3.5 w-3.5 text-success" />
          </div>
        }
        speed={25}
      />
      <MarqueeBar
        entries={COURT_ENTRIES}
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
