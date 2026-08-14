"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import { isLivePreviewSupported, useLivePreview } from "@/lib/use-live-preview";
import { isMobileDevice } from "@/lib/device";
import { isRecordingSupported, useRecorder } from "@/lib/use-recorder";
import { getPattern, PATTERNS, type PatternId } from "@/lib/patterns";
import type { FeedbackResult, ImagesResponse, StorySet } from "@/lib/types";

const RECORD_SECONDS = 60;

export function SpeakingPractice() {
  const [patternId, setPatternId] = useState<PatternId>("describe");
  const [images, setImages] = useState<string[]>([]);
  const [stories, setStories] = useState<StorySet[]>([]);
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
  const [previewCapable] = useState(() => isLivePreviewSupported());
  const [mobile] = useState(() => isMobileDevice());

  const { recording, start, stop } = useRecorder();
  const { start: startPreview, stop: stopPreview } = useLivePreview();
  const timerRef = useRef<number | null>(null);

  const pattern = getPattern(patternId);
  const isMultiSet = pattern.multiImage;
  const isCompare = pattern.imageLayout === "compare";
  const currentSet = isMultiSet ? stories[index] : null;
  const currentImages = isMultiSet ? (currentSet?.images ?? []) : images[index] ? [images[index]] : [];
  const hasVisual = currentImages.length > 0;
  const busy = recording || transcribing || loading;
  const itemCount = isMultiSet ? stories.length : images.length;

  useEffect(() => {
    setRecordingOk(isRecordingSupported());
    fetch(`/api/images?pattern=${patternId}`)
      .then((res) => res.json())
      .then((data: ImagesResponse) => {
        if ("stories" in data && data.stories) {
          setStories(data.stories);
          setImages([]);
        } else {
          setImages(data.images ?? []);
          setStories([]);
        }
        setIndex(0);
        setText("");
        setFeedback(null);
        setError("");
      })
      .catch(() => setError("画像一覧の取得に失敗しました。"));
  }, [patternId]);

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
    if (!hasVisual || !text.trim()) return;
    setLoading(true);
    setError("");
    setFeedback(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(isMultiSet ? { images: currentImages } : { image: currentImages[0] }),
          text: text.trim(),
          language,
          pattern: patternId,
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

  async function nextItem(delta: number) {
    if (!itemCount || busy) return;
    clearTimer();
    stopPreview();
    setLivePreview(false);
    await stop();
    setIndex((prev) => (prev + delta + itemCount) % itemCount);
    setText("");
    setFeedback(null);
    setSecondsLeft(RECORD_SECONDS);
    setError("");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-3">
        <p className="text-sm font-medium tracking-wide text-amber-800">Picture Speaking</p>
        <h1 className="text-2xl font-semibold text-stone-900 md:text-3xl">{pattern.title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-stone-600">{pattern.description}</p>

        <div className="flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={busy}
              onClick={() => setPatternId(p.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                patternId === p.id
                  ? "bg-amber-700 text-white"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
          <div className={`relative bg-stone-100 ${isMultiSet ? "p-3" : "aspect-[4/3]"}`}>
            {hasVisual ? (
              isMultiSet ? (
                isCompare ? (
                  <div className="grid grid-cols-2 gap-2">
                    {currentImages.slice(0, 2).map((src, i) => (
                      <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Option ${String.fromCharCode(65 + i)}`} className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-amber-700 px-2.5 py-0.5 text-xs font-bold text-white">
                          {String.fromCharCode(65 + i)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {currentImages.map((src, i) => (
                      <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Panel ${i + 1}`} className="h-full w-full object-cover" />
                        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentImages[0]}
                  alt="練習用の写真"
                  className="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-stone-500">
                {pattern.emptyImageHint}
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
            <button type="button" className="btn-ghost" onClick={() => void nextItem(-1)} disabled={busy}>
              {pattern.navLabel}
            </button>
            <p className="text-sm text-stone-500">
              {itemCount ? `${index + 1} / ${itemCount}` : "0 / 0"}
              {isMultiSet && currentSet ? ` · ${currentSet.title}` : ""}
            </p>
            <button type="button" className="btn-ghost" onClick={() => void nextItem(1)} disabled={busy}>
              {isCompare ? "次の比較" : isMultiSet ? "次のストーリー" : "次の画像"}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-stone-800">
            <p className="font-medium text-amber-900">課題</p>
            <p className="mt-1">{pattern.taskJa}</p>
            <p className="mt-2 text-xs text-stone-500">{pattern.taskEn}</p>
          </div>

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
                  : mobile
                    ? `残り ${secondsLeft} 秒 · 終了後に文字起こし`
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

          {recording && !livePreview && !previewCapable && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-stone-700">
              <p className="font-medium text-red-700">録音中 · 残り {secondsLeft} 秒</p>
              <p className="mt-2 leading-6">
                {mobile
                  ? "iPhone / Android ではリアルタイム文字表示に対応していません。話し終わったら「録音を止める」を押してください。Gemini が文字起こしします。"
                  : "リアルタイム表示非対応のブラウザです。録音後に Gemini が文字起こしします。"}
              </p>
            </div>
          )}

          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">
              あなたの説明
              {livePreview && (
                <span className="ml-2 text-xs font-normal text-amber-700">プレビュー（確定版は録音後）</span>
              )}
            </span>
            {recording && !livePreview ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm leading-6 text-stone-500">
                <p className="text-2xl">🎙</p>
                <p className="mt-3 font-medium text-stone-700">録音中...</p>
                <p className="mt-1">終了後、この欄に文字が入ります</p>
              </div>
            ) : (
              <textarea
                className={`min-h-40 flex-1 resize-y rounded-2xl border px-3 py-2 leading-6 ${
                  livePreview
                    ? "border-amber-200 bg-amber-50/60 text-stone-700"
                    : "border-stone-200 bg-stone-50"
                }`}
                placeholder={
                  mobile
                    ? "録音を止めると Gemini がここへ文字起こしします。キーボード入力もできます。"
                    : "話している間ここに文字が出ます。録音後に Gemini が確定版に更新します。"
                }
                value={text}
                readOnly={livePreview || transcribing}
                onChange={(e) => setText(e.target.value)}
              />
            )}
          </label>

          <button
            type="button"
            className="btn-primary"
            onClick={requestFeedback}
            disabled={!text.trim() || busy}
          >
            {loading ? "添削中..." : pattern.feedbackButton}
          </button>

          {error && <p className="text-sm text-red-700">{error}</p>}
        </section>
      </div>

      {feedback && (
        <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-stone-900">一文ずとのフィードバック</h2>
            <ul className="space-y-3">
              {feedback.sentences.map((item, i) => {
                const needsFix = item.fixed.trim() !== item.original.trim();
                return (
                  <li key={`${item.original}-${i}`} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <p className="font-medium text-stone-800">{item.original}</p>
                    {needsFix && (
                      <p className="mt-1 font-medium text-emerald-800">→ {item.fixed}</p>
                    )}
                    <p className={`mt-1 ${needsFix ? "text-stone-600" : "text-emerald-700"}`}>
                      {item.comment}
                    </p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm leading-6 text-stone-600">{feedback.summary}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-stone-900">{pattern.naturalTitle}</h2>
              <p className="whitespace-pre-wrap rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-stone-800">
                {feedback.natural}
              </p>
            </div>
            {feedback.vocabulary.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-stone-900">この場面で使える語彙</h3>
                <ul className="flex flex-wrap gap-2">
                  {feedback.vocabulary.map((item, i) => (
                    <li
                      key={`${item.term}-${i}`}
                      className="rounded-xl bg-stone-100 px-3 py-2 text-sm"
                      title={item.note}
                    >
                      <span className="font-medium text-stone-900">{item.term}</span>
                      <span className="text-stone-500"> · {item.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
