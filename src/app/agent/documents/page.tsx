"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { DocumentTable } from "@/components/documents/document-table";
import { UploadZone } from "@/components/documents/upload-zone";
import { SearchInput } from "@/components/dashboard/search-input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { mockDocuments } from "@/lib/mock/data";

export default function AgentDocumentsPage() {
  const [search, setSearch] = useState("");
  const myDocs = mockDocuments.filter((d) => d.ownerId === "a1");
  const filtered = myDocs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Документы"
        description="Ваши договоры, акты и другие документы"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Документы" },
        ]}
      />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Поиск документа..."
        />
      </div>

      <div className="mb-6">
        <DocumentTable documents={filtered} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Загрузка документов</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadZone />
        </CardContent>
      </Card>
    </div>
  );
}
