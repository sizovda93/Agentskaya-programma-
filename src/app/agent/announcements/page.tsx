"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/dashboard/loading-skeleton";
import { formatDate, getInitials } from "@/lib/utils";
import { Newspaper, Gift, Bell, MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  type: "news" | "giveaway" | "update";
  content: string;
  imageUrl: string | null;
  authorName: string | null;
  commentCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  userName: string;
  userRole: string;
  text: string;
  createdAt: string;
}

interface ReactionData {
  counts: { emoji: string; count: number }[];
  myReactions: string[];
}

const typeConfig: Record<string, { label: string; icon: typeof Newspaper; color: string }> = {
  news: { label: "Новость", icon: Newspaper, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  giveaway: { label: "Розыгрыш", icon: Gift, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  update: { label: "Обновление", icon: Bell, color: "bg-green-500/10 text-green-600 border-green-500/20" },
};

const EMOJIS = ["👍", "❤️", "🔥", "👏", "😊", "💪"];

function AnnouncementCard({ item }: { item: Announcement }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState<ReactionData>({ counts: [], myReactions: [] });

  const cfg = typeConfig[item.type] || typeConfig.news;
  const Icon = cfg.icon;
  const isLong = item.content.length > 300;

  const loadComments = useCallback(() => {
    fetch(`/api/announcements/${item.id}/comments`)
      .then((r) => r.ok ? r.json() : [])
      .then(setComments)
      .catch(() => {});
  }, [item.id]);

  const loadReactions = useCallback(() => {
    fetch(`/api/announcements/${item.id}/reactions`)
      .then((r) => r.ok ? r.json() : { counts: [], myReactions: [] })
      .then(setReactions)
      .catch(() => {});
  }, [item.id]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments, loadComments]);

  const toggleReaction = async (emoji: string) => {
    await fetch(`/api/announcements/${item.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    });
    loadReactions();
  };

  const sendComment = async () => {
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/announcements/${item.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        loadComments();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-xl ${cfg.color.split(" ")[0]} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${cfg.color.split(" ")[1]}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
              {item.authorName && <span className="text-xs text-muted-foreground">{item.authorName}</span>}
              <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
            </div>
            <h3 className="text-sm font-semibold mb-2">{item.title}</h3>

            {/* Image */}
            {item.imageUrl && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img src={item.imageUrl} alt="" className="w-full max-h-80 object-cover" />
              </div>
            )}

            {/* Content */}
            <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {isLong && !expanded ? item.content.slice(0, 300) + "..." : item.content}
            </div>
            {isLong && (
              <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline mt-2">
                {expanded ? "Свернуть" : "Читать полностью"}
              </button>
            )}
          </div>
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-1.5 mt-4 flex-wrap">
          {EMOJIS.map((emoji) => {
            const count = reactions.counts.find((c) => c.emoji === emoji)?.count || 0;
            const isActive = reactions.myReactions.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors border",
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
                )}
              >
                <span>{emoji}</span>
                {count > 0 && <span>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Comments toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>Комментарии {item.commentCount > 0 ? `(${item.commentCount})` : ""}</span>
          {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {/* Comments section */}
        {showComments && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            {comments.length === 0 && (
              <p className="text-xs text-muted-foreground">Пока нет комментариев</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px] bg-muted">{getInitials(c.userName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{c.userName}</span>
                    {c.userRole !== "agent" && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {c.userRole === "admin" ? "Админ" : "Менеджер"}
                      </Badge>
                    )}
                    <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}

            {/* New comment input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Написать комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendComment()}
              />
              <Button size="icon" variant="ghost" onClick={sendComment} disabled={sending || !commentText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader
        title="Объявления"
        description="Новости и обращения от руководства"
        breadcrumbs={[
          { title: "О платформе", href: "/agent/dashboard" },
          { title: "Объявления" },
        ]}
      />

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Пока нет объявлений</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
