import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const RECORD_MS = 3000;

export function ShoutDone({
  onDone,
}: {
  onDone: (voiceUrl: string | undefined) => void;
}) {
  const { t } = useI18n();
  const [recording, setRecording] = useState(false);
  const [count, setCount] = useState(3);
  const [error, setError] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    timerRef.current = null;
    tickRef.current = null;
  };

  useEffect(() => cleanup, []);

  const stop = () => {
    cleanup();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  const start = async () => {
    if (recording) return;
    setError(false);
    setCount(3);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
        onDone(blob.size > 0 ? URL.createObjectURL(blob) : undefined);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      tickRef.current = setInterval(
        () => setCount((c) => (c > 1 ? c - 1 : 1)),
        1000,
      );
      timerRef.current = setTimeout(stop, RECORD_MS);
    } catch {
      setRecording(false);
      setError(true);
      // Offline / no-mic families can still tick the chore off.
      onDone(undefined);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <button
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        className={`w-full rounded-3xl py-6 text-base font-extrabold text-on-secondary-container shadow-lg transition-transform active:scale-[0.97] ${
          recording
            ? "animate-pulse bg-secondary text-secondary-foreground"
            : "bg-secondary-container"
        }`}
        style={{ touchAction: "none" }}
      >
        {recording ? t("shout_recording", { n: count }) : t("shout_hold_button")}
      </button>
      {error && (
        <p className="text-center text-[11px] font-bold text-muted-foreground">
          {t("shout_mic_error")}
        </p>
      )}
    </div>
  );
}
