"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Ошибка сервера. Попробуйте позже." }]);
        setLoading(false);
        return;
      }

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let buffer = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantText += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantText };
                return updated;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Не удалось получить ответ. Проверьте подключение." }]);
    }

    setLoading(false);
  }, [input, loading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">Задайте юридический вопрос</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Специализация: банкротство физических лиц</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? "..." : "")}
            </div>
            {msg.role === "user" && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted rounded-xl px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Введите вопрос..."
          disabled={loading}
          className="text-sm"
        />
        <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
        {messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMessages([])}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
