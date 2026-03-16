"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { mockConversations, mockMessages } from "@/lib/mock/data";
import { Conversation } from "@/types";

export default function AgentMessagesPage() {
  const myConversations = mockConversations.filter((c) => c.agentId === "a1");
  const [activeConv, setActiveConv] = useState<Conversation | null>(myConversations[0] ?? null);

  const messages = activeConv
    ? mockMessages.filter((m) => m.conversationId === activeConv.id)
    : [];

  return (
    <div>
      <PageHeader
        title="Сообщения"
        description="Диалоги с клиентами"
        breadcrumbs={[
          { title: "Дашборд", href: "/agent/dashboard" },
          { title: "Сообщения" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-xl border border-border overflow-hidden h-[600px]">
        {/* Conversation list */}
        <div className="border-r border-border overflow-y-auto">
          <ConversationList
            conversations={myConversations}
            activeId={activeConv?.id}
            onSelect={setActiveConv}
          />
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2">
          {activeConv ? (
            <ChatWindow
              conversation={activeConv}
              messages={messages}
              currentUserType="agent"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Выберите диалог
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
