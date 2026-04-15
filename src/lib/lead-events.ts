import { TimelineEvent } from "@/types";

const EVENT_TITLES: Record<string, string> = {
  created: "Лид создан",
  status_changed: "Смена статуса",
  agent_assigned: "Назначен партнёр",
  agent_reassigned: "Переназначен партнёр",
  ownership_assigned: "Партнёр закреплён",
  ownership_confirmed: "Закрепление подтверждено",
  ownership_overridden: "Ownership передан другому партнёру",
  duplicate_detected: "Обнаружен возможный дубль",
  conflict_resolved: "Конфликт решён",
  payout_created: "Создана выплата",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  contacted: "Контакт",
  qualified: "Квалифицирован",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Договор заключён",
  lost: "Потерян",
};

const EVENT_TYPE: Record<string, TimelineEvent["type"]> = {
  status_changed: "status_change",
  agent_assigned: "assignment",
  agent_reassigned: "assignment",
  ownership_assigned: "assignment",
  ownership_confirmed: "assignment",
  ownership_overridden: "assignment",
  payout_created: "payment",
  duplicate_detected: "note",
  conflict_resolved: "note",
  created: "note",
};

const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

function formatDescription(eventType: string, details?: string): string | undefined {
  if (!details) return undefined;
  if (eventType === "agent_assigned" || eventType === "agent_reassigned") {
    return details.replace(UUID_RE, "").replace(/\s+/g, " ").trim() || undefined;
  }
  if (eventType === "ownership_assigned") {
    return undefined;
  }
  if (eventType === "status_changed") {
    const m = details.match(/^(\w+)\s*→\s*(\w+)$/);
    if (m) return `${STATUS_LABELS[m[1]] || m[1]} → ${STATUS_LABELS[m[2]] || m[2]}`;
    return details;
  }
  if (eventType === "duplicate_detected") {
    if (details.includes("email")) return "Совпадение с другим лидом по e-mail";
    if (details.includes("phone")) return "Совпадение с другим лидом по телефону";
    return "Совпадение с другим лидом в системе";
  }
  if (eventType === "conflict_resolved" || eventType === "ownership_confirmed" || eventType === "ownership_overridden") {
    return details.replace(UUID_RE, "").replace(/\s+/g, " ").trim() || undefined;
  }
  return details;
}

interface RawEvent {
  id: string;
  eventType?: string;
  event_type?: string;
  details?: string;
  createdAt?: string;
  created_at?: string;
}

export function mapLeadEvent(e: RawEvent): TimelineEvent {
  const eventType = e.eventType || e.event_type || "";
  return {
    id: e.id,
    title: EVENT_TITLES[eventType] || eventType.replace(/_/g, " ") || "Событие",
    description: formatDescription(eventType, e.details),
    date: (e.createdAt || e.created_at) as string,
    type: EVENT_TYPE[eventType] || "note",
  };
}
