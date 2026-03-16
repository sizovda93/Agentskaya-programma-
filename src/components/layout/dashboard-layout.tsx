"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { NavItem, User, UserRole } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import { getNavByRole } from "@/lib/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.role !== role && currentUser.role !== "admin") {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
  }, [role, router]);

  if (!user) return null;

  const navItems = getNavByRole(role);

  return (
    <div className="flex min-h-screen">
      <AppSidebar items={navItems} role={role} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 h-full">
            <AppSidebar items={navItems} role={role} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
