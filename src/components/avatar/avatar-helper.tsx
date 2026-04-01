"use client";

import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";

interface AvatarQuestion {
  id: string;
  label: string;
  video: string;
  answerText: string;
}

const IDLE_VIDEO = "/avatar/idle.mp4";
const ELEVENLABS_VOICE_ID = "yl2ZDV1MzN4HbQJbMihG";

const questions: AvatarQuestion[] = [
  {
    id: "q1",
    label: "Что это за платформа?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Это партнёрская платформа, где вы можете передавать клиентов, следить за их статусами и зарабатывать через партнёрскую программу",
  },
  {
    id: "q2",
    label: "Как здесь зарабатывать?",
    video: "/avatar/answer-q2.mp4",
    answerText:
      "Вы передаёте клиентов в платформу, команда берёт их в работу, а вы получаете вознаграждение по результату",
  },
  {
    id: "q3",
    label: "Кто может стать партнёром?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Партнёром может стать любой совершеннолетний гражданин России. Юридическое образование не требуется. Главное — желание помогать людям решить проблему с долгами и готовность рекомендовать нашу компанию.",
  },
  {
    id: "q4",
    label: "Сколько можно заработать?",
    video: "/avatar/answer-q2.mp4",
    answerText:
      "Вознаграждение составляет от 10 до 25 тысяч рублей за каждого клиента, заключившего договор. Чем больше клиентов вы приводите, тем выше ваш уровень и размер комиссии. Верхнего предела заработка нет.",
  },
  {
    id: "q5",
    label: "Что такое банкротство?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Банкротство физических лиц — это законная процедура списания долгов по федеральному закону 127. Если у человека долги от 300 тысяч рублей и он не может их выплачивать, суд может полностью освободить его от обязательств перед кредиторами.",
  },
  {
    id: "q6",
    label: "Как передать клиента?",
    video: "/avatar/answer-q2.mp4",
    answerText:
      "Зайдите в раздел Лиды, нажмите Передать клиента, укажите имя и телефон человека. Это занимает одну минуту. Дальше менеджер свяжется с клиентом, проведёт консультацию и возьмёт дело в работу. Вы будете видеть статус в личном кабинете.",
  },
  {
    id: "q7",
    label: "Когда приходит выплата?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Выплата начисляется после того, как клиент заключает договор и вносит первый платёж. Обычно это происходит в течение одной-двух недель после передачи контакта. Все начисления вы видите в разделе Финансы в личном кабинете.",
  },
];

type AvatarState = "idle" | "loading" | "answering";

async function fetchTTS(text: string): Promise<Blob | null> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok) return null;
  return res.blob();
}

export function AvatarHelper() {
  const [state, setState] = useState<AvatarState>("idle");
  const [muted, setMuted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<AvatarQuestion | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const switchToIdle = useCallback(() => {
    setState("idle");
    setActiveQuestion(null);

    if (videoRef.current) {
      videoRef.current.src = IDLE_VIDEO;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const handleQuestion = useCallback(
    async (q: AvatarQuestion) => {
      if (state === "loading" || state === "answering") return;

      setState("loading");
      setActiveQuestion(q);

      // Fetch TTS first, THEN start video + audio together
      try {
        const audioBlob = await fetchTTS(q.answerText);

        if (videoRef.current) {
          videoRef.current.loop = true;
          videoRef.current.src = q.video;
          videoRef.current.play().catch(() => {});
        }

        if (!audioBlob || audioBlob.size === 0) {
          setState("answering");
          setTimeout(switchToIdle, 5000);
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audio.muted = muted;
        audioRef.current = audio;

        setState("answering");
        await audio.play();

        audio.addEventListener("ended", switchToIdle, { once: true });
      } catch (err) {
        console.error("TTS error:", err);
        switchToIdle();
      }
    },
    [state, muted, switchToIdle]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  return (
    <div className="flex items-start gap-4">
      {/* Video card — left */}
      <Card className="overflow-hidden rounded-2xl shrink-0" style={{ width: 180 }}>
        <CardContent className="p-0">
          <div
            className="relative overflow-hidden"
            style={{ height: 170, backgroundColor: state === "answering" ? "#000" : "#45704C", borderRadius: "1rem" }}
          >
            <video
              ref={videoRef}
              src={IDLE_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto block absolute left-0"
              style={{ top: "-45%" }}
            />

            <button
              onClick={toggleMute}
              className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </button>

            {state === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="px-3 py-2">
            <p className="text-sm font-semibold">Котофей Петрович</p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Ваш помощник на платформе
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Questions — right */}
      <div className="pt-2 space-y-3">
        <p className="text-xs text-muted-foreground">Подскажу, как всё устроено и с чего начать:</p>
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <Button
              key={q.id}
              size="sm"
              variant="outline"
              onClick={() => handleQuestion(q)}
              disabled={state === "loading"}
              className={`text-xs h-8 px-3 justify-start ${
                activeQuestion?.id === q.id
                  ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                  : "border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              }`}
            >
              {q.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
