import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth-server';

const BASE_URL = process.env.OPENAI_BASE_URL || 'https://aspbllm.online/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';
const MODELS = ['gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro-preview', 'claude-sonnet-4-5-20250929'];

const SYSTEM_PROMPT = `Ты — юридический помощник на партнёрской платформе по банкротству физических лиц (БФЛ).

Твоя задача — давать развёрнутые, подробные и понятные юридические консультации партнёрам платформы.

Правила:
- Отвечай на русском языке
- Отвечай подробно и развёрнуто. Объясняй процессы пошагово, приводи примеры, раскрывай нюансы. Партнёры — не юристы, им важно понимать суть, а не просто получить короткую справку
- Ссылайся на конкретные статьи законов (127-ФЗ о банкротстве, ГК РФ, ГПК РФ и др.) и кратко поясняй, что они означают простым языком
- Структурируй длинные ответы: используй нумерацию (1, 2, 3...) и абзацы для удобного чтения
- Если вопрос выходит за рамки БФЛ — дай общий ответ, но предупреди что это не твоя основная специализация
- Не давай советов, которые могут навредить — при сложных вопросах рекомендуй обратиться к юристу платформы
- Не выдумывай статьи и нормы — если не уверен, скажи честно
- Никогда не используй символы * в ответах. Не используй markdown-разметку. Пиши простым текстом без форматирования`;

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    if (!API_KEY) {
      return Response.json({ error: 'AI not configured' }, { status: 500 });
    }

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Messages required' }, { status: 400 });
    }

    // Keep last 10 messages for context
    const trimmed = messages.slice(-10);
    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimmed,
    ];

    // Try models with fallback
    for (const model of MODELS) {
      try {
        const res = await fetch(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: fullMessages,
            stream: true,
            max_tokens: 4000,
          }),
        });

        if (!res.ok) {
          console.error(`Model ${model} failed: ${res.status}`);
          continue;
        }

        // Stream response through
        return new Response(res.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (err) {
        console.error(`Model ${model} error:`, err);
        continue;
      }
    }

    return Response.json({ error: 'All models failed' }, { status: 502 });
  } catch (err) {
    console.error('POST /api/chat error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
