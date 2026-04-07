"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { FileText, Download, Eye, X } from "lucide-react";
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
  const [viewUrl, setViewUrl] = useState<string | null>(null);

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
        title="Партнёрское соглашение"
        description="Договор о сотрудничестве с платформой"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Партнёрское соглашение" },
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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewUrl(c.fileUrl)}>
                    <Eye className="h-4 w-4 mr-1" /> Читать
                  </Button>
                  <a href={c.fileUrl} download>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" /> Скачать
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PDF viewer modal */}
      {viewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setViewUrl(null)}>
          <div
            className="bg-card border border-border rounded-xl w-full max-w-4xl mx-4 overflow-hidden relative"
            style={{ height: "90vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold">Партнёрское соглашение</span>
              <button onClick={() => setViewUrl(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              src={viewUrl}
              className="w-full"
              style={{ height: "calc(90vh - 49px)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
