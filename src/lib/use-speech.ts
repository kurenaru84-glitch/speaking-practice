"use client";

import { useCallback, useEffect, useState } from "react";

type SpeechListener = (speakingId: string | null) => void;

const listeners = new Set<SpeechListener>();

function notifySpeakingId(id: string | null) {
  listeners.forEach((listener) => listener(id));
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech() {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
  notifySpeakingId(null);
}

export function speakText(text: string, languageId: string, speakId: string): boolean {
  if (!isSpeechSynthesisSupported()) return false;

  const trimmed = text.trim();
  if (!trimmed) return false;

  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = languageId;
  utterance.rate = 0.92;

  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find((item) => item.lang.startsWith(languageId.split("-")[0] ?? languageId));
  if (voice) utterance.voice = voice;

  utterance.onend = () => notifySpeakingId(null);
  utterance.onerror = () => notifySpeakingId(null);

  notifySpeakingId(speakId);
  window.speechSynthesis.speak(utterance);
  return true;
}

export function subscribeSpeechState(listener: SpeechListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => subscribeSpeechState(setSpeakingId), []);

  const speak = useCallback((text: string, languageId: string, id: string) => {
    return speakText(text, languageId, id);
  }, []);

  const stop = useCallback(() => {
    stopSpeech();
  }, []);

  return {
    speak,
    stop,
    speakingId,
    supported: isSpeechSynthesisSupported(),
  };
}
