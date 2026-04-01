"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle2, Scale, Percent } from "lucide-react";

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
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Scale className="h-5 w-5 text-orange-500" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Обращение к юристу</h4>
          <p className="text-xs text-muted-foreground">Персональная консультация от юриста платформы</p>
        </div>
      </div>

      {/* Discount banner */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
            <Percent className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary mb-1">Скидка 20% для партнёров</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              В случае необходимости представительства в суде, составления процессуальных документов или иных юридических услуг,
              партнёрам платформы предоставляется скидка в размере 20% от стоимости услуг при обращении через данную форму.
              Скидка распространяется на все виды юридической помощи, оказываемой специалистами компании.
            </p>
          </div>
        </div>
      </div>

      {sent ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-success mb-3" />
          <p className="text-sm font-medium">Обращение отправлено!</p>
          <p className="text-xs text-muted-foreground mt-1">Юрист ответит в течение рабочего дня в разделе «Сообщения»</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Тема обращения (необязательно)</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Например: представительство в суде, составление документов"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Описание вопроса</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Опишите ситуацию подробно — чем больше деталей, тем точнее будет ответ юриста..."
              className="min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-muted-foreground">Ответ придёт в раздел «Сообщения»</p>
            <Button size="sm" onClick={handleSubmit} disabled={sending || !message.trim()}>
              <Send className="h-4 w-4 mr-1" />
              {sending ? "Отправка..." : "Отправить обращение"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
