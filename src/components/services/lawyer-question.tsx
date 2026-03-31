"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle2, Scale } from "lucide-react";

export function LawyerQuestion() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lawyer_question",
          message: subject.trim()
            ? `[${subject.trim()}]\n\n${message.trim()}`
            : message.trim(),
        }),
      });

      if (res.ok) {
        setSent(true);
        setSubject("");
        setMessage("");
        setTimeout(() => setSent(false), 5000);
      }
    } catch {
      // ignore
    }

    setSending(false);
  };

  return (
    <div className="p-4 flex flex-col h-[420px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Scale className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Вопрос юристу</h4>
          <p className="text-xs text-muted-foreground">Персональная консультация от юриста платформы</p>
        </div>
      </div>

      {sent ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="h-10 w-10 text-success mb-3" />
          <p className="text-sm font-medium">Вопрос отправлен!</p>
          <p className="text-xs text-muted-foreground mt-1">Юрист ответит в течение рабочего дня в разделе «Сообщения»</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Тема (необязательно)</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Например: вопрос по банкротству"
                className="text-sm"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-muted-foreground mb-1 block">Ваш вопрос</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишите ситуацию подробно — чем больше деталей, тем точнее будет ответ юриста..."
                className="flex-1 min-h-[140px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">Ответ придёт в раздел «Сообщения»</p>
            <Button size="sm" onClick={handleSubmit} disabled={sending || !message.trim()}>
              <Send className="h-4 w-4 mr-1" />
              {sending ? "Отправка..." : "Отправить"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
