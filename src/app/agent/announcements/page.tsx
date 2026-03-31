"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { Newspaper, Gift, Bell } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  type: "news" | "giveaway" | "update";
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { label: string; icon: typeof Newspaper; color: string }> = {
  news: { label: "Новость", icon: Newspaper, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  giveaway: { label: "Розыгрыш", icon: Gift, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  update: { label: "Обновление", icon: Bell, color: "bg-green-500/10 text-green-600 border-green-500/20" },
};

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Объявления"
        description="Новости и розыгрыши для партнёров"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Объявления" },
        ]}
      />

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Пока нет объявлений</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const cfg = typeConfig[item.type] || typeConfig.news;
            const Icon = cfg.icon;
            const isExpanded = expanded === item.id;
            const isLong = item.content.length > 300;

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl ${cfg.color.split(" ")[0]} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${cfg.color.split(" ")[1]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                      </div>
                      <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {isLong && !isExpanded
                          ? item.content.slice(0, 300) + "..."
                          : item.content}
                      </div>
                      {isLong && (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : item.id)}
                          className="text-xs text-primary hover:underline mt-2"
                        >
                          {isExpanded ? "Свернуть" : "Читать полностью"}
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
