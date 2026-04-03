import { BreadcrumbItem } from "@/types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
          {breadcrumbs.map((item, i) => (
            <span key={i} className="flex items-center gap-1 sm:gap-1.5">
              {i > 0 && <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              {item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.title}
                </Link>
              ) : (
                <span className="text-foreground">{item.title}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
