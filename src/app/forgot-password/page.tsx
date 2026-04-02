"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowLeft, Send, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "email" | "code" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
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
        const msg = data.channel === "telegram"
          ? "Код отправлен в Telegram. Проверьте бота."
          : "Код отправлен на вашу почту. Проверьте входящие.";
        setInfo(msg);
        setStep("code");
      } else {
        setError(data.message || "Не удалось отправить код");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка");
        return;
      }

      setStep("done");
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

        {/* Info */}
        {info && step === "code" && (
          <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm text-center">
            {info}
          </div>
        )}

        {/* Step 1: Enter email */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-4">
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
              Код будет отправлен в Telegram или на почту
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Отправка..." : "Отправить код"}
              {!loading && <Send className="h-4 w-4" />}
            </Button>
          </form>
        )}

        {/* Step 2: Enter code + new password */}
        {step === "code" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Код подтверждения
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Новый пароль
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Минимум 6 символов"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Сброс..." : "Сменить пароль"}
              {!loading && <KeyRound className="h-4 w-4" />}
            </Button>
            <button
              type="button"
              onClick={() => { setStep("email"); setError(""); setInfo(""); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Отправить код повторно
            </button>
          </form>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <KeyRound className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-foreground">Пароль успешно изменён!</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Войти с новым паролем
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Back to login */}
        {step !== "done" && (
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
