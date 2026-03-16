"use client";

import { use } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChatWindow } from "@/components/chat/chat-window";
import { mockConversations, mockMessages } from "@/lib/mock/data";

export default function ManagerConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const conversation = mockConversations.find((c) => c.id === id);

  if (!conversation) {
    return (
      <div>
        <PageHeader title="Диалог не найден" breadcrumbs={[{ title: "Диалоги", href: "/manager/conversations" }, { title: "Не найден" }]} />
      </div>
    );
  }

  const messages = mockMessages.filter((m) => m.conversationId === conversation.id);

  return (
    <div>
      <PageHeader
        title={`Диалог: ${conversation.clientName}`}
        breadcrumbs={[
          { title: "Дашборд", href: "/manager/dashboard" },
          { title: "Диалоги", href: "/manager/conversations" },
          { title: conversation.clientName },
        ]}
      />
      <div className="rounded-xl border border-border overflow-hidden h-[600px]">
        <ChatWindow
          conversation={conversation}
          messages={messages}
          currentUserType="manager"
        />
      </div>
    </div>
  );
}
