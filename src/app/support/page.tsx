"use client";

import Link from "next/link";
import { Scale, Mail, MessageSquare, Clock, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Агентум Про</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Войти
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="mb-10 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Поддержка</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Если у вас возникли вопросы по работе платформы, мы готовы помочь.
          </p>
        </div>

        {/* Main contact */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold mb-0.5">Электронная почта</p>
              <p className="text-sm text-muted-foreground mb-2">
                Пишите по любым вопросам — ответим в течение рабочего дня.
              </p>
              <a
                href="mailto:sizovda93@gmail.com"
                className="text-primary font-medium hover:underline text-sm break-all"
              >
                sizovda93@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Response time */}
        <Card className="mb-6">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Время ответа</p>
              <p className="text-sm text-muted-foreground">
                Пн – Пт: 9:00 – 18:00 (МСК) — ответим в течение нескольких часов.
                <br />
                Сб – Вс: возможны задержки.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4">Частые вопросы</h2>
          <div className="space-y-3">
            {[
              {
                q: "Как зарегистрироваться на платформе?",
                a: "Перейдите на страницу регистрации, заполните форму с ФИО, email и паролем. Если у вас есть код менеджера — укажите его, и вы сразу закрепитесь за ним.",
              },
              {
                q: "Как передать клиента?",
                a: "В кабинете партнёра перейдите в раздел «Лиды» → нажмите «Передать клиента» → укажите имя и телефон. Менеджер свяжется с клиентом и возьмёт дело в работу.",
              },
              {
                q: "Когда приходит выплата?",
                a: "Выплата начисляется после того, как клиент заключает договор и вносит первый платёж. Все начисления отображаются в разделе «Финансы».",
              },
              {
                q: "Что делать если забыл пароль?",
                a: "На странице входа нажмите «Забыли пароль?» — на вашу почту придут инструкции по восстановлению доступа.",
              },
              {
                q: "Как подключить Telegram?",
                a: "Зайдите в Профиль → раздел «Подключения» → нажмите «Подключить Telegram» и следуйте инструкции в боте.",
              },
            ].map((item, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-1.5">{item.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom links */}
        <div className="border-t border-border pt-6 flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
          <Link href="/offer" className="hover:text-foreground transition-colors">Публичная оферта</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link>
          <span>·</span>
          <Link href="/consent" className="hover:text-foreground transition-colors">Согласие на обработку ПД</Link>
        </div>
      </main>
    </div>
  );
}
