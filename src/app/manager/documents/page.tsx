"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DocumentTable } from "@/components/documents/document-table";
import { UploadZone } from "@/components/documents/upload-zone";
import { SearchInput } from "@/components/dashboard/search-input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockDocuments } from "@/lib/mock/data";

export default function ManagerDocumentsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockDocuments.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Документы"
        description="Все документы системы"
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Документы" },
        ]}
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск документа..." />
      </div>
      <div className="mb-6">
        <DocumentTable documents={filtered} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Загрузка</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadZone />
        </CardContent>
      </Card>
    </div>
  );
}
