import { NextRequest, NextResponse } from "next/server";

// В оболочке middleware работает минимально — только редиректы.
// Реальная проверка авторизации будет добавлена при подключении Supabase.

const protectedPrefixes = ["/agent", "/manager", "/admin"];
const publicPaths = ["/", "/login", "/register", "/offer", "/privacy", "/consent"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем публичные маршруты и статику
  if (publicPaths.includes(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Для защищённых маршрутов — проверка будет на клиенте через DashboardLayout
  // В продакшене здесь будет серверная проверка сессии Supabase
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
