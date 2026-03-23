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

const IDLE_VIDEO = "/avatar/answer-q1.mp4";

const questions: AvatarQuestion[] = [
  {
    id: "q1",
    label: "Что это за платформа?",
    video: "/avatar/idle.mp4",
    answerText:
      "Это партнёрская платформа, через которую вы можете передавать лидов по банкротству физических лиц, следить за их статусами, получать материалы для продвижения, общаться с менеджером и видеть свои начисления. Простыми словами: здесь всё, что нужно партнёру для работы и заработка, собрано в одном месте.",
  },
];

type AvatarState = "idle" | "loading" | "answering";

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

      // Start TTS fetch and video switch in parallel
      const ttsPromise = fetch("/api/avatar/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q.answerText }),
      })
        .then((r) => (r.ok ? r.blob() : null))
        .catch(() => null);

      // Switch to answer video
      if (videoRef.current) {
        videoRef.current.loop = false;
        videoRef.current.src = q.video;
        videoRef.current.play().catch(() => {});
      }

      setState("answering");

      // Play audio when ready
      const audioBlob = await ttsPromise;
      if (audioBlob && audioBlob.size > 0) {
        const url = URL.createObjectURL(audioBlob);
        audioUrlRef.current = url;
        const audio = new Audio(url);
        audio.muted = muted;
        audioRef.current = audio;
        try {
          await audio.play();
        } catch (err) {
          console.warn("Audio play failed:", err);
        }
      } else {
        console.warn("TTS returned no audio");
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
    <Card className="overflow-hidden border-0 bg-transparent shadow-none">
      <CardContent className="p-0">
        {/* Video — multiply blend hides checkerboard on dark bg */}
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <video
            ref={videoRef}
            src={IDLE_VIDEO}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
            style={{ mixBlendMode: "screen" }}
            onEnded={handleVideoEnded}
          />

          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/70 flex items-center justify-center text-foreground hover:bg-background transition-colors z-10"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          {/* Loading indicator */}
          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="pt-2 pb-1">
          <p className="text-xs text-muted-foreground mb-2">Задайте вопрос помощнику:</p>
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
