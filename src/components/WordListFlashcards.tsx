"use client";

import { useState } from "react";
import type { WordListEntry } from "@/lib/word-list";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type WordListFlashcardsProps = {
  entries: WordListEntry[];
  onSetLearned: (id: string, learned: boolean) => void;
  onClose: () => void;
};

export function WordListFlashcards({ entries, onSetLearned, onClose }: WordListFlashcardsProps) {
  const [deckIds] = useState(() =>
    shuffle(entries.filter((entry) => !entry.learned).map((entry) => entry.id))
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const current = entries.find((entry) => entry.id === deckIds[index]);

  function nextCard(learned: boolean) {
    if (!current) return;
    onSetLearned(current.id, learned);
    setFlipped(false);
    setIndex((prev) => prev + 1);
  }

  if (deckIds.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <p className="text-sm text-stone-600">学習中の単語がありません。すべて覚え済みです。</p>
        <button type="button" className="btn-ghost mt-4" onClick={onClose}>
          閉じる
        </button>
      </section>
    );
  }

  if (index >= deckIds.length || !current) {
    return (
      <section className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-200">
        <p className="font-medium text-emerald-900">このラウンド完了！</p>
        <p className="mt-2 text-sm text-emerald-800">{deckIds.length} 語をテストしました。</p>
        <button type="button" className="btn-primary mt-4" onClick={onClose}>
          閉じる
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-700">
          暗記テスト · {index + 1} / {deckIds.length}
        </p>
        <button type="button" className="btn-ghost" onClick={onClose}>
          終了
        </button>
      </div>

      <button
        type="button"
        className="flex min-h-44 w-full flex-col items-center justify-center rounded-2xl bg-amber-50 px-6 py-8 text-center transition hover:bg-amber-100/80"
        onClick={() => setFlipped((prev) => !prev)}
      >
        {!flipped ? (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">表</p>
            <p className="mt-3 text-lg font-semibold leading-8 text-stone-900">{current.term}</p>
            <p className="mt-4 text-xs text-stone-500">タップして裏を見る</p>
          </>
        ) : (
          <>
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800">裏</p>
            <p className="mt-3 text-base leading-7 text-stone-800">
              {current.note.trim() || "（メモなし）"}
            </p>
          </>
        )}
      </button>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary flex-1 bg-emerald-700 hover:bg-emerald-800"
          onClick={() => nextCard(true)}
        >
          覚えた
        </button>
        <button
          type="button"
          className="btn-primary flex-1 bg-stone-700 hover:bg-stone-800"
          onClick={() => nextCard(false)}
        >
          まだ
        </button>
      </div>
    </section>
  );
}
