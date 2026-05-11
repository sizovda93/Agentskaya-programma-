"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface AvatarQuestion {
  id: string;
  label: string;
  video: string;
  audio: string;
}

const IDLE_VIDEO = "/avatar/idle.mp4";
const FALLBACK_DURATION_MS = 20000; // safety timer if audio fails to load

const questions: AvatarQuestion[] = [
  { id: "q1", label: "Что это за платформа?",     video: "/avatar/answer-q1.mp4", audio: "/avatar/q1.mp3" },
  { id: "q2", label: "Как здесь зарабатывать?",   video: "/avatar/answer-q2.mp4", audio: "/avatar/q2.mp3" },
  { id: "q3", label: "Кто может стать партнёром?", video: "/avatar/answer-q1.mp4", audio: "/avatar/q3.mp3" },
  { id: "q4", label: "Сколько можно заработать?", video: "/avatar/answer-q2.mp4", audio: "/avatar/q4.mp3" },
  { id: "q5", label: "Что такое банкротство?",    video: "/avatar/answer-q1.mp4", audio: "/avatar/q5.mp3" },
  { id: "q6", label: "Как передать клиента?",     video: "/avatar/answer-q2.mp4", audio: "/avatar/q6.mp3" },
  { id: "q7", label: "Когда приходит выплата?",   video: "/avatar/answer-q1.mp4", audio: "/avatar/q7.mp3" },
  { id: "q8", label: "Сколько длится процедура?", video: "/avatar/answer-q2.mp4", audio: "/avatar/q8.mp3" },
];

export function AvatarHelper() {
  const [activeQuestion, setActiveQuestion] = useState<AvatarQuestion | null>(null);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
      audioRef.current = null;
    }
  }, []);

  const switchToIdle = useCallback(() => {
    setActiveQuestion(null);
    stopAudio();
    if (videoRef.current) {
      videoRef.current.src = IDLE_VIDEO;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  }, [stopAudio]);

  const handleQuestion = useCallback(
    (q: AvatarQuestion) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      stopAudio();
      setActiveQuestion(q);

      if (videoRef.current) {
        videoRef.current.loop = true;
        videoRef.current.src = q.video;
        videoRef.current.play().catch(() => {});
      }

      // Safety fallback if audio fails to load
      timerRef.current = setTimeout(switchToIdle, FALLBACK_DURATION_MS);

      if (muted) return;

      const audio = new Audio(q.audio);
      audio.preload = "auto";
      audioRef.current = audio;

      const cleanupOnEnd = () => {
        if (audioRef.current === audio) switchToIdle();
      };
      audio.addEventListener("ended", cleanupOnEnd, { once: true });
      audio.addEventListener("error", () => {
        // Keep the safety timer running; do nothing else
      });

      audio.play()
        .then(() => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        })
        .catch(() => {
          // Autoplay blocked — safety timer will eventually return to idle
        });
    },
    [muted, stopAudio, switchToIdle]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (next) stopAudio();
      return next;
    });
  }, [stopAudio]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-0 flex h-full">
        {/* Video — left, fills full height */}
        <div className="relative shrink-0 w-[320px] flex flex-col">
          <div
            className="relative overflow-hidden flex-1"
            style={{ backgroundColor: activeQuestion ? "#000" : "#45704C", minHeight: 320 }}
          >
            <video
              ref={videoRef}
              src={IDLE_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            <button
              onClick={toggleMute}
              title={muted ? "Включить звук" : "Выключить звук"}
              className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            {/* Name label overlaid at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
              <p className="text-sm font-semibold text-white">Котофей Петрович</p>
              <p className="text-[11px] text-white/80 leading-snug">Ваш помощник на платформе</p>
            </div>
          </div>
        </div>

        {/* Questions — right, fills remaining */}
        <div className="flex-1 p-4 flex flex-col">
          <p className="text-xs text-muted-foreground mb-3">Подскажу, как всё устроено и с чего начать:</p>
          <div className="flex flex-col gap-2 flex-1">
            {questions.map((q) => (
              <Button
                key={q.id}
                size="sm"
                variant="outline"
                onClick={() => handleQuestion(q)}
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
      </CardContent>
    </Card>
  );
}
