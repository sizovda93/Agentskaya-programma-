"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { FileText, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Contract {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

export default function AgentContractPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contracts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setContracts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Агентский договор"
        description="Договор о сотрудничестве с платформой"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Агентский договор" },
        ]}
      />

      {contracts.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Договор пока не загружен</p>
          <p className="text-xs text-muted-foreground mt-1">Обратитесь к менеджеру для получения договора</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.title}</p>
                    <p className="text-xs text-muted-foreground">Загружен {formatDate(c.createdAt)}</p>
                  </div>
                </div>
                <a href={c.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" /> Скачать
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
