"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AvatarQuestion {
  id: string;
  label: string;
  video: string;
  answerText: string;
}

const IDLE_VIDEO = "/avatar/idle.mp4";
const ANSWER_DURATION_MS = 7000;

const questions: AvatarQuestion[] = [
  {
    id: "q1",
    label: "Что это за платформа?",
    video: "/avatar/answer-q1.mp4",
    answerText:
      "Это партнёрская платформа, где вы можете передавать клиентов, следить за их статусами и зарабатывать через партнёрскую программу.",
  },
  {
    id: "q2",
    label: "Как здесь зарабатывать?",
    video: "/avatar/answer-q2.mp4",
    answerText:
      "Вы передаёте клиентов в платформу, команда берёт их в работу, а вы получаете вознаграждение по результату.",
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
  {
    id: "q8",
    label: "Сколько длится процедура?",
    video: "/avatar/answer-q2.mp4",
    answerText:
      "Процедура банкротства обычно занимает от шести до двенадцати месяцев. Всё зависит от сложности дела, количества кредиторов и региона. В среднем — восемь месяцев. При этом вы получаете вознаграждение сразу после того, как клиент заключил договор, а не в конце процедуры.",
  },
];

export function AvatarHelper() {
  const [activeQuestion, setActiveQuestion] = useState<AvatarQuestion | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const switchToIdle = useCallback(() => {
    setActiveQuestion(null);
    if (videoRef.current) {
      videoRef.current.src = IDLE_VIDEO;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleQuestion = useCallback(
    (q: AvatarQuestion) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setActiveQuestion(q);
      if (videoRef.current) {
        videoRef.current.loop = true;
        videoRef.current.src = q.video;
        videoRef.current.play().catch(() => {});
      }
      timerRef.current = setTimeout(switchToIdle, ANSWER_DURATION_MS);
    },
    [switchToIdle]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
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

            {/* Answer caption overlaid at bottom when active */}
            {activeQuestion && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-3 pt-6 pb-3">
                <p className="text-[11px] leading-snug text-white">{activeQuestion.answerText}</p>
              </div>
            )}

            {/* Name label overlaid at bottom when idle */}
            {!activeQuestion && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
                <p className="text-sm font-semibold text-white">Котофей Петрович</p>
                <p className="text-[11px] text-white/80 leading-snug">Ваш помощник на платформе</p>
              </div>
            )}
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
