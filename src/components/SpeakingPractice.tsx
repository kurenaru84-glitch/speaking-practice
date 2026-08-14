"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import { isLivePreviewSupported, useLivePreview } from "@/lib/use-live-preview";
import { isMobileDevice } from "@/lib/device";
import { isRecordingSupported, useRecorder } from "@/lib/use-recorder";
import { getPattern, PATTERNS, type PatternId } from "@/lib/patterns";
import { FREE_TIER_ENABLED } from "@/lib/feature-flags";
import {
  FREE_DAILY_LIMIT,
  FREE_MONTHLY_LIMIT,
  getSessionUsage,
  recordSession,
  sessionLimitMessage,
  type SessionUsage,
} from "@/lib/session-usage";
import { canUseWordList, getPlan } from "@/lib/plan";
import { useWordList } from "@/lib/use-word-list";
import type { FeedbackResult, ImagesResponse, RoleplayScenario, StorySet } from "@/lib/types";
import { SelectableText } from "@/components/SelectableText";

const RECORD_SECONDS = 60;

export function SpeakingPractice() {
  const [patternId, setPatternId] = useState<PatternId>("describe");
  const [images, setImages] = useState<string[]>([]);
  const [stories, setStories] = useState<StorySet[]>([]);
  const [roleplayScenarios, setRoleplayScenarios] = useState<RoleplayScenario[]>([]);
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
  const [toast, setToast] = useState("");
  const [sessionUsage, setSessionUsage] = useState<SessionUsage>(() => getSessionUsage());
  const [wordListEnabled] = useState(() => canUseWordList(getPlan()));

  const { addEntry } = useWordList();

  const { recording, start, stop } = useRecorder();
  const { start: startPreview, stop: stopPreview } = useLivePreview();
  const timerRef = useRef<number | null>(null);

  const pattern = getPattern(patternId);
  const isMultiSet = pattern.multiImage;
  const isCompare = pattern.imageLayout === "compare";
  const isRoleplay = pattern.imageLayout === "roleplay";
  const currentSet = isMultiSet ? stories[index] : null;
  const currentScenario = isRoleplay ? roleplayScenarios[index] : null;
  const currentImages = isMultiSet
    ? (currentSet?.images ?? [])
    : isRoleplay
      ? currentScenario
        ? [currentScenario.image]
        : []
      : images[index]
        ? [images[index]]
        : [];
  const hasVisual = currentImages.length > 0;
  const busy = recording || transcribing || loading;
  const itemCount = isMultiSet
    ? stories.length
    : isRoleplay
      ? roleplayScenarios.length
      : images.length;
  const taskJa = currentScenario?.promptJa ?? pattern.taskJa;
  const taskEn = currentScenario?.promptEn ?? pattern.taskEn;

  useEffect(() => {
    setRecordingOk(isRecordingSupported());
    fetch(`/api/images?pattern=${patternId}`)
      .then((res) => res.json())
      .then((data: ImagesResponse) => {
        if ("roleplayScenarios" in data && data.roleplayScenarios) {
          setRoleplayScenarios(data.roleplayScenarios);
          setStories([]);
          setImages([]);
        } else if ("stories" in data && data.stories) {
          setStories(data.stories);
          setRoleplayScenarios([]);
          setImages([]);
        } else {
          setImages(data.images ?? []);
          setStories([]);
          setRoleplayScenarios([]);
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

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  function addVocabulary(term: string, note: string) {
    if (!wordListEnabled) {
      showToast("単語リストは有料プラン限定です");
      return;
    }
    const result = addEntry({
      term,
      note,
      language,
      source: "この場面で使える語彙",
      autoTranslate: false,
    });
    showToast(result.ok ? "単語リストに追加しました" : "すでに登録済みです");
  }

  const refreshSessionUsage = useCallback(() => {
    setSessionUsage(getSessionUsage());
  }, []);

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

    const usage = getSessionUsage();
    setSessionUsage(usage);
    if (!usage.canUse) {
      setError(sessionLimitMessage(usage));
      return;
    }

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
          ...(currentScenario
            ? {
                scenarioPromptJa: currentScenario.promptJa,
                scenarioPromptEn: currentScenario.promptEn,
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "フィードバックに失敗しました。");
      recordSession();
      refreshSessionUsage();
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
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium tracking-wide text-amber-800">Picture Speaking</p>
          <Link
            href="/word-list"
            className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
              wordListEnabled
                ? "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
                : "bg-stone-100 text-stone-500 ring-stone-200"
            }`}
          >
            単語リスト{!wordListEnabled ? " 🔒" : ""}
          </Link>
        </div>
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
              {isMultiSet && currentSet
                ? ` · ${currentSet.title}`
                : isRoleplay && currentScenario
                  ? ` · ${currentScenario.categoryJa}`
                  : ""}
            </p>
            <button type="button" className="btn-ghost" onClick={() => void nextItem(1)} disabled={busy}>
              {isCompare
                ? "次の比較"
                : isMultiSet
                  ? "次のストーリー"
                  : isRoleplay
                    ? "次のシーン"
                    : "次の画像"}
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-stone-800">
            <p className="font-medium text-amber-900">課題</p>
            {isRoleplay && currentScenario && (
              <p className="mt-2 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-900">
                {currentScenario.categoryJa}
              </p>
            )}
            <p className="mt-1">{taskJa}</p>
            <p className="mt-2 text-xs text-stone-500">{taskEn}</p>
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
            disabled={!text.trim() || busy || (FREE_TIER_ENABLED && !sessionUsage.canUse)}
          >
            {loading ? "添削中..." : pattern.feedbackButton}
          </button>

          {FREE_TIER_ENABLED && (
            <>
              <p className="text-xs text-stone-500">
                無料枠: 今日あと {sessionUsage.dailyRemaining}/{FREE_DAILY_LIMIT} 回 · 今月あと{" "}
                {sessionUsage.monthlyRemaining}/{FREE_MONTHLY_LIMIT} 回
              </p>
              {!sessionUsage.canUse && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {sessionLimitMessage(sessionUsage)}
                </p>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
        </section>
      </div>

      {feedback && (
        <section className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 lg:grid-cols-2">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-stone-900">一文ずとのフィードバック</h2>
            {wordListEnabled && (
              <p className="mb-3 text-xs text-stone-500">例文を選択すると単語リストに追加できます</p>
            )}
            <ul className="space-y-3">
              {feedback.sentences.map((item, i) => {
                const needsFix = item.fixed.trim() !== item.original.trim();
                return (
                  <li key={`${item.original}-${i}`} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <SelectableText
                      text={item.original}
                      language={language}
                      source="フィードバック（原文）"
                      className="font-medium text-stone-800"
                      allowAdd={wordListEnabled}
                      onToast={showToast}
                    />
                    {needsFix && (
                      <p className="mt-1 font-medium text-emerald-800">
                        →{" "}
                        <SelectableText
                          text={item.fixed}
                          language={language}
                          source="フィードバック（修正例）"
                          inline
                          allowAdd={wordListEnabled}
                          onToast={showToast}
                        />
                      </p>
                    )}
                    <p className={`mt-1 ${needsFix ? "text-stone-600" : "text-emerald-700"}`}>
                      {item.comment}
                    </p>
                  </li>
                );
              })}
            </ul>
            <SelectableText
              text={feedback.summary}
              language={language}
              source="総評"
              className="mt-4 text-sm leading-6 text-stone-600"
              allowAdd={wordListEnabled}
              onToast={showToast}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-stone-900">{pattern.naturalTitle}</h2>
              {wordListEnabled && (
                <p className="mb-3 text-xs text-stone-500">例文を選択すると単語リストに追加できます</p>
              )}
              <div className="flex flex-col gap-3">
                {feedback.natural
                  .filter((example) => example.text.trim())
                  .map((example, i) => (
                  <div key={`natural-${i}`} className="rounded-2xl bg-amber-50 p-4">
                    <p className="mb-2 text-xs font-medium text-amber-900">例 {i + 1}</p>
                    <SelectableText
                      text={example.text}
                      language={language}
                      source={`${pattern.naturalTitle} 例${i + 1}`}
                      className="whitespace-pre-wrap text-sm leading-7 text-stone-800"
                      allowAdd={wordListEnabled}
                      onToast={showToast}
                    />
                    {example.translationJa && (
                      <div className="mt-3 border-t border-amber-200/80 pt-3">
                        <p className="mb-1 text-xs font-medium text-stone-500">訳</p>
                        <p className="text-sm leading-7 text-stone-600">{example.translationJa}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {feedback.vocabulary.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-stone-900">この場面で使える語彙</h3>
                {wordListEnabled && (
                  <p className="mb-2 text-xs text-stone-500">タップで単語リストに追加</p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {feedback.vocabulary.map((item, i) => (
                    <li key={`${item.term}-${i}`}>
                      {wordListEnabled ? (
                        <button
                          type="button"
                          className="rounded-xl bg-stone-100 px-3 py-2 text-left text-sm transition hover:bg-amber-100 hover:ring-1 hover:ring-amber-300"
                          title={`${item.note} — タップで追加`}
                          onClick={() => addVocabulary(item.term, item.note)}
                        >
                          <span className="font-medium text-stone-900">{item.term}</span>
                          <span className="text-stone-500"> · {item.note}</span>
                          <span className="ml-1 text-xs text-amber-700">＋</span>
                        </button>
                      ) : (
                        <span className="rounded-xl bg-stone-100 px-3 py-2 text-sm">
                          <span className="font-medium text-stone-900">{item.term}</span>
                          <span className="text-stone-500"> · {item.note}</span>
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
