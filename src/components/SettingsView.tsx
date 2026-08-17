"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLearningLanguage,
  getNativeLanguage,
  LEARNING_LANGUAGES,
  NATIVE_LANGUAGES,
  type LearningLanguageId,
  type NativeLanguageId,
} from "@/lib/languages";
import { SITE } from "@/lib/site";
import { useSettings } from "@/lib/use-settings";

export function SettingsView() {
  const { settings, setSettings, ready } = useSettings();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setDraft(settings);
  }, [ready, settings]);

  function handleSave() {
    setSettings(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <p className="text-sm text-stone-500">読み込み中...</p>
      </main>
    );
  }

  const learning = getLearningLanguage(draft.learningLanguage);
  const native = getNativeLanguage(draft.nativeLanguage);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <Link href="/" className="link-accent">
          ← 練習に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">設定</h1>
        <p className="text-sm leading-6 text-stone-600">
          学ぶ言語と母国語を選びます。話す練習は学ぶ言語、添削の解説・コメント・例文の訳は母国語で表示されます。
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-stone-700">学ぶ言語</span>
          <span className="text-xs text-stone-500">録音・文字起こし・添削の例文はこの言語</span>
          <select
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
            value={draft.learningLanguage}
            onChange={(e) =>
              setDraft({
                ...draft,
                learningLanguage: e.target.value as LearningLanguageId,
              })
            }
          >
            {LEARNING_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-stone-700">母国語</span>
          <span className="text-xs text-stone-500">添削コメント・語彙メモ・例文の訳はこの言語</span>
          <select
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2"
            value={draft.nativeLanguage}
            onChange={(e) =>
              setDraft({
                ...draft,
                nativeLanguage: e.target.value as NativeLanguageId,
              })
            }
          >
            {NATIVE_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-stone-700">
          <p className="font-medium text-amber-900">プレビュー</p>
          <p className="mt-1">
            {learning.label} を学び、解説は {native.label}
          </p>
        </div>

        <button type="button" className="btn-primary" onClick={handleSave}>
          {saved ? "保存しました" : "設定を保存"}
        </button>
      </section>

      <footer className="text-center text-xs text-stone-500">
        <p>{SITE.operator}</p>
        <p className="mt-2">
          <Link href="/privacy" className="link-accent">
            プライバシーポリシー
          </Link>
          <span className="mx-2 text-stone-300">·</span>
          <Link href="/terms" className="link-accent">
            利用規約
          </Link>
        </p>
      </footer>
    </main>
  );
}
