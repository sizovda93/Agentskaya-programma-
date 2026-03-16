"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAsRole, getRoleRedirectPath } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = loginAsRole("agent");
    router.push(getRoleRedirectPath(user.role));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Регистрация</h1>
          <p className="text-sm text-muted-foreground mt-1">Станьте агентом ПравоТех</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">ФИО</label>
            <Input
              placeholder="Иванов Иван Иванович"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            <label className="text-sm text-muted-foreground mb-1.5 block">Пароль</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Зарегистрироваться
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground text-center">
          Нажимая кнопку, вы принимаете{" "}
          <Link href="/offer" className="text-primary hover:underline">условия оферты</Link>
          {" "}и{" "}
          <Link href="/consent" className="text-primary hover:underline">согласие на обработку ПД</Link>
        </p>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
}
