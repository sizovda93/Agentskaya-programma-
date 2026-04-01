"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate } from "@/lib/utils";
import { Briefcase, Users, CheckCircle, XCircle, Eye } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Vacancy {
  id: string;
  title: string;
  isActive: boolean;
  isRemote: boolean;
  salaryFrom: number | null;
  salaryTo: number | null;
  createdAt: string;
}

interface Application {
  id: string;
  fullName: string;
  phone: string | null;
  email: string;
  message: string | null;
  status: string;
  partnerNumber: number | null;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; variant: "secondary" | "info" | "success" | "destructive" }> = {
  new: { label: "Новый", variant: "secondary" },
  reviewed: { label: "Просмотрен", variant: "info" },
  accepted: { label: "Принят", variant: "success" },
  rejected: { label: "Отклонён", variant: "destructive" },
};

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Record<string, Application[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedVac, setExpandedVac] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vacancies")
      .then((r) => (r.ok ? r.json() : []))
      .then(setVacancies)
      .finally(() => setLoading(false));
  }, []);

  const loadApps = async (vacId: string) => {
    const res = await fetch(`/api/vacancies/${vacId}/applications`);
    if (res.ok) {
      const data = await res.json();
      setApplications((prev) => ({ ...prev, [vacId]: data }));
    }
  };

  const toggleExpand = (vacId: string) => {
    if (expandedVac === vacId) {
      setExpandedVac(null);
    } else {
      setExpandedVac(vacId);
      if (!applications[vacId]) loadApps(vacId);
    }
  };

  const updateStatus = async (vacId: string, appId: string, status: string) => {
    await fetch(`/api/vacancies/${vacId}/applications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, status }),
    });
    await loadApps(vacId);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Вакансии и отклики"
        description="Управление вакансиями и просмотр откликов партнёров"
        breadcrumbs={[{ title: "Дашборд", href: "/admin/dashboard" }, { title: "Вакансии" }]}
      />

      {vacancies.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Нет вакансий</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {vacancies.map((v) => {
            const apps = applications[v.id] || [];
            const newCount = apps.filter((a) => a.status === "new").length;

            return (
              <Card key={v.id}>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(v.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-base">{v.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {v.isRemote ? "Удалённо" : "Офис"} · {formatDate(v.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={v.isActive ? "success" : "secondary"}>
                        {v.isActive ? "Активна" : "Закрыта"}
                      </Badge>
                      {newCount > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <Users className="h-3 w-3" /> {newCount} новых
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {expandedVac === v.id && (
                  <CardContent>
                    {apps.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Нет откликов</p>
                    ) : (
                      <div className="space-y-3">
                        {apps.map((a) => {
                          const st = statusLabels[a.status] || statusLabels.new;
                          return (
                            <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{a.fullName}</span>
                                  {a.partnerNumber && (
                                    <span className="text-xs font-mono text-primary">№{a.partnerNumber}</span>
                                  )}
                                  <Badge variant={st.variant} className="text-[10px]">{st.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {a.email} {a.phone ? `· ${a.phone}` : ""} · {formatDate(a.createdAt)}
                                </p>
                                {a.message && (
                                  <p className="text-xs text-muted-foreground mt-1.5 bg-muted/50 rounded-lg p-2">
                                    {a.message}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {a.status === "new" && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7" title="Просмотрено" onClick={() => updateStatus(v.id, a.id, "reviewed")}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {a.status !== "accepted" && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-success" title="Принять" onClick={() => updateStatus(v.id, a.id, "accepted")}>
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                {a.status !== "rejected" && (
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Отклонить" onClick={() => updateStatus(v.id, a.id, "rejected")}>
                                    <XCircle className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
