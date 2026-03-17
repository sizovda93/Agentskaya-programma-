import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const publicPaths = ["/", "/login", "/register", "/offer", "/privacy", "/consent"];

const rolePrefixes: Record<string, string[]> = {
  "/agent": ["agent"],
  "/manager": ["manager"],
  "/admin": ["admin"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Статика, _next, favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Публичные страницы
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // API-роуты (кроме /api/auth) — проверяем токен
  if (pathname.startsWith("/api")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Защищённые страницы — проверяем токен + роль
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string;
      role: string;
    };

    // Проверка роли по префиксу пути
    for (const [prefix, allowedRoles] of Object.entries(rolePrefixes)) {
      if (pathname.startsWith(prefix) && !allowedRoles.includes(payload.role)) {
        // Редирект на свой дашборд
        const redirectPath =
          payload.role === "agent"
            ? "/agent/dashboard"
            : payload.role === "manager"
              ? "/manager/dashboard"
              : "/admin/dashboard";
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
