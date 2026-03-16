import { User, UserRole } from "@/types";
import { mockUsers } from "@/lib/mock/data";

const CURRENT_USER_KEY = "currentUser";

// Мок-аутентификация для оболочки
export function getMockUser(role: UserRole): User {
  return mockUsers.find((u) => u.role === role) ?? mockUsers[0];
}

export function login(email: string, _password: string): User | null {
  const user = mockUsers.find((u) => u.email === email);
  if (user) {
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  }
  return null;
}

export function loginAsRole(role: UserRole): User {
  const user = getMockUser(role);
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
  return user;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      try {
        return JSON.parse(data) as User;
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "agent":
      return "/agent/dashboard";
    case "manager":
      return "/manager/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === "admin") return true;
  return userRole === requiredRole;
}
