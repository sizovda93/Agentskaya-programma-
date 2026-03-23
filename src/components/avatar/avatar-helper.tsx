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

const ELEVENLABS_VOICE_ID = "txnCCHHGKmYIwrn7HfHQ";

const questions: AvatarQuestion[] = [
  {
    id: "q1",
    label: "Что это за платформа?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Это партнёрская платформа, через которую вы можете передавать лидов по банкротству физических лиц, следить за их статусами, получать материалы для продвижения, общаться с менеджером и видеть свои начисления. Простыми словами: здесь всё, что нужно партнёру для работы и заработка, собрано в одном месте.",
  },
];

type AvatarState = "idle" | "loading" | "answering";

async function fetchTTS(text: string): Promise<Blob | null> {
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("NEXT_PUBLIC_ELEVENLABS_API_KEY not set");
    return null;
  }

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

  if (!res.ok) {
    console.error("ElevenLabs error:", res.status);
    return null;
  }

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

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.src = IDLE_VIDEO;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleQuestion = useCallback(
    async (q: AvatarQuestion) => {
      if (state === "loading" || state === "answering") return;

      setState("loading");
      setActiveQuestion(q);

      // Switch to answer video immediately
      if (videoRef.current) {
        videoRef.current.loop = false;
        videoRef.current.src = q.video;
        videoRef.current.play().catch(() => {});
      }

      setState("answering");

      // Fetch TTS audio directly from ElevenLabs (client-side)
      try {
        const audioBlob = await fetchTTS(q.answerText);
        if (audioBlob && audioBlob.size > 0) {
          const url = URL.createObjectURL(audioBlob);
          audioUrlRef.current = url;
          const audio = new Audio(url);
          audio.muted = muted;
          audioRef.current = audio;
          await audio.play();
        }
      } catch (err) {
        console.error("TTS error:", err);
      }
    },
    [state, muted]
  );

  const handleVideoEnded = useCallback(() => {
    if (audioRef.current && !audioRef.current.ended) {
      audioRef.current.addEventListener("ended", switchToIdle, { once: true });
    } else {
      switchToIdle();
    }
  }, [switchToIdle]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }, []);

  return (
    <Card className="overflow-hidden rounded-2xl max-w-xs">
      <CardContent className="p-0">
        <div className="relative">
          <video
            ref={videoRef}
            src={IDLE_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto block"
            onEnded={handleVideoEnded}
          />

          <button
            onClick={toggleMute}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-muted-foreground mb-2">Задайте вопрос:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q) => (
              <Button
                key={q.id}
                size="sm"
                variant={activeQuestion?.id === q.id ? "default" : "outline"}
                onClick={() => handleQuestion(q)}
                disabled={state === "loading"}
                className="text-xs"
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
