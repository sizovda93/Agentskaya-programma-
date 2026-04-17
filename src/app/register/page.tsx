"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowRight, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", managerCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [consents, setConsents] = useState({ offer: false, personal_data: false });
  const [modalContent, setModalContent] = useState<"offer" | "pd" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!consents.offer || !consents.personal_data) {
      setError("Необходимо принять оферту и согласие на обработку ПД");
      return;
    }

    setLoading(true);

    try {
      const consentList: string[] = [];
      if (consents.offer) consentList.push("offer");
      if (consents.personal_data) consentList.push("personal_data");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consents: consentList }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка регистрации");
        return;
      }

      router.push("/agent/dashboard");
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Регистрация</h1>
          <p className="text-sm text-muted-foreground mt-1">Станьте партнёром Агентум Про</p>
          <p className="text-xs text-muted-foreground">система управления партнёрской сетью</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">ФИО</label>
            <Input
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Телефон</label>
            <Input
              type="tel"
              placeholder="+7 (900) 000-00-00"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Код менеджера <span className="text-[10px]">(если есть)</span></label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Например: 100"
              value={form.managerCode}
              onChange={(e) => setForm({ ...form, managerCode: e.target.value.replace(/\D/g, "") })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Если менеджер дал вам свой номер — введите его, чтобы автоматически закрепиться</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Пароль</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Минимум 8 символов"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
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

          {/* Consent checkboxes */}
          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.offer}
                onChange={(e) => setConsents({ ...consents, offer: e.target.checked })}
                className="mt-1 rounded border-border"
              />
              <span className="text-xs text-muted-foreground">
                Принимаю{" "}
                <button type="button" onClick={() => setModalContent("offer")} className="text-primary hover:underline">условия оферты</button>
              </span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.personal_data}
                onChange={(e) => setConsents({ ...consents, personal_data: e.target.checked })}
                className="mt-1 rounded border-border"
              />
              <span className="text-xs text-muted-foreground">
                Даю{" "}
                <button type="button" onClick={() => setModalContent("pd")} className="text-primary hover:underline">согласие на обработку ПД</button>
              </span>
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Забыли пароль?
          </Link>
        </div>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline">Войти</Link>
        </div>
      </div>

      {/* Modal */}
      {modalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalContent(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto mx-4 p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModalContent(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
            {modalContent === "offer" ? (
              <>
                <h2 className="text-lg font-semibold mb-4">Публичная оферта</h2>
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>Настоящая публичная оферта определяет условия использования платформы Агентум Про.</p>
                  <p><strong className="text-foreground">1. Общие положения.</strong> Платформа предоставляет сервис для координации работы юридических партнёров, управления лидами и автоматизации коммуникаций. Регистрируясь, Пользователь принимает условия в полном объёме.</p>
                  <p><strong className="text-foreground">2. Предмет оферты.</strong> Компания предоставляет Пользователю доступ к функциональности Платформы в соответствии с выбранным тарифным планом. Перечень доступных функций определяется ролью Пользователя в системе.</p>
                  <p><strong className="text-foreground">3. Условия использования.</strong> Пользователь обязуется использовать Платформу исключительно в законных целях. Пользователь несёт ответственность за сохранность своих учётных данных.</p>
                  <p><strong className="text-foreground">4. Ответственность.</strong> Администрация не несёт ответственности за действия третьих лиц, технические сбои провайдеров, содержание сообщений Пользователей.</p>
                  <p className="text-xs mt-4">Дата публикации: 1 января 2026 г.</p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold mb-4">Согласие на обработку персональных данных</h2>
                <div className="text-sm text-muted-foreground space-y-3">
                  <p>Регистрируясь на Платформе, Пользователь даёт своё согласие на обработку персональных данных в соответствии с ФЗ-152 «О персональных данных».</p>
                  <p><strong className="text-foreground">Перечень данных:</strong> ФИО, адрес электронной почты, номер телефона, город проживания, сведения о профессиональной деятельности.</p>
                  <p><strong className="text-foreground">Цели обработки:</strong> предоставление доступа к функциям Платформы, связь с пользователем по вопросам предоставления услуг, статистический анализ использования Платформы.</p>
                  <p><strong className="text-foreground">Срок действия.</strong> Согласие действует с момента его предоставления и до момента отзыва путём направления письменного уведомления.</p>
                  <p className="text-xs mt-4">Дата публикации: 1 января 2026 г.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
