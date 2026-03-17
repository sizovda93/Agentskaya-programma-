"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ChatWindow } from "@/components/chat/chat-window";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { Conversation, Message } from "@/types";

export default function ManagerConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/conversations/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          const { messages: msgs, ...conv } = data;
          setConversation(conv);
          setMessages(msgs || []);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSkeleton />;

  if (!conversation) {
    return (
      <div>
        <PageHeader title="Диалог не найден" breadcrumbs={[{ title: "Диалоги", href: "/manager/conversations" }, { title: "Не найден" }]} />
      </div>
    );
  }

  const handleSend = async (text: string) => {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    }
  };

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
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
