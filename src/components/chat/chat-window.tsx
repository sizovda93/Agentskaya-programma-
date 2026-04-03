"use client";

import { useEffect, useRef } from "react";
import { Message, Conversation } from "@/types";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { ModeBadge, ConversationStatusBadge, ChannelBadge } from "@/components/dashboard/status-badges";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserType?: string;
  onSend?: (text: string) => void;
  showClassification?: boolean;
  onInputRef?: (ref: { insert: (text: string) => void }) => void;
}

export function ChatWindow({ conversation, messages, currentUserType = "agent", onSend, showClassification, onInputRef }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-3 shrink-0">
        <h3 className="font-medium text-sm">
          {currentUserType === "agent"
            ? (conversation.managerName || "Менеджер")
            : (conversation.agentName || conversation.clientName || "Партнёр")}
        </h3>
        <div className="flex items-center gap-2">
          <ModeBadge mode={conversation.mode} />
          <ConversationStatusBadge status={conversation.status} />
          {conversation.channel && conversation.channel !== "web" && (
            <ChannelBadge channel={conversation.channel} />
          )}
        </div>
      </div>

      {/* Messages — scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderType === currentUserType}
            showClassification={showClassification}
          />
        ))}
      </div>

      {/* Input — always visible at bottom */}
      <div className="shrink-0">
        <MessageInput onSend={onSend ?? (() => {})} onInputRef={onInputRef} />
      </div>
    </div>
  );
}
