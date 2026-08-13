"use client";

import { useCallback, useRef, useState } from "react";

function pickMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export function isRecordingSupported() {
  return (
    typeof window !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined" &&
    Boolean(pickMimeType())
  );
}

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef("audio/webm");
  const resolveStopRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      cleanupStream();
      setRecording(false);
      return Promise.resolve(null);
    }

    return new Promise<Blob | null>((resolve) => {
      resolveStopRef.current = resolve;
      recorder.stop();
    });
  }, [cleanupStream]);

  const start = useCallback(async () => {
    const mimeType = pickMimeType();
    if (!mimeType) {
      throw new Error("このブラウザは録音に対応していません。");
    }

    await stop();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    mimeTypeRef.current = mimeType.split(";")[0] || "audio/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob =
        chunksRef.current.length > 0
          ? new Blob(chunksRef.current, { type: mimeTypeRef.current })
          : null;
      cleanupStream();
      mediaRecorderRef.current = null;
      setRecording(false);
      resolveStopRef.current?.(blob);
      resolveStopRef.current = null;
    };

    recorder.start(1000);
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }, [cleanupStream, stop]);

  return { recording, start, stop };
}
