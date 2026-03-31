"use client";

import { Bell, Menu, LogOut, ChevronDown, Sun, Moon, Newspaper, Gift, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";
import { getInitials, formatDate } from "@/lib/utils";
import { getRoleLabel } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "./theme-provider";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  source: string;
}

const typeIcons: Record<string, typeof Info> = {
  news: Newspaper,
  giveaway: Gift,
  broadcast: MessageSquare,
  info: Info,
  success: Info,
  warning: Info,
  error: Info,
};

interface AppHeaderProps {
  user: User;
  onMenuToggle?: () => void;
}

export function AppHeader({ user, onMenuToggle }: AppHeaderProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { theme, toggleTheme } = useTheme();

  const loadNotifs = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotifications)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadNotifs();
    const timer = setInterval(loadNotifs, 60000);
    return () => clearInterval(timer);
  }, [loadNotifs]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false); }}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center px-1">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>

            {showNotifs && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} />
                <div className="absolute right-0 top-full mt-1 w-80 max-h-[420px] rounded-lg border border-border bg-card shadow-xl z-50 flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
                    <span className="text-sm font-semibold">Уведомления</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                        Прочитать все
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">Нет уведомлений</div>
                    ) : (
                      notifications.slice(0, 15).map((n) => {
                        const Icon = typeIcons[n.type] || Info;
                        return (
                          <div
                            key={`${n.source}-${n.id}`}
                            className={`flex gap-3 px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                            onClick={() => {
                              if (n.source === "announcement") {
                                router.push("/agent/announcements");
                                setShowNotifs(false);
                              }
                            }}
                            style={{ cursor: n.source === "announcement" ? "pointer" : "default" }}
                          >
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{n.message.slice(0, 80)}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatDate(n.createdAt)}</p>
                            </div>
                            {!n.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowMenu(!showMenu); setShowNotifs(false); }}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">{user.fullName}</p>
                <p className="text-[11px] text-muted-foreground">{getRoleLabel(user.role)}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-card shadow-xl z-50 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
