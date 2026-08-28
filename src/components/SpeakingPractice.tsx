"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { containsNativeLanguage } from "@/lib/code-switch";
import { getLearningLanguage, getNativeLanguage } from "@/lib/languages";
import { useSettings } from "@/lib/use-settings";
import { isLivePreviewSupported, INSTANT_TRANSCRIPT_MIN_CHARS, useLivePreview } from "@/lib/use-live-preview";
import { isMobileDevice } from "@/lib/device";
import { isRecordingSupported, useRecorder } from "@/lib/use-recorder";
import { getPattern, type PatternId } from "@/lib/patterns";
import { FREE_TIER_ENABLED } from "@/lib/feature-flags";
import {
  FREE_DAILY_LIMIT,
  FREE_MONTHLY_LIMIT,
  getSessionUsage,
  recordSession,
  sessionLimitMessage,
  type SessionUsage,
} from "@/lib/session-usage";
import { canUseWordList, getPlan, type PlanId } from "@/lib/plan";
import {
  getTextCharLimit,
  RECORD_SECONDS_PRO,
  RECORD_SECONDS_STANDARD,
  textLimitMessage,
  type RecordDurationSeconds,
} from "@/lib/text-limits";
import {
  canUnlockExtendedRecording,
  getSavedRecordDuration,
  resolveRecordSeconds,
  saveRecordDuration,
} from "@/lib/record-duration";
import { useWordList } from "@/lib/use-word-list";
import type {
  FeedbackDetailResult,
  FeedbackQuickResult,
  FeedbackResult,
  ImagesResponse,
  CompareSet,
  EmailScenario,
  InterviewQuestion,
  RoleplayScenario,
  StorySet,
} from "@/lib/types";
import {
  countChecklistPassed,
  getLatestPracticeHistory,
  savePracticeHistory,
  type PracticeHistoryEntry,
} from "@/lib/practice-history";
import {
  buildPracticeItemKey,
  findIndexByItemKey,
  getPracticeItemTitle,
} from "@/lib/practice-item-key";
import {
  isBookmarked,
  loadBookmarks,
  removeBookmark,
  toggleBookmark,
  type BookmarkEntry,
} from "@/lib/bookmarks";
import {
  addRetryQueueEntry,
  isInRetryQueue,
  loadRetryQueue,
  removeRetryQueueEntry,
  type RetryQueueEntry,
} from "@/lib/retry-queue";
import { ProcessingStatusBar } from "@/components/ProcessingStatusBar";
import { BookmarkMenu } from "@/components/BookmarkMenu";
import { PatternNavigator } from "@/components/PatternNavigator";
import { SessionThumbnailGrid } from "@/components/SessionThumbnailGrid";
import { PracticeVisual } from "@/components/PracticeVisual";
import { PastAttemptsPanel } from "@/components/PastAttemptsPanel";
import { preloadImages } from "@/components/PracticeImage";
import { consumeBookmarkNavigate } from "@/components/BookmarksView";
import {
  PracticeStepIndicator,
  resolvePracticeStep,
  type PracticeStep,
} from "@/components/PracticeStepIndicator";
import { IconLock, IconMic, IconSparkles, IconStar, IconStarOutline } from "@/components/icons";
import { FeedbackActions } from "@/components/FeedbackActions";
import { FeedbackChecklist } from "@/components/FeedbackChecklist";
import { FeedbackGradeBadge } from "@/components/FeedbackGrade";
import { PracticeGrowthPanel } from "@/components/PracticeGrowthPanel";
import { RetryQueuePanel } from "@/components/RetryQueuePanel";
import { StructuredNaturalExample } from "@/components/StructuredNaturalExample";
import { SpeakButton } from "@/components/SpeakButton";
import { SentenceCorrection } from "@/components/SentenceCorrection";
import { SelectableText } from "@/components/SelectableText";
import {
  getDefaultSubcategoryForPattern,
  type ContentSubcategoryId,
} from "@/lib/pattern-categories";
import { buildSessionThumbs } from "@/lib/session-thumbs";
import { SITE } from "@/lib/site";
import {
  appendTextAttempt,
  getTextAttempts,
  type TextAttemptEntry,
} from "@/lib/text-attempt-history";

type PendingNavigate = {
  patternId: PatternId;
  itemKey: string;
  subcategory?: ContentSubcategoryId;
};

export function SpeakingPractice() {
  const [patternId, setPatternId] = useState<PatternId>("describe");
  const [images, setImages] = useState<string[]>([]);
  const [stories, setStories] = useState<StorySet[]>([]);
  const [compareSets, setCompareSets] = useState<CompareSet[]>([]);
  const [roleplayScenarios, setRoleplayScenarios] = useState<RoleplayScenario[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [emailScenarios, setEmailScenarios] = useState<EmailScenario[]>([]);
  const [index, setIndex] = useState(0);
  const { settings, ready: settingsReady } = useSettings();
  const learningLanguage = settings.learningLanguage;
  const nativeLanguage = settings.nativeLanguage;
  const learningLabel = getLearningLanguage(learningLanguage).label;
  const nativeLabel = getNativeLanguage(nativeLanguage).label;
  const [text, setText] = useState("");
  const [plan] = useState<PlanId>(() => getPlan());
  const [recordDuration, setRecordDuration] = useState<RecordDurationSeconds>(() =>
    getSavedRecordDuration()
  );
  const recordSeconds = useMemo(
    () => resolveRecordSeconds(plan, recordDuration),
    [plan, recordDuration]
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    resolveRecordSeconds(getPlan(), getSavedRecordDuration())
  );
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingOk, setRecordingOk] = useState(true);
  const [livePreview, setLivePreview] = useState(false);
  const [previewCapable] = useState(() => isLivePreviewSupported());
  const [mobile] = useState(() => isMobileDevice());
  const [toast, setToast] = useState("");
  const [sessionUsage, setSessionUsage] = useState<SessionUsage>(() => getSessionUsage());
  const [wordListEnabled] = useState(() => canUseWordList(getPlan()));
  const [previousHistory, setPreviousHistory] = useState<PracticeHistoryEntry | null>(null);
  const [comparisonHistory, setComparisonHistory] = useState<PracticeHistoryEntry | null>(null);
  const [retryQueue, setRetryQueue] = useState<RetryQueueEntry[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkEntry[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [contentSubcategory, setContentSubcategory] = useState<ContentSubcategoryId>("personal");
  const [textAttempts, setTextAttempts] = useState<TextAttemptEntry[]>([]);
  const [addedVocabKeys, setAddedVocabKeys] = useState<Set<string>>(() => new Set());
  const pendingNavigateRef = useRef<PendingNavigate | null>(null);

  const refreshRetryQueue = useCallback(() => {
    setRetryQueue(loadRetryQueue());
  }, []);

  const refreshBookmarks = useCallback(() => {
    setBookmarks(loadBookmarks());
  }, []);

  const { addEntry } = useWordList();

  const { recording, start, stop } = useRecorder();
  const { start: startPreview, stop: stopPreview } = useLivePreview();
  const timerRef = useRef<number | null>(null);
  const feedbackSectionRef = useRef<HTMLElement | null>(null);
  const lastRecordingUrlRef = useRef<string | null>(null);
  const lastRecordingSessionRef = useRef<{ patternId: PatternId; index: number } | null>(null);
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null);

  const pattern = getPattern(patternId);
  const isCompare = pattern.imageLayout === "compare";
  const isRoleplay = pattern.imageLayout === "roleplay";
  const isInterview = pattern.imageLayout === "interview";
  const isEmail = pattern.imageLayout === "email";
  const isTextPractice = isInterview || isEmail;
  const isStory = pattern.imageLayout === "sequence";
  const isMultiVisual = isStory || isCompare;

  const visibleInterviewQuestions = useMemo(
    () =>
      isInterview
        ? interviewQuestions.filter((q) => q.context === contentSubcategory)
        : interviewQuestions,
    [interviewQuestions, isInterview, contentSubcategory]
  );

  const visibleEmailScenarios = useMemo(
    () =>
      isEmail ? emailScenarios.filter((s) => s.context === contentSubcategory) : emailScenarios,
    [emailScenarios, isEmail, contentSubcategory]
  );

  const currentSet = isStory ? stories[index] : null;
  const currentCompare = isCompare ? compareSets[index] : null;
  const currentScenario = isRoleplay ? roleplayScenarios[index] : null;
  const currentInterview = isInterview ? visibleInterviewQuestions[index] : null;
  const currentEmail = isEmail ? visibleEmailScenarios[index] : null;
  const currentImages = isCompare
    ? (currentCompare?.images ?? [])
    : isStory
      ? (currentSet?.images ?? [])
      : isRoleplay
        ? currentScenario
          ? [currentScenario.image]
          : []
        : images[index]
          ? [images[index]]
          : [];
  const hasVisual = currentImages.length > 0;
  const hasPracticeItem = isTextPractice
    ? isInterview
      ? !!currentInterview
      : !!currentEmail
    : hasVisual;
  const busy = recording || transcribing || loading || loadingDetail;
  const practiceStep: PracticeStep = resolvePracticeStep({
    feedback,
    recording,
    transcribing,
    loading: loading || loadingDetail,
    hasText: !!text.trim(),
  });
  const mixedLanguage = containsNativeLanguage(text, nativeLanguage);
  const itemCount = isCompare
    ? compareSets.length
    : isRoleplay
      ? roleplayScenarios.length
      : isInterview
        ? visibleInterviewQuestions.length
        : isEmail
          ? visibleEmailScenarios.length
          : isStory
            ? stories.length
            : images.length;

  const sessionThumbs = useMemo(
    () =>
      buildSessionThumbs({
        patternId,
        images,
        stories,
        compareSets,
        roleplayScenarios,
        interviewQuestions: visibleInterviewQuestions,
        emailScenarios: visibleEmailScenarios,
      }),
    [
      patternId,
      images,
      stories,
      compareSets,
      roleplayScenarios,
      visibleInterviewQuestions,
      visibleEmailScenarios,
    ]
  );

  const showSessionPicker = sessionThumbs.length > 1;
  const taskJa =
    currentCompare?.promptJa ??
    currentScenario?.promptJa ??
    currentInterview?.promptJa ??
    currentEmail?.promptJa ??
    pattern.taskJa;
  const taskEn =
    currentCompare?.promptEn ??
    currentScenario?.promptEn ??
    currentInterview?.promptEn ??
    currentEmail?.promptEn ??
    pattern.taskEn;
  const outputLabel = isEmail ? "あなたのメール" : "あなたの説明";
  const textCharLimit = useMemo(
    () =>
      getTextCharLimit({
        patternId,
        recordSeconds,
      }),
    [patternId, recordSeconds]
  );
  const canChooseRecordDuration = canUnlockExtendedRecording(plan) && !isEmail;

  const handleRecordDurationChange = useCallback(
    (duration: RecordDurationSeconds) => {
      if (duration === recordDuration) return;
      setRecordDuration(duration);
      saveRecordDuration(duration);
      if (!recording && !transcribing) {
        setSecondsLeft(resolveRecordSeconds(plan, duration));
      }
    },
    [plan, recordDuration, recording, transcribing]
  );
  const textOverLimit = text.length > textCharLimit;

  const currentItemKey = useMemo(
    () =>
      buildPracticeItemKey({
        patternId,
        index,
        interview: currentInterview,
        email: currentEmail,
        compare: currentCompare,
        roleplay: currentScenario,
        story: currentSet,
        image: currentImages[0] ?? null,
      }),
    [
      patternId,
      index,
      currentInterview,
      currentEmail,
      currentCompare,
      currentScenario,
      currentSet,
      currentImages,
    ]
  );

  const currentItemTitleJa = useMemo(
    () =>
      getPracticeItemTitle({
        patternLabel: pattern.label,
        interview: currentInterview,
        email: currentEmail,
        compare: currentCompare,
        roleplay: currentScenario,
        story: currentSet,
        index,
      }),
    [
      pattern.label,
      currentInterview,
      currentEmail,
      currentCompare,
      currentScenario,
      currentSet,
      index,
    ]
  );

  const inRetryQueue = isInRetryQueue(patternId, currentItemKey);
  const supportsChecklist = isInterview || isEmail;

  useEffect(() => {
    refreshRetryQueue();
    refreshBookmarks();
  }, [refreshRetryQueue, refreshBookmarks]);

  useEffect(() => {
    const payload = consumeBookmarkNavigate();
    if (!payload) return;
    pendingNavigateRef.current = {
      patternId: payload.patternId,
      itemKey: payload.itemKey,
    };
    setPatternId(payload.patternId);
  }, []);

  useEffect(() => {
    setTextAttempts(getTextAttempts(currentItemKey, learningLanguage));
  }, [currentItemKey, learningLanguage]);

  useEffect(() => {
    if (!feedback) return;
    window.requestAnimationFrame(() => {
      feedbackSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [feedback]);

  useEffect(() => {
    setAddedVocabKeys(new Set());
  }, [feedback]);

  useEffect(() => {
    setBookmarked(isBookmarked(patternId, currentItemKey));
  }, [patternId, currentItemKey]);

  useEffect(() => {
    const defaultSubcategory = getDefaultSubcategoryForPattern(patternId);
    if (defaultSubcategory) {
      setContentSubcategory(defaultSubcategory);
    }
  }, [patternId]);

  const skipSubcategoryResetRef = useRef(false);

  useEffect(() => {
    if (skipSubcategoryResetRef.current) {
      skipSubcategoryResetRef.current = false;
      return;
    }
    setIndex(0);
    setText("");
    setFeedback(null);
    setError("");
  }, [contentSubcategory]);

  useEffect(() => {
    setPreviousHistory(getLatestPracticeHistory(currentItemKey, learningLanguage));
    setComparisonHistory(null);
  }, [currentItemKey, learningLanguage, patternId]);

  useEffect(() => {
    setRecordingOk(isRecordingSupported());
    setContentLoading(true);
    fetch(`/api/images?pattern=${patternId}`)
      .then((res) => res.json())
      .then((data: ImagesResponse) => {
        if ("roleplayScenarios" in data) {
          setRoleplayScenarios(data.roleplayScenarios ?? []);
          setInterviewQuestions([]);
          setEmailScenarios([]);
          setCompareSets([]);
          setStories([]);
          setImages([]);
        } else if ("interviewQuestions" in data) {
          setInterviewQuestions(data.interviewQuestions ?? []);
          setEmailScenarios([]);
          setRoleplayScenarios([]);
          setCompareSets([]);
          setStories([]);
          setImages([]);
        } else if ("emailScenarios" in data) {
          setEmailScenarios(data.emailScenarios ?? []);
          setInterviewQuestions([]);
          setRoleplayScenarios([]);
          setCompareSets([]);
          setStories([]);
          setImages([]);
        } else if ("compareSets" in data) {
          setCompareSets(data.compareSets ?? []);
          setRoleplayScenarios([]);
          setInterviewQuestions([]);
          setEmailScenarios([]);
          setStories([]);
          setImages([]);
        } else if ("stories" in data && data.stories) {
          setStories(data.stories);
          setCompareSets([]);
          setRoleplayScenarios([]);
          setInterviewQuestions([]);
          setEmailScenarios([]);
          setImages([]);
        } else {
          setImages(data.images ?? []);
          setStories([]);
          setCompareSets([]);
          setRoleplayScenarios([]);
          setInterviewQuestions([]);
          setEmailScenarios([]);
        }
        setIndex(0);
        setText("");
        setFeedback(null);
        setError("");
      })
      .catch(() => setError("お題の読み込みに失敗しました。"))
      .finally(() => setContentLoading(false));
  }, [patternId]);

  useEffect(() => {
    const thumbSources = sessionThumbs
      .filter((item) => item.thumbnail && Math.abs(item.index - index) <= 2)
      .map((item) => item.thumbnail as string);
    preloadImages(thumbSources);
  }, [sessionThumbs, index]);

  useEffect(() => {
    const pending = pendingNavigateRef.current;
    if (!pending || pending.patternId !== patternId || itemCount === 0) return;

    const target = resolveNavigateTarget(pending.patternId, pending.itemKey, {
      images,
      stories,
      compareSets,
      roleplayScenarios,
      interviewQuestions,
      emailScenarios,
    });
    skipSubcategoryResetRef.current = true;
    if (target.subcategory) {
      setContentSubcategory(target.subcategory);
    }
    setIndex(target.index);
    setText("");
    setFeedback(null);
    setComparisonHistory(null);
    pendingNavigateRef.current = null;
  }, [
    patternId,
    itemCount,
    images,
    stories,
    compareSets,
    roleplayScenarios,
    interviewQuestions,
    emailScenarios,
  ]);

  const practiceData = useMemo(
    () => ({
      images,
      stories,
      compareSets,
      roleplayScenarios,
      interviewQuestions,
      emailScenarios,
    }),
    [images, stories, compareSets, roleplayScenarios, interviewQuestions, emailScenarios]
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const applySessionIndex = useCallback(
    (nextIndex: number) => {
      if (busy) return;
      clearTimer();
      stopPreview();
      setLivePreview(false);
      void stop();
      setIndex(nextIndex);
      setText("");
      setFeedback(null);
      setSecondsLeft(recordSeconds);
      setError("");
    },
    [busy, clearTimer, stop, stopPreview]
  );

  const navigateToItem = useCallback(
    (targetPatternId: PatternId, itemKey: string) => {
      if (targetPatternId !== patternId) {
        pendingNavigateRef.current = { patternId: targetPatternId, itemKey };
        setPatternId(targetPatternId);
        return;
      }

      const target = resolveNavigateTarget(targetPatternId, itemKey, practiceData);
      skipSubcategoryResetRef.current = true;
      if (target.subcategory) {
        setContentSubcategory(target.subcategory);
      }
      applySessionIndex(target.index);
    },
    [patternId, practiceData, applySessionIndex]
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }, []);

  const applyTranscriptText = useCallback(
    (trimmed: string) => {
      setText(trimmed);
      appendTextAttempt(currentItemKey, learningLanguage, trimmed);
      setTextAttempts(getTextAttempts(currentItemKey, learningLanguage));
    },
    [currentItemKey, learningLanguage]
  );

  const transcribeBlob = useCallback(
    async (blob: Blob) => {
      setTranscribing(true);
      setError("");

      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("language", learningLanguage);
        formData.append("nativeLanguage", nativeLanguage);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "文字起こしに失敗しました。");
        applyTranscriptText(String(data.text ?? "").trim());
      } catch (err) {
        setError(err instanceof Error ? err.message : "文字起こしに失敗しました。");
      } finally {
        setTranscribing(false);
        setLivePreview(false);
      }
    },
    [learningLanguage, nativeLanguage, applyTranscriptText]
  );

  const refineTranscriptFromAudio = useCallback(
    async (blob: Blob, instantText: string) => {
      try {
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");
        formData.append("language", learningLanguage);
        formData.append("nativeLanguage", nativeLanguage);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) return;

        const refined = String(data.text ?? "").trim();
        if (!refined) return;

        const normalize = (value: string) => value.replace(/\s+/g, " ").trim();
        if (normalize(refined) === normalize(instantText)) return;

        applyTranscriptText(refined);
        showToast("文字起こしを更新しました");
      } catch {
        // Keep instant browser transcript on background failure.
      }
    },
    [learningLanguage, nativeLanguage, applyTranscriptText, showToast]
  );

  const clearLastRecording = useCallback(() => {
    if (lastRecordingUrlRef.current) {
      URL.revokeObjectURL(lastRecordingUrlRef.current);
      lastRecordingUrlRef.current = null;
    }
    lastRecordingSessionRef.current = null;
    setLastRecordingUrl(null);
  }, []);

  useEffect(() => {
    clearLastRecording();
  }, [patternId, index, contentSubcategory, clearLastRecording]);

  const showLastRecording =
    Boolean(lastRecordingUrl) &&
    lastRecordingSessionRef.current?.patternId === patternId &&
    lastRecordingSessionRef.current?.index === index &&
    !recording;

  const finishRecording = useCallback(async () => {
    clearTimer();
    const instantText = stopPreview();
    setLivePreview(false);
    const blob = await stop();
    if (blob && blob.size > 0) {
      clearLastRecording();
      const url = URL.createObjectURL(blob);
      lastRecordingUrlRef.current = url;
      lastRecordingSessionRef.current = { patternId, index };
      setLastRecordingUrl(url);

      if (instantText.length >= INSTANT_TRANSCRIPT_MIN_CHARS) {
        applyTranscriptText(instantText);
        void refineTranscriptFromAudio(blob, instantText);
      } else {
        await transcribeBlob(blob);
      }
    }
  }, [
    clearTimer,
    stop,
    stopPreview,
    transcribeBlob,
    refineTranscriptFromAudio,
    applyTranscriptText,
    clearLastRecording,
    patternId,
    index,
  ]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopPreview();
      void stop();
    };
  }, [clearTimer, stop, stopPreview]);

  function addVocabulary(term: string, note: string) {
    const vocabKey = `${term}::${note}`;
    if (!wordListEnabled) {
      showToast("単語リストは有料プラン限定です");
      return;
    }
    const result = addEntry({
      term,
      note,
      language: learningLanguage,
      source: "この場面で使える語彙",
      autoTranslate: false,
    });
    if (result.ok) {
      setAddedVocabKeys((prev) => new Set(prev).add(vocabKey));
    }
    showToast(result.ok ? "単語リストに追加しました" : "すでに登録済みです");
  }

  const refreshSessionUsage = useCallback(() => {
    setSessionUsage(getSessionUsage());
  }, []);

  useEffect(() => {
    return () => {
      if (lastRecordingUrlRef.current) {
        URL.revokeObjectURL(lastRecordingUrlRef.current);
      }
    };
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
    clearLastRecording();
    setSecondsLeft(recordSeconds);

    try {
      await start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "録音を開始できませんでした。");
      return;
    }

    const previewStarted = startPreview(learningLanguage, setText);
    setLivePreview(previewStarted);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
  }

  async function requestFeedback() {
    if (!hasPracticeItem || !text.trim()) return;

    if (text.length > textCharLimit) {
      setError(textLimitMessage(textCharLimit));
      return;
    }

    const usage = getSessionUsage();
    setSessionUsage(usage);
    if (!usage.canUse) {
      setError(sessionLimitMessage(usage));
      return;
    }

    setLoading(true);
    setLoadingDetail(false);
    setError("");
    setFeedback(null);
    setComparisonHistory(previousHistory);

    const previousChecklist = previousHistory
      ? countChecklistPassed(previousHistory.feedback)
      : { passed: 0, total: 0 };
    const previousChecklistSummary =
      previousChecklist.total > 0
        ? `${previousChecklist.passed}/${previousChecklist.total} passed`
        : undefined;

    const requestBody = (phase: "quick" | "detail") =>
      JSON.stringify({
        phase,
        ...(isTextPractice
          ? {}
          : isMultiVisual
            ? { images: currentImages }
            : { image: currentImages[0] }),
        text: text.trim(),
        language: learningLanguage,
        nativeLanguage,
        pattern: patternId,
        ...(previousHistory
          ? {
              previousUserText: previousHistory.userText,
              previousChecklistSummary,
            }
          : {}),
        ...(currentCompare
          ? {
              scenarioPromptJa: currentCompare.promptJa,
              scenarioPromptEn: currentCompare.promptEn,
              compareLabelA: currentCompare.labelA,
              compareLabelB: currentCompare.labelB,
            }
          : currentScenario
            ? {
                scenarioPromptJa: currentScenario.promptJa,
                scenarioPromptEn: currentScenario.promptEn,
              }
            : currentInterview
              ? {
                  scenarioPromptJa: currentInterview.promptJa,
                  scenarioPromptEn: currentInterview.promptEn,
                }
              : currentEmail
                ? {
                    scenarioPromptJa: currentEmail.promptJa,
                    scenarioPromptEn: currentEmail.promptEn,
                    emailType: currentEmail.type,
                    incomingEmailJa: currentEmail.incomingEmailJa,
                    incomingEmailEn: currentEmail.incomingEmailEn,
                  }
                : {}),
      });

    const finalizeFeedback = (result: FeedbackResult) => {
      savePracticeHistory({
        patternId,
        itemKey: currentItemKey,
        itemTitleJa: currentItemTitleJa,
        userText: text.trim(),
        feedback: result,
        learningLanguage,
      });
      appendTextAttempt(currentItemKey, learningLanguage, text.trim());
      setTextAttempts(getTextAttempts(currentItemKey, learningLanguage));
      setPreviousHistory(getLatestPracticeHistory(currentItemKey, learningLanguage));
    };

    try {
      const quickRes = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody("quick"),
      });
      const quickPayload = (await quickRes.json()) as FeedbackQuickResult &
        Partial<FeedbackDetailResult> & { complete?: boolean; error?: string };
      if (!quickRes.ok) {
        throw new Error(quickPayload.error ?? "フィードバックに失敗しました。");
      }

      recordSession();
      refreshSessionUsage();

      if (quickPayload.complete) {
        const result: FeedbackResult = {
          summary: quickPayload.summary ?? "",
          checklist: quickPayload.checklist,
          grade: quickPayload.grade,
          gradeNote: quickPayload.gradeNote,
          sentences: quickPayload.sentences ?? [],
          natural: quickPayload.natural ?? [],
          vocabulary: quickPayload.vocabulary ?? [],
          growthNote: quickPayload.growthNote,
        };
        setFeedback(result);
        finalizeFeedback(result);
        setLoading(false);
        return;
      }

      const quick: FeedbackQuickResult = {
        summary: quickPayload.summary ?? "",
        checklist: quickPayload.checklist,
        grade: quickPayload.grade,
        gradeNote: quickPayload.gradeNote,
      };
      setFeedback({
        ...quick,
        sentences: [],
        natural: [],
        vocabulary: [],
      });
      setLoading(false);
      setLoadingDetail(true);

      try {
        const detailRes = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody("detail"),
        });
        const detailData = (await detailRes.json()) as FeedbackDetailResult;
        if (detailRes.ok) {
          const result: FeedbackResult = { ...quick, ...detailData };
          setFeedback(result);
          if (
            result.sentences.length > 0 ||
            result.natural.some((example) => example.text.trim()) ||
            result.vocabulary.length > 0
          ) {
            finalizeFeedback(result);
          }
        }
      } catch {
        // Keep quick feedback visible without showing an error.
      } finally {
        setLoadingDetail(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "フィードバックに失敗しました。");
      setLoading(false);
      setLoadingDetail(false);
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
    setLoadingDetail(false);
    setSecondsLeft(recordSeconds);
    setError("");
  }

  function handleRetrySameItem() {
    setFeedback(null);
    setComparisonHistory(null);
    setLoadingDetail(false);
    setText("");
    setError("");
  }

  function handleRewriteWithModel() {
    const modelText = feedback?.natural[0]?.text?.trim();
    if (!modelText) return;
    setText(modelText);
    setFeedback(null);
    setComparisonHistory(null);
    setError("");
    showToast("模範例を入力欄にコピーしました。編集して再提出してください。");
  }

  function handleAddToRetryQueue() {
    const modelHint = feedback?.natural[0]?.text?.trim() ?? "";
    const result = addRetryQueueEntry({
      patternId,
      itemKey: currentItemKey,
      itemTitleJa: currentItemTitleJa,
      modelHint,
    });
    refreshRetryQueue();
    showToast(result.ok ? "再挑戦キューに追加しました" : "すでにキューにあります");
  }

  function handleRetryQueueSelect(entry: RetryQueueEntry) {
    navigateToItem(entry.patternId, entry.itemKey);
  }

  function handleRemoveFromRetryQueue(id: string) {
    removeRetryQueueEntry(id);
    refreshRetryQueue();
  }

  function handleToggleBookmark() {
    if (!hasPracticeItem || busy) return;
    const result = toggleBookmark({
      patternId,
      itemKey: currentItemKey,
      itemTitleJa: currentItemTitleJa,
    });
    refreshBookmarks();
    setBookmarked(result.bookmarked);
    showToast(result.bookmarked ? "ブックマークに追加しました" : "ブックマークを解除しました");
  }

  const previousChecklistScore = previousHistory
    ? countChecklistPassed(previousHistory.feedback)
    : null;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:gap-5 md:py-8 md:px-8">
      <header className="flex flex-col gap-3 md:gap-4">
        <div className="sticky top-0 z-40 -mx-4 border-b border-stone-200 bg-[var(--background)]/95 px-4 pb-3 pt-1 backdrop-blur-md md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <PatternNavigator
            patternId={patternId}
            onPatternChange={setPatternId}
            subcategoryId={contentSubcategory}
            onSubcategoryChange={setContentSubcategory}
            disabled={busy}
          />
        </div>

        <div className="hidden flex-wrap items-start justify-between gap-3 md:flex">
          <div className="min-w-0">
            <p className="label-caps">{SITE.appName}</p>
            <p className="mt-0.5 text-xs text-stone-500">{SITE.tagline}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
              {pattern.title}
            </h1>
            {settingsReady && (
              <p className="mt-1.5 text-xs text-stone-500">
                {learningLabel}
                <span className="mx-1.5 text-stone-300">·</span>
                解説: {nativeLabel}
                <Link href="/settings" className="link-accent ml-2">
                  変更
                </Link>
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <BookmarkMenu entries={bookmarks} disabled={busy} />
            <Link href="/settings" className="btn-secondary">
              設定
            </Link>
            <Link
              href="/word-list"
              className={`btn-secondary inline-flex items-center gap-1.5 ${
                wordListEnabled ? "" : "text-stone-500"
              }`}
            >
              単語リスト
              {!wordListEnabled && <IconLock className="h-3.5 w-3.5" />}
            </Link>
          </div>
        </div>

        <div className="md:hidden">
          <h1 className="text-lg font-semibold tracking-tight text-stone-900">{pattern.label}</h1>
          {settingsReady && (
            <p className="mt-1 text-xs text-stone-500">
              {learningLabel}
              <span className="mx-1.5 text-stone-300">·</span>
              解説: {nativeLabel}
            </p>
          )}
        </div>

        <p className="max-w-2xl text-sm leading-7 text-stone-600">{pattern.description}</p>
      </header>

      <PracticeStepIndicator step={practiceStep} loading={loading || transcribing} />

      <RetryQueuePanel
        entries={retryQueue}
        onSelect={handleRetryQueueSelect}
        onRemove={handleRemoveFromRetryQueue}
      />

      {showSessionPicker && (
        <section className="card overflow-hidden lg:hidden">
          <SessionThumbnailGrid
            items={sessionThumbs}
            selectedIndex={index}
            onSelect={applySessionIndex}
            disabled={busy}
            itemCountLabel={itemCount ? `${index + 1} / ${itemCount}` : undefined}
          />
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <section className="card no-select overflow-hidden">
          <div className="hidden lg:block">
            <PracticeVisual
              contentLoading={contentLoading}
              isInterview={isInterview}
              isEmail={isEmail}
              isCompare={isCompare}
              isMultiVisual={isMultiVisual}
              isStory={isStory}
              hasVisual={hasVisual}
              currentInterview={currentInterview}
              currentEmail={currentEmail}
              currentCompare={currentCompare}
              currentScenario={currentScenario}
              currentImages={currentImages}
              recording={recording}
              transcribing={transcribing}
              secondsLeft={secondsLeft}
            />
          </div>
          <div className="hidden items-center justify-between gap-3 px-4 py-3 md:flex">
            <button type="button" className="btn-ghost shrink-0" onClick={() => void nextItem(-1)} disabled={busy}>
              {pattern.navLabel}
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <p className="truncate text-center text-sm text-stone-500">
                {itemCount ? `${index + 1} / ${itemCount}` : "0 / 0"}
                {isStory && currentSet
                  ? ` · ${currentSet.title}`
                  : isCompare && currentCompare
                    ? ` · ${currentCompare.titleJa}`
                    : isRoleplay && currentScenario
                      ? ` · ${currentScenario.categoryJa}`
                      : isInterview && currentInterview
                        ? ` · ${currentInterview.titleJa}`
                        : isEmail && currentEmail
                          ? ` · ${currentEmail.titleJa}`
                          : ""}
              </p>
              <button
                type="button"
                className={`shrink-0 rounded-lg p-1.5 transition-colors ${
                  bookmarked
                    ? "text-amber-700 hover:text-amber-800"
                    : "text-stone-300 hover:text-amber-600"
                }`}
                onClick={handleToggleBookmark}
                disabled={!hasPracticeItem || busy}
                aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
                title={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
              >
                {bookmarked ? <IconStar className="h-5 w-5" /> : <IconStarOutline className="h-5 w-5" />}
              </button>
            </div>
            <button type="button" className="btn-ghost shrink-0" onClick={() => void nextItem(1)} disabled={busy}>
              {isCompare
                ? "次の比較"
                : isStory
                  ? "次のストーリー"
                  : isRoleplay
                    ? "次のシーン"
                    : isInterview
                      ? "次の質問"
                      : isEmail
                        ? "次のメール"
                        : "次の画像"}
            </button>
          </div>
          {showSessionPicker && (
            <div className="hidden lg:block">
              <SessionThumbnailGrid
                items={sessionThumbs}
                selectedIndex={index}
                onSelect={applySessionIndex}
                disabled={busy}
              />
            </div>
          )}
        </section>

        <section className="card flex flex-col gap-4 p-5">
          <div className="notice-accent no-select">
            <p className="label-caps">課題</p>
            {isCompare && currentCompare && <p className="badge-accent mt-2">{currentCompare.titleJa}</p>}
            {isRoleplay && currentScenario && (
              <p className="badge-accent mt-2">{currentScenario.categoryJa}</p>
            )}
            {isInterview && currentInterview && (
              <p className="badge-accent mt-2">{currentInterview.titleJa}</p>
            )}
            {isEmail && currentEmail && (
              <p className="badge-accent mt-2">
                {currentEmail.titleJa}
                {currentEmail.type === "reply" ? "（返信）" : "（新規作成）"}
              </p>
            )}
            <p className="mt-2 leading-7">{taskJa}</p>
            <p className="mt-2 text-xs leading-6 text-stone-500">{taskEn}</p>
          </div>

          <div className="lg:hidden">
            <PracticeVisual
              compact
              contentLoading={contentLoading}
              isInterview={isInterview}
              isEmail={isEmail}
              isCompare={isCompare}
              isMultiVisual={isMultiVisual}
              isStory={isStory}
              hasVisual={hasVisual}
              currentInterview={currentInterview}
              currentEmail={currentEmail}
              currentCompare={currentCompare}
              currentScenario={currentScenario}
              currentImages={currentImages}
              recording={recording}
              transcribing={transcribing}
              secondsLeft={secondsLeft}
            />
          </div>

          <PastAttemptsPanel attempts={textAttempts} disabled={busy} />

          {canChooseRecordDuration && !recording && !transcribing && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-stone-500">録音時間</span>
              <div
                className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5"
                role="group"
                aria-label="録音時間"
              >
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 transition ${
                    recordDuration === RECORD_SECONDS_STANDARD
                      ? "bg-amber-100 font-medium text-amber-900"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                  onClick={() => handleRecordDurationChange(RECORD_SECONDS_STANDARD)}
                  disabled={busy}
                >
                  1分
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 transition ${
                    recordDuration === RECORD_SECONDS_PRO
                      ? "bg-amber-100 font-medium text-amber-900"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                  onClick={() => handleRecordDurationChange(RECORD_SECONDS_PRO)}
                  disabled={busy}
                >
                  2分
                  <span className="ml-1 text-xs text-amber-800">Pro</span>
                </button>
              </div>
            </div>
          )}

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
                {recordSeconds}秒録音する
              </button>
            )}
            {mobile && (
              <button
                type="button"
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                  bookmarked
                    ? "border-amber-300 bg-amber-50 text-amber-700"
                    : "border-stone-200 bg-white text-stone-400 hover:border-amber-200 hover:text-amber-600"
                }`}
                onClick={handleToggleBookmark}
                disabled={!hasPracticeItem || busy}
                aria-label={bookmarked ? "お気に入りを解除" : "お気に入りに追加"}
                title={bookmarked ? "お気に入りを解除" : "お気に入りに追加"}
              >
                {bookmarked ? <IconStar className="h-5 w-5" /> : <IconStarOutline className="h-5 w-5" />}
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
                  ? "音声を解析中..."
                  : loading
                    ? "総評を作成中..."
                    : loadingDetail
                      ? "詳しい添削を読み込み中..."
                      : "または下に直接入力"}
            </span>
          </div>

          {showLastRecording && lastRecordingUrl && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
              <p className="mb-1.5 text-xs font-medium text-stone-600">自分の録音</p>
              <audio controls src={lastRecordingUrl} className="h-10 w-full max-w-md" preload="metadata" />
            </div>
          )}

          <ProcessingStatusBar active={transcribing} phase="transcribe" />
          <ProcessingStatusBar active={loading} phase="feedback-quick" />

          {!recordingOk && (
            <p className="notice-accent">
              このブラウザは録音非対応です。HTTPS 環境の Chrome / Safari を使うか、テキストで入力してください。
            </p>
          )}

          {recording && !livePreview && !previewCapable && (
            <div className="card-muted px-4 py-4 text-sm text-stone-700">
              <p className="font-medium text-red-700">録音中 · 残り {secondsLeft} 秒</p>
              <p className="mt-2 leading-6">
                {mobile
                  ? "iPhone / Android ではリアルタイム文字表示に対応していません。話し終わったら「録音を止める」を押してください。録音後に文字起こしします。"
                  : "リアルタイム表示非対応のブラウザです。録音後に文字起こしします。"}
              </p>
            </div>
          )}

          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="flex flex-wrap items-baseline justify-between gap-2 font-medium text-stone-700">
              <span>
                {outputLabel}
                {livePreview && (
                  <span className="ml-2 text-xs font-normal text-amber-800">プレビュー（確定版は録音後）</span>
                )}
                {livePreview && (
                  <span className="ml-2 text-xs font-normal text-stone-500">母国語は録音後に反映</span>
                )}
              </span>
              {!recording && !transcribing && (
                <span
                  className={`text-xs font-normal tabular-nums ${
                    textOverLimit
                      ? "text-red-600"
                      : text.length > textCharLimit * 0.9
                        ? "text-amber-700"
                        : "text-stone-400"
                  }`}
                >
                  {text.length.toLocaleString("ja-JP")} / {textCharLimit.toLocaleString("ja-JP")}
                </span>
              )}
            </span>
            {recording && !livePreview ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-8 text-center text-sm leading-6 text-stone-500">
                <IconMic className={`h-8 w-8 text-stone-400 ${recording ? "mic-pulse" : ""}`} />
                <p className="mt-3 font-medium text-stone-700">録音中...</p>
                <p className="mt-1">終了後、この欄に文字が入ります</p>
              </div>
            ) : transcribing ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-8 text-center text-sm leading-6 text-stone-600">
                <IconSparkles className="h-8 w-8 text-amber-700" />
                <p className="mt-3 font-medium text-amber-900">音声を解析しています</p>
                <p className="mt-1">完了するとここに文字が入ります</p>
              </div>
            ) : (
              <textarea
                className={`min-h-40 flex-1 resize-y rounded-2xl border px-3 py-2 leading-6 ${
                  textOverLimit
                    ? "border-red-300 bg-red-50/40"
                    : livePreview
                      ? "border-amber-200 bg-amber-50/60 text-stone-700"
                      : "border-stone-200 bg-stone-50"
                }`}
                placeholder={
                  isEmail
                    ? "件名・挨拶・本文・結びを意識してメールを書いてください。録音も使えます。"
                    : mobile
                      ? "録音を止めるとここへ文字起こしされます。忘れた語は母国語で話してもOKです。"
                      : "話している間ここに文字が出ます。忘れた語は母国語で話してもOK — 録音後に確定版に更新します。"
                }
                value={text}
                maxLength={textCharLimit}
                readOnly={livePreview || transcribing}
                onChange={(e) => setText(e.target.value)}
              />
            )}
          </label>

          {textOverLimit && !recording && (
            <p className="notice-error">{textLimitMessage(textCharLimit)}</p>
          )}

          {mixedLanguage && !recording && (
            <p className="notice-muted">
              母国語混在を検出しました。添削で学ぶ言語の言い方を確認できます。
            </p>
          )}

          {previousHistory && !feedback && (
            <p className="notice-muted">
              前回の挑戦あり
              {previousChecklistScore && previousChecklistScore.total > 0
                ? ` · チェック ${previousChecklistScore.passed}/${previousChecklistScore.total}`
                : ""}
              。もう一度添削すると、前回との比較が表示されます。
            </p>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={requestFeedback}
            disabled={!text.trim() || busy || textOverLimit || (FREE_TIER_ENABLED && !sessionUsage.canUse)}
          >
            {loading ? "総評を作成中..." : loadingDetail ? "詳細を読み込み中..." : pattern.feedbackButton}
          </button>

          {FREE_TIER_ENABLED && (
            <>
              <p className="text-xs text-stone-500">
                無料枠: 今日あと {sessionUsage.dailyRemaining}/{FREE_DAILY_LIMIT} 回 · 今月あと{" "}
                {sessionUsage.monthlyRemaining}/{FREE_MONTHLY_LIMIT} 回
              </p>
              {!sessionUsage.canUse && (
                <p className="notice-accent">{sessionLimitMessage(sessionUsage)}</p>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-700">{error}</p>}
        </section>
      </div>

      {feedback && (
        <section
          ref={feedbackSectionRef}
          className="card flex scroll-mt-6 flex-col gap-4 p-5"
        >
          <FeedbackActions
            onRetry={handleRetrySameItem}
            onRewriteWithModel={handleRewriteWithModel}
            onAddToQueue={handleAddToRetryQueue}
            inQueue={inRetryQueue}
          />

          {comparisonHistory && !loadingDetail && (
            <PracticeGrowthPanel
              previous={comparisonHistory}
              currentText={text.trim()}
              feedback={feedback}
            />
          )}

          {supportsChecklist && feedback.checklist && feedback.checklist.length > 0 && (
            <FeedbackChecklist items={feedback.checklist} />
          )}

          {loadingDetail && (
            <ProcessingStatusBar active={loadingDetail} phase="feedback-detail" />
          )}

          <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-stone-900">フィードバック</h2>
            {wordListEnabled && !loadingDetail && (
              <p className="mb-3 text-xs text-stone-500">
                {mobile
                  ? "例文を長押しして範囲を選び、下のボタンで単語リストに追加できます"
                  : "例文を選択すると単語リストに追加できます"}
              </p>
            )}
            {loadingDetail && feedback.sentences.length === 0 ? (
              <FeedbackDetailSkeleton />
            ) : (
            <ul className="space-y-3">
              {feedback.sentences.map((item, i) => {
                const needsFix = item.fixed.trim() !== item.original.trim();
                return (
                  <li key={`${item.original}-${i}`} className="rounded-2xl bg-stone-50 p-3 text-sm">
                    <SentenceCorrection
                      original={item.original}
                      fixed={item.fixed}
                      language={learningLanguage}
                      allowAdd={wordListEnabled}
                      onToast={showToast}
                      speakId={`sentence-${currentItemKey}-${i}`}
                    />
                    <p className={`mt-1 ${needsFix ? "text-stone-600" : "text-emerald-700"}`}>
                      {item.comment}
                    </p>
                  </li>
                );
              })}
            </ul>
            )}
            <SelectableText
              text={feedback.summary}
              language={learningLanguage}
              source="総評"
              className="mt-4 text-sm leading-6 text-stone-600"
              allowAdd={wordListEnabled}
              onToast={showToast}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-stone-900">{pattern.naturalTitle}</h2>
              {wordListEnabled && !loadingDetail && (
                <p className="mb-3 text-xs text-stone-500">
                  {mobile
                    ? "例文を長押しして範囲を選び、下のボタンで単語リストに追加できます"
                    : "例文を選択すると単語リストに追加できます"}
                </p>
              )}
              {loadingDetail && feedback.natural.length === 0 ? (
                <FeedbackNaturalSkeleton />
              ) : (
              <div className="flex flex-col gap-3">
                {feedback.natural
                  .filter((example) => example.text.trim())
                  .map((example, i) =>
                    supportsChecklist && example.sections?.length ? (
                      <StructuredNaturalExample
                        key={`natural-${i}`}
                        example={example}
                        index={i}
                        language={learningLanguage}
                        sourceLabel={pattern.naturalTitle}
                        allowAdd={wordListEnabled}
                        onToast={showToast}
                        speakIdPrefix={`natural-${currentItemKey}`}
                      />
                    ) : (
                      <div key={`natural-${i}`} className="rounded-2xl bg-amber-50 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-amber-900">例 {i + 1}</p>
                          <SpeakButton
                            text={example.text}
                            languageId={learningLanguage}
                            speakId={`natural-${currentItemKey}-${i}`}
                            label={`例${i + 1}を読み上げ`}
                          />
                        </div>
                        <SelectableText
                          text={example.text}
                          language={learningLanguage}
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
                    )
                  )}
              </div>
              )}
            </div>
            {!loadingDetail && feedback.vocabulary.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-stone-900">この場面で使える語彙</h3>
                {wordListEnabled && (
                  <p className="mb-2 text-xs text-stone-500">タップで単語リストに追加</p>
                )}
                <ul className="flex flex-wrap gap-2">
                  {feedback.vocabulary.map((item, i) => {
                    const vocabKey = `${item.term}::${item.note}`;
                    const added = addedVocabKeys.has(vocabKey);
                    return (
                    <li key={`${item.term}-${i}`}>
                      {wordListEnabled ? (
                        <button
                          type="button"
                          className={`rounded-xl px-3 py-2 text-left text-sm transition active:scale-[0.98] ${
                            added
                              ? "bg-amber-200 ring-2 ring-amber-400 text-amber-950"
                              : "bg-stone-100 hover:bg-amber-100 hover:ring-1 hover:ring-amber-300 active:bg-amber-200"
                          }`}
                          title={`${item.note} — タップで追加`}
                          onClick={() => addVocabulary(item.term, item.note)}
                        >
                          <span className="font-medium">{item.term}</span>
                          <span className={added ? "text-amber-900" : "text-stone-500"}>
                            {" "}
                            · {item.note}
                          </span>
                          <span className={`ml-1 text-xs ${added ? "text-amber-800" : "text-amber-800"}`}>
                            {added ? "✓" : "＋"}
                          </span>
                        </button>
                      ) : (
                        <span className="rounded-xl bg-stone-100 px-3 py-2 text-sm">
                          <span className="font-medium text-stone-900">{item.term}</span>
                          <span className="text-stone-500"> · {item.note}</span>
                        </span>
                      )}
                    </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          </div>

          {feedback.grade && (
            <FeedbackGradeBadge grade={feedback.grade} gradeNote={feedback.gradeNote} />
          )}
        </section>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <footer className="border-t border-stone-200 pt-4 text-center text-xs text-stone-500">
        <Link href="/privacy" className="link-accent">
          プライバシーポリシー
        </Link>
        <span className="mx-2 text-stone-300">·</span>
        <Link href="/terms" className="link-accent">
          利用規約
        </Link>
      </footer>
    </main>
  );
}

function FeedbackDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {[0, 1, 2].map((item) => (
        <div key={item} className="rounded-2xl bg-stone-50 p-3">
          <div className="h-4 w-4/5 rounded bg-stone-200" />
          <div className="mt-2 h-3 w-full rounded bg-stone-100" />
          <div className="mt-2 h-3 w-2/3 rounded bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

function FeedbackNaturalSkeleton() {
  return (
    <div className="animate-pulse space-y-3" aria-hidden>
      {[0, 1].map((item) => (
        <div key={item} className="rounded-2xl bg-amber-50 p-4">
          <div className="mb-3 h-3 w-16 rounded bg-amber-100" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-amber-100" />
            <div className="h-3 w-full rounded bg-amber-100" />
            <div className="h-3 w-4/5 rounded bg-amber-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function resolveNavigateTarget(
  targetPatternId: PatternId,
  itemKey: string,
  data: {
    images: string[];
    stories: StorySet[];
    compareSets: CompareSet[];
    roleplayScenarios: RoleplayScenario[];
    interviewQuestions: InterviewQuestion[];
    emailScenarios: EmailScenario[];
  }
): { subcategory?: ContentSubcategoryId; index: number } {
  if (targetPatternId === "interview") {
    const question = data.interviewQuestions.find((q) => `interview:${q.id}` === itemKey);
    if (!question) return { index: 0 };
    const filtered = data.interviewQuestions.filter((q) => q.context === question.context);
    const resolvedIndex = filtered.findIndex((q) => q.id === question.id);
    return { subcategory: question.context, index: resolvedIndex >= 0 ? resolvedIndex : 0 };
  }

  if (targetPatternId === "email") {
    const scenario = data.emailScenarios.find((s) => `email:${s.id}` === itemKey);
    if (!scenario) return { index: 0 };
    const filtered = data.emailScenarios.filter((s) => s.context === scenario.context);
    const resolvedIndex = filtered.findIndex((s) => s.id === scenario.id);
    return { subcategory: scenario.context, index: resolvedIndex >= 0 ? resolvedIndex : 0 };
  }

  return { index: findIndexByItemKey(targetPatternId, itemKey, data) };
}
