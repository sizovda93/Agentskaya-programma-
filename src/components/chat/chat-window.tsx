"use client";

import { Message, Conversation } from "@/types";
import { MessageBubble } from "./message-bubble";
import { MessageInput } from "./message-input";
import { ModeBadge, ConversationStatusBadge } from "@/components/dashboard/status-badges";

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  currentUserType?: string;
}

export function ChatWindow({ conversation, messages, currentUserType = "agent" }: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-medium">{conversation.clientName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <ModeBadge mode={conversation.mode} />
            <ConversationStatusBadge status={conversation.status} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderType === currentUserType}
          />
        ))}
      </div>

      {/* Input */}
      <MessageInput onSend={() => {}} />
    </div>
  );
}
