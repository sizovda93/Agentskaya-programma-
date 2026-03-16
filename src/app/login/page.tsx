"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scale, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAsRole } from "@/lib/auth";
import { getRoleRedirectPath } from "@/lib/auth";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleQuickLogin = (role: UserRole) => {
    const user = loginAsRole(role);
    router.push(getRoleRedirectPath(user.role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: default to agent
    handleQuickLogin("agent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Вход в систему</h1>
          <p className="text-sm text-muted-foreground mt-1">ПравоТех</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Пароль</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Войти
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick login for demo */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Быстрый вход (демо)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("agent")}>
              Агент
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("manager")}>
              Менеджер
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickLogin("admin")}>
              Админ
            </Button>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Регистрация
          </Link>
        </div>
      </div>
    </div>
  );
}
