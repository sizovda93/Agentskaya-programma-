"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ConversationList } from "@/components/chat/conversation-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { Conversation, Message } from "@/types";
import { CardSkeleton } from "@/components/dashboard/loading-skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function AgentMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadConversations = useCallback(() => {
    return fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        const convs = Array.isArray(data) ? data : [];
        setConversations(convs);
        return convs;
      })
      .catch(() => []);
  }, []);

  useEffect(() => {
    loadConversations()
      .then((convs) => {
        if (convs.length > 0) setActiveConv(convs[0]);
      })
      .finally(() => setLoading(false));
  }, [loadConversations]);

  const loadMessages = useCallback((convId: string) => {
    fetch(`/api/conversations/${convId}`)
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data.messages) ? data.messages : []))
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
  }, [activeConv, loadMessages]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    if (!activeConv) return;
    const timer = setInterval(() => loadMessages(activeConv.id), 5000);
    return () => clearInterval(timer);
  }, [activeConv, loadMessages]);

  // Auto-refresh conversation list every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadConversations();
    }, 15000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  const handleSend = async (text: string) => {
    if (!activeConv) return;
    const res = await fetch(`/api/conversations/${activeConv.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      loadMessages(activeConv.id);
      loadConversations();
    }
  };

  const handleStartChat = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Не удалось создать диалог");
        return;
      }

      const convs = await loadConversations();
      const created = convs.find((c: Conversation) => c.id === data.id) || data;
      setActiveConv(created);
    } catch {
      alert("Ошибка соединения");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <CardSkeleton />;

  return (
    <div>
      <PageHeader
        title="Сообщения"
        description="Диалог с менеджером"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Сообщения" },
        ]}
      />

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Нет активных диалогов</p>
          <Button onClick={handleStartChat} disabled={creating}>
            {creating ? "Создание..." : "Написать менеджеру"}
            {!creating && <MessageSquarePlus className="h-4 w-4" />}
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden" style={{ height: "calc(100dvh - 200px)" }}>
          {/* Desktop: list + chat side by side */}
          <div className="hidden lg:grid lg:grid-cols-[240px_1fr] h-full">
            <div className="border-r border-border overflow-y-auto">
              <ConversationList
                conversations={conversations}
                activeId={activeConv?.id}
                onSelect={setActiveConv}
                currentUserType="agent"
              />
            </div>
            <div>
              {activeConv ? (
                <ChatWindow
                  conversation={activeConv}
                  messages={messages}
                  currentUserType="agent"
                  onSend={handleSend}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Выберите диалог
                </div>
              )}
            </div>
          </div>

          {/* Mobile: full-screen chat (skip list since agent usually has 1 conversation) */}
          <div className="lg:hidden h-full">
            {activeConv ? (
              <ChatWindow
                conversation={activeConv}
                messages={messages}
                currentUserType="agent"
                onSend={handleSend}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Нет диалогов
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
