"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { getModules, LearningModule } from "@/lib/learning-content";
import {
  Rocket, Wallet, FileText, MessageSquare, HelpCircle,
  Target, Plug, ScrollText, BookOpen, CheckCircle2, ChevronRight,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket, Wallet, FileText, MessageSquare, HelpCircle,
  Target, Plug, ScrollText, BookOpen,
};

function getReadSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem("learning_read_agent") || "[]"));
  } catch { return new Set(); }
}

export default function AgentLearningPage() {
  const modules = getModules("agent");
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());

  useEffect(() => { setReadSlugs(getReadSlugs()); }, []);

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (s, m) => s + m.lessons.filter((l) => readSlugs.has(l.slug)).length, 0
  );

  return (
    <>
      <PageHeader
        title="Обучение"
        description="Руководства и инструкции по работе с платформой"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Обучение" },
        ]}
      />

      {/* Progress */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Ваш прогресс</span>
          <span className="text-sm text-muted-foreground">
            {completedLessons} из {totalLessons} уроков
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: totalLessons ? `${(completedLessons / totalLessons) * 100}%` : "0%" }}
          />
        </div>
      </Card>

      {/* Modules */}
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((mod) => {
          const Icon = iconMap[mod.icon] ?? BookOpen;
          const done = mod.lessons.filter((l) => readSlugs.has(l.slug)).length;
          const all = mod.lessons.length;
          const allDone = done === all;

          return (
            <Card key={mod.id} className="p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${allDone ? "bg-green-500/10" : "bg-primary/10"}`}>
                  {allDone ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Icon className="h-5 w-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm">{mod.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>

                  <div className="mt-3 space-y-1">
                    {mod.lessons.map((lesson) => {
                      const isRead = readSlugs.has(lesson.slug);
                      return (
                        <Link
                          key={lesson.slug}
                          href={`/agent/learning/${lesson.slug}`}
                          className="flex items-center gap-2 text-sm py-1.5 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors group"
                        >
                          {isRead ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                          ) : (
                            <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                          )}
                          <span className={isRead ? "text-muted-foreground" : ""}>{lesson.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{lesson.duration}</span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
