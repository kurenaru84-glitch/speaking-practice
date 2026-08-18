"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGES, type LanguageId } from "@/lib/languages";
import { canUseWordList, getPlan } from "@/lib/plan";
import { useWordList } from "@/lib/use-word-list";
import { WordListFlashcards } from "@/components/WordListFlashcards";
import { WordListPaywall } from "@/components/WordListPaywall";
import { SpeakButton } from "@/components/SpeakButton";

type Filter = "all" | "learning" | "learned";

export function WordListView() {
  const [wordListEnabled] = useState(() => canUseWordList(getPlan()));
  const { entries, addEntry, removeEntry, updateNote, setLearned, translateNote } = useWordList();
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const [testMode, setTestMode] = useState(false);
  const [newTerm, setNewTerm] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newLanguage, setNewLanguage] = useState<LanguageId>("en-US");
  const [addError, setAddError] = useState("");
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const entry of entries) {
      if (entry.note.trim() || requestedRef.current.has(entry.id)) continue;
      requestedRef.current.add(entry.id);
      setTranslatingIds((prev) => new Set(prev).add(entry.id));
      void translateNote(entry.id, entry.term, entry.language).finally(() => {
        setTranslatingIds((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        });
      });
    }
  }, [entries, translateNote]);

  const counts = useMemo(
    () => ({
      all: entries.length,
      learning: entries.filter((e) => !e.learned).length,
      learned: entries.filter((e) => e.learned).length,
    }),
    [entries]
  );

  const filtered = useMemo(() => {
    if (filter === "learning") return entries.filter((e) => !e.learned);
    if (filter === "learned") return entries.filter((e) => e.learned);
    return entries;
  }, [entries, filter]);

  function handleManualAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const term = newTerm.trim();
    if (!term) {
      setAddError("単語またはフレーズを入力してください。");
      return;
    }
    const result = addEntry({
      term,
      note: newNote.trim(),
      language: newLanguage,
      source: "手動追加",
      autoTranslate: !newNote.trim(),
    });
    if (!result.ok) {
      setAddError("すでに登録済みです。");
      return;
    }
    setNewTerm("");
    setNewNote("");
  }

  if (!wordListEnabled) {
    return <WordListPaywall />;
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-4 md:px-8 md:py-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="hidden text-sm font-medium text-amber-800 hover:underline md:inline">
          ← 練習に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">単語リスト</h1>
        <p className="text-sm leading-6 text-stone-600">
          練習から追加した語句や、自分で入力した語句を管理できます。メモが空の項目は設定の母国語で自動訳を付けます。
        </p>
      </header>

      <form
        onSubmit={handleManualAdd}
        className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
      >
        <h2 className="text-sm font-semibold text-stone-900">単語を追加</h2>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">単語・フレーズ</span>
            <input
              type="text"
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
              placeholder="例: take an order"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">メモ（任意）</span>
            <input
              type="text"
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
              placeholder="空欄なら自動翻訳"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">言語</span>
            <select
              className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value as LanguageId)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
          {addError && <p className="text-sm text-red-700">{addError}</p>}
          <button type="submit" className="btn-primary self-start">
            追加する
          </button>
        </div>
      </form>

      {entries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "すべて"],
              ["learning", "学習中"],
              ["learned", "覚えた"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                filter === id
                  ? "bg-amber-700 text-white"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {label} ({counts[id]})
            </button>
          ))}
          <button
            type="button"
            className="ml-auto rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white"
            onClick={() => setTestMode((prev) => !prev)}
          >
            {testMode ? "リスト表示" : "暗記テスト"}
          </button>
        </div>
      )}

      {testMode && entries.length > 0 ? (
        <WordListFlashcards
          entries={entries}
          onSetLearned={setLearned}
          onClose={() => setTestMode(false)}
        />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">
            {entries.length === 0
              ? "まだ登録がありません。上のフォームから追加できます。"
              : "このカテゴリの単語はありません。"}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((entry) => {
            const langLabel =
              LANGUAGES.find((lang) => lang.id === entry.language)?.label ?? entry.language;
            const isTranslating = translatingIds.has(entry.id);
            return (
              <li
                key={entry.id}
                className={`rounded-2xl p-4 shadow-sm ring-1 ${
                  entry.learned
                    ? "border-l-4 border-emerald-500 bg-emerald-50/60 ring-emerald-100"
                    : "bg-white ring-stone-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`font-medium ${
                          entry.learned ? "text-emerald-900" : "text-stone-900"
                        }`}
                      >
                        {entry.term}
                      </p>
                      <SpeakButton
                        text={entry.term}
                        languageId={entry.language}
                        speakId={`word-${entry.id}`}
                        label={`${entry.term}を読み上げ`}
                      />
                      {entry.learned ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          覚えた
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                          学習中
                        </span>
                      )}
                    </div>
                    <label className="mt-2 block text-sm">
                      <span className="sr-only">メモ</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stone-200 bg-white/80 px-3 py-1.5 text-sm"
                        placeholder={isTranslating ? "翻訳中..." : "メモ（任意）"}
                        defaultValue={entry.note}
                        disabled={isTranslating}
                        key={`${entry.id}-${entry.note}`}
                        onBlur={(e) => {
                          if (e.target.value !== entry.note) {
                            updateNote(entry.id, e.target.value);
                          }
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs text-stone-500">
                      {langLabel} · {entry.source}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <button
                      type="button"
                      className="btn-ghost text-xs"
                      onClick={() => setLearned(entry.id, !entry.learned)}
                    >
                      {entry.learned ? "学習中に戻す" : "覚えたにする"}
                    </button>
                    <button
                      type="button"
                      className="btn-ghost text-xs text-red-700"
                      onClick={() => removeEntry(entry.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
