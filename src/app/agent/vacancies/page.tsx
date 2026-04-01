"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { Briefcase, MapPin, RussianRuble, CheckCircle2, Send } from "lucide-react";

interface Vacancy {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  conditions: string | null;
  salaryFrom: number | null;
  salaryTo: number | null;
  isRemote: boolean;
  createdAt: string;
}

function formatSalary(from: number | null, to: number | null): string {
  if (from && to) return `от ${from.toLocaleString("ru-RU")} до ${to.toLocaleString("ru-RU")} ₽`;
  if (from) return `от ${from.toLocaleString("ru-RU")} ₽`;
  if (to) return `до ${to.toLocaleString("ru-RU")} ₽`;
  return "По договорённости";
}

export default function AgentVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Apply form
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/vacancies")
      .then((r) => (r.ok ? r.json() : []))
      .then(setVacancies)
      .finally(() => setLoading(false));

    // Load profile for pre-fill
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p.fullName) setFormName(p.fullName);
        if (p.phone) setFormPhone(p.phone);
      })
      .catch(() => {});
  }, []);

  const handleApply = async (vacancyId: string) => {
    if (!formName.trim()) return;
    setSending(true);

    const res = await fetch(`/api/vacancies/${vacancyId}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: formName, phone: formPhone, message: formMessage }),
    });

    if (res.ok) {
      setSent(true);
      setAppliedIds((prev) => new Set(prev).add(vacancyId));
      setTimeout(() => { setSent(false); setApplyingTo(null); setFormMessage(""); }, 3000);
    } else {
      const data = await res.json();
      if (res.status === 409) {
        setAppliedIds((prev) => new Set(prev).add(vacancyId));
        setApplyingTo(null);
      }
      alert(data.error || "Ошибка");
    }

    setSending(false);
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Вакансии"
        description="Актуальные вакансии в нашей команде"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Вакансии" },
        ]}
      />

      {vacancies.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Нет открытых вакансий</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {vacancies.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{v.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant="success" className="gap-1 text-xs">
                          <RussianRuble className="h-3 w-3" /> {formatSalary(v.salaryFrom, v.salaryTo)}
                        </Badge>
                        {v.isRemote && (
                          <Badge variant="info" className="gap-1 text-xs">
                            <MapPin className="h-3 w-3" /> Удалённо
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed mb-4">
                  {v.description}
                </div>

                {/* Requirements */}
                {v.requirements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Требования</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {v.requirements}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {v.conditions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Условия</h4>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {v.conditions}
                    </div>
                  </div>
                )}

                {/* Apply */}
                {appliedIds.has(v.id) ? (
                  <div className="flex items-center gap-2 text-success text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Вы откликнулись на эту вакансию
                  </div>
                ) : applyingTo === v.id ? (
                  <div className="border border-border rounded-xl p-4 space-y-3">
                    <h4 className="text-sm font-semibold">Отклик на вакансию</h4>
                    {sent ? (
                      <div className="flex items-center gap-2 text-success text-sm py-4">
                        <CheckCircle2 className="h-5 w-5" />
                        Заявка отправлена! Мы свяжемся с вами.
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">ФИО</label>
                            <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Телефон</label>
                            <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Сопроводительное сообщение</label>
                          <textarea
                            value={formMessage}
                            onChange={(e) => setFormMessage(e.target.value)}
                            placeholder="Расскажите о своём опыте..."
                            className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApply(v.id)} disabled={sending || !formName.trim()}>
                            <Send className="h-4 w-4 mr-1" /> {sending ? "..." : "Отправить"}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setApplyingTo(null)}>Отмена</Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setApplyingTo(v.id)}>
                    <Send className="h-4 w-4 mr-1" /> Откликнуться
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
