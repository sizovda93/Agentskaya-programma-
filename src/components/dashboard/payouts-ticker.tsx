"use client";

import { useState, useEffect, useRef } from "react";
import { DollarSign } from "lucide-react";

interface PayoutEntry {
  name: string;
  amount: number;
}

// Mock data — rotate through these, refresh every 3 hours
const MOCK_PAYOUTS: PayoutEntry[] = [
  { name: "Иванов А.", amount: 20000 },
  { name: "Петрова М.", amount: 35000 },
  { name: "Сидоров К.", amount: 15000 },
  { name: "Козлова Е.", amount: 28000 },
  { name: "Новиков Д.", amount: 42000 },
  { name: "Морозова А.", amount: 18000 },
  { name: "Волков С.", amount: 31000 },
  { name: "Лебедева О.", amount: 25000 },
  { name: "Соколов П.", amount: 50000 },
  { name: "Фёдорова И.", amount: 22000 },
  { name: "Кузнецов В.", amount: 37000 },
  { name: "Попова Н.", amount: 19000 },
  { name: "Смирнов Г.", amount: 45000 },
  { name: "Васильева Т.", amount: 27000 },
  { name: "Михайлов Р.", amount: 33000 },
];

function getVisiblePayouts(): PayoutEntry[] {
  // Select 5 payouts based on current 3-hour window
  const hoursSlot = Math.floor(Date.now() / (3 * 60 * 60 * 1000));
  const startIdx = (hoursSlot * 5) % MOCK_PAYOUTS.length;
  const result: PayoutEntry[] = [];
  for (let i = 0; i < 5; i++) {
    result.push(MOCK_PAYOUTS[(startIdx + i) % MOCK_PAYOUTS.length]);
  }
  return result;
}

function formatAmount(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

export function PayoutsTicker() {
  const [payouts, setPayouts] = useState<PayoutEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPayouts(getVisiblePayouts());

    // Check for refresh every minute
    const refreshTimer = setInterval(() => {
      setPayouts(getVisiblePayouts());
    }, 60 * 1000);

    return () => clearInterval(refreshTimer);
  }, []);

  useEffect(() => {
    if (payouts.length === 0) return;

    timerRef.current = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % payouts.length);
        setIsVisible(true);
      }, 400);
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [payouts]);

  if (payouts.length === 0) return null;

  const current = payouts[activeIndex];

  return (
    <div className="mb-4 rounded-xl border border-success/20 bg-success/5 px-4 py-2.5 flex items-center gap-3 overflow-hidden">
      <div className="h-7 w-7 rounded-full bg-success/15 flex items-center justify-center shrink-0">
        <DollarSign className="h-3.5 w-3.5 text-success" />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <span className="text-sm">
          Партнёр <span className="font-semibold">{current?.name}</span> получил выплату{" "}
          <span className="font-semibold text-success">{formatAmount(current?.amount ?? 0)}</span>
          {" — "}
          <span className="text-muted-foreground">Поздравляем!</span>
        </span>
      </div>
      <div className="flex gap-1 shrink-0">
        {payouts.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors ${
              i === activeIndex ? "bg-success" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
