"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import { isLivePreviewSupported, useLivePreview } from "@/lib/use-live-preview";
import { isRecordingSupported, useRecorder } from "@/lib/use-recorder";
import type { FeedbackResult } from "@/lib/types";

const RECORD_SECONDS = 60;

export function SpeakingPractice() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<LanguageId>("en-US");
  const [text, setText] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RECORD_SECONDS);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingOk, setRecordingOk] = useState(true);
  const [livePreview, setLivePreview] = useState(false);

  const { recording, start, stop } = useRecorder();
  const { start: startPreview, stop: stopPreview } = useLivePreview();
  const timerRef = useRef<number | null>(null);

  const image = images[index];
  const busy = recording || transcribing || loading;

  useEffect(() => {
    setRecordingOk(isRecordingSupported());
    fetch("/api/images")
      .then((res) => res.json())
      .then((data: { images: string[] }) => setImages(data.images))
      .catch(() => setError("画像一覧の取得に失敗しました。"));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const transcribeBlob = useCallback(async (blob: Blob) => {
    setTranscribing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("language", language);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "文字起こしに失敗しました。");
      setText(String(data.text ?? "").trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "文字起こしに失敗しました。");
    } finally {
      setTranscribing(false);
      setLivePreview(false);
    }
  }, [language]);

  const finishRecording = useCallback(async () => {
    clearTimer();
    stopPreview();
    setLivePreview(false);
    const blob = await stop();
    if (blob && blob.size > 0) {
      await transcribeBlob(blob);
    }
  }, [clearTimer, stop, stopPreview, transcribeBlob]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopPreview();
      void stop();
    };
  }, [clearTimer, stop, stopPreview]);

  useEffect(() => {
    if (recording && secondsLeft === 0) {
      void finishRecording();
    }
  }, [recording, secondsLeft, finishRecording]);

  async function startRecording() {
    setError("");
    setFeedback(null);
    setText("");
    setSecondsLeft(RECORD_SECONDS);

    try {
      await start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "録音を開始できませんでした。");
      return;
    }

    const previewStarted = startPreview(language, setText);
    setLivePreview(previewStarted);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  }

  async function requestFeedback() {
    if (!image || !text.trim()) return;
    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image.replace("/images/", ""),
          text: text.trim(),
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "フィードバックに失敗しました。");
      setFeedback(data as FeedbackResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "フィードバックに失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  async function nextImage(delta: number) {
    if (!images.length || busy) return;
    clearTimer();
    stopPreview();
    setLivePreview(false);
    await stop();
    setIndex((prev) => (prev + delta + images.length) % images.length);
    setText("");
    setFeedback(null);
    setSecondsLeft(RECORD_SECONDS);
    setError("");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-wide text-amber-800">Picture Speaking</p>
        <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">
          画像を見て 1 分で説明する練習
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          話している間はリアルタイムで文字が出ます。録音後に Gemini が精度の高い確定版に更新します。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
          <div className="relative aspect-[4/3] bg-stone-100">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="練習用の写真" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">
                public/images に画像を入れてください
              </div>
            )}
            {recording && (
              <div className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                REC {secondsLeft}s
              </div>
            )}
            {transcribing && (
              <div className="absolute left-4 top-4 rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-white">
                確定版を作成中...
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <button type="button" className="btn-ghost" onClick={() => void nextImage(-1)} disabled={busy}>
              前の画像
            </button>
            <p className="text-sm text-stone-500">
              {images.length ? `${index + 1} / ${images.length}` : "0 / 0"}
            </p>
            <button type="button" className="btn-ghost" onClick={() => void nextImage(1)} disabled={busy}>
              次の画像
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">話す言語</span>
            <select
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
              value={language}
              disabled={busy}
              onChange={(e) => setLanguage(e.target.value as LanguageId)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            {recording ? (
              <button
                type="button"
                className="btn-primary bg-stone-800"
                onClick={() => void finishRecording()}
              >
                録音を止める
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => void startRecording()}
                disabled={!recordingOk || transcribing}
              >
                {RECORD_SECONDS}秒録音する
              </button>
            )}
            <span className="text-sm text-stone-500">
              {recording
                ? livePreview
                  ? `残り ${secondsLeft} 秒 · リアルタイム表示中`
                  : `残り ${secondsLeft} 秒`
                : transcribing
                  ? "Gemini が確定版を作成中"
                  : "または下に直接入力"}
            </span>
          </div>

          {!recordingOk && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              このブラウザは録音非対応です。HTTPS 環境の Chrome / Safari を使うか、テキストで入力してください。
            </p>
          )}

          {recording && !livePreview && isLivePreviewSupported() === false && (
            <p className="rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-600">
              リアルタイム表示非対応のブラウザです。録音後に Gemini が文字起こしします。
            </p>
          )}

          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">
              あなたの説明
              {livePreview && (
                <span className="ml-2 text-xs font-normal text-amber-700">プレビュー（確定版は録音後）</span>
              )}
            </span>
            <textarea
              className={`min-h-40 flex-1 resize-y rounded-2xl border px-3 py-2 leading-6 ${
                livePreview
                  ? "border-amber-200 bg-amber-50/60 text-stone-700"
                  : "border-stone-200 bg-stone-50"
              }`}
              placeholder="話している間ここに文字が出ます。録音後に Gemini が確定版に更新します。"
              value={text}
              readOnly={livePreview || transcribing}
              onChange={(e) => setText(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="btn-primary"
            onClick={requestFeedback}
            disabled={!text.trim() || busy}
          >
            {loading ? "添削中..." : "文法と自然な言い方を見る"}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </section>
      </div>

      {feedback && (
        <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-stone-900">文法の直し</h2>
            {feedback.corrections.length === 0 ? (
              <p className="text-sm text-stone-600">大きな文法ミスは見つかりませんでした。</p>
            ) : (
              <ul className="space-y-3">
                {feedback.corrections.map((item, i) => (
                  <li key={`${item.original}-${i}`} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <p className="text-stone-500 line-through">{item.original}</p>
                    <p className="mt-1 font-medium text-emerald-800">{item.fixed}</p>
                    <p className="mt-1 text-stone-600">{item.note}</p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-sm leading-6 text-stone-600">{feedback.summary}</p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold text-stone-900">こう言うともっと自然</h2>
            <p className="whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-stone-800">
              {feedback.natural}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
