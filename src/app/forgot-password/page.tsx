"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Send, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "done">("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [channel, setChannel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      if (data.sent) {
        setChannel(data.channel);
        setStep("done");
      } else {
        setError(data.message || "Не удалось отправить пароль");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Восстановление пароля</h1>
          <p className="text-sm text-muted-foreground mt-1">Агентум Про</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        {/* Step 1: Enter email */}
        {step === "email" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Email вашего аккаунта
              </label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Временный пароль будет отправлен в Telegram или на почту
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Отправка..." : "Получить временный пароль"}
              {!loading && <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}

        {/* Step 2: Done */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <KeyRound className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-foreground">
              {channel === "telegram"
                ? "Временный пароль отправлен в Telegram."
                : "Временный пароль отправлен на вашу почту."}
            </p>
            <p className="text-xs text-muted-foreground">
              Используйте его для входа. После входа рекомендуем сменить пароль в профиле.
            </p>
            <Link href="/login">
              <Button className="w-full">
                Перейти ко входу
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Back to login */}
        {step === "email" && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Вернуться ко входу
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
