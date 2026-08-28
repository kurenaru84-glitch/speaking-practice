"use client";

import { useCallback, useRef } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isLivePreviewSupported() {
  return Boolean(getSpeechRecognition());
}

/** Minimum chars to treat browser speech preview as instant transcript (skip blocking API wait). */
export const INSTANT_TRANSCRIPT_MIN_CHARS = 10;

/** 録音中のブラウザ音声認識。停止時のスナップショットを即時文字起こしに使う。 */
export function useLivePreview() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef("");
  const latestTextRef = useRef("");
  const activeRef = useRef(false);

  const stop = useCallback((): string => {
    activeRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    const snapshot = latestTextRef.current.trim();
    finalTextRef.current = "";
    latestTextRef.current = "";
    return snapshot;
  }, []);

  const start = useCallback((lang: string, onUpdate: (text: string) => void) => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return false;

    stop();
    activeRef.current = true;
    finalTextRef.current = "";
    latestTextRef.current = "";

    const begin = () => {
      if (!activeRef.current) return;

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const piece = result[0].transcript;
          if (result.isFinal) {
            finalTextRef.current = `${finalTextRef.current} ${piece}`.trim();
          } else {
            interim += piece;
          }
        }
        const combined = `${finalTextRef.current} ${interim}`.trim();
        latestTextRef.current = combined;
        onUpdate(combined);
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted" || event.error === "no-speech") return;
      };

      recognition.onend = () => {
        if (activeRef.current) {
          window.setTimeout(begin, 250);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    };

    begin();
    return true;
  }, [stop]);

  return { start, stop };
}
