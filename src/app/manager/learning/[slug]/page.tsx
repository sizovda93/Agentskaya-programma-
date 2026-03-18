"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLesson, getAllLessons } from "@/lib/learning-content";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";

const STORAGE_KEY = "learning_read_manager";

function getReadSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
  catch { return new Set(); }
}

function markRead(slug: string) {
  const set = getReadSlugs();
  set.add(slug);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function renderBody(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.trim() === "") return <br key={i} />;
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, '<code class="text-xs bg-muted px-1.5 py-0.5 rounded">$1</code>');
    if (line.trim().startsWith("•")) {
      return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: formatted.replace("•", "").trim() }} />;
    }
    const numMatch = line.trim().match(/^(\d+)\.\s/);
    if (numMatch) {
      return <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: formatted.replace(/^\d+\.\s/, "").trim() }} />;
    }
    return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
  });
}

export default function ManagerLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const result = getLesson("manager", slug);
  const allLessons = getAllLessons("manager");
  const [isRead, setIsRead] = useState(false);

  useEffect(() => { setIsRead(getReadSlugs().has(slug)); }, [slug]);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground mb-4">Урок не найден</p>
        <Button variant="outline" onClick={() => router.push("/manager/learning")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> К списку
        </Button>
      </div>
    );
  }

  const { module: mod, lesson } = result;
  const currentIndex = allLessons.findIndex((l) => l.lesson.slug === slug);
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handleMarkRead = () => {
    markRead(slug);
    setIsRead(true);
    if (next) router.push(`/manager/learning/${next.lesson.slug}`);
  };

  return (
    <>
      <PageHeader
        title={lesson.title}
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Обучение", href: "/manager/learning" },
          { title: mod.title },
        ]}
      />

      <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {lesson.duration}</span>
        {isRead && <span className="flex items-center gap-1 text-green-500"><CheckCircle2 className="h-3.5 w-3.5" /> Прочитано</span>}
      </div>

      <Card className="p-6 md:p-8 mb-6">
        <div className="space-y-8">
          {lesson.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-3">{section.heading}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                {renderBody(section.body)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {prev && (
            <Link href={`/manager/learning/${prev.lesson.slug}`}>
              <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4 mr-1" /> {prev.lesson.title}</Button>
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isRead && (
            <Button size="sm" onClick={handleMarkRead}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> {next ? "Прочитано — далее" : "Прочитано"}
            </Button>
          )}
          {isRead && next && (
            <Link href={`/manager/learning/${next.lesson.slug}`}>
              <Button size="sm">Далее <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
