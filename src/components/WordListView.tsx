"use client";

import Link from "next/link";
import { LANGUAGES } from "@/lib/languages";
import { useWordList } from "@/lib/use-word-list";

export function WordListView() {
  const { entries, removeEntry, updateNote } = useWordList();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm font-medium text-amber-800 hover:underline">
          ← 練習に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">単語リスト</h1>
        <p className="text-sm leading-6 text-stone-600">
          フィードバックや語彙から追加した単語・フレーズがここに保存されます。この端末のブラウザに保存されます。
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">まだ登録がありません。</p>
          <p className="mt-2 text-sm text-stone-500">
            練習後の「この場面で使える語彙」をタップするか、例文を選択して追加できます。
          </p>
          <Link href="/" className="btn-primary mt-6 inline-block">
            練習を始める
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => {
            const langLabel =
              LANGUAGES.find((lang) => lang.id === entry.language)?.label ?? entry.language;
            return (
              <li
                key={entry.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">{entry.term}</p>
                    <label className="mt-2 block text-sm">
                      <span className="sr-only">メモ</span>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm"
                        placeholder="メモ（任意）"
                        defaultValue={entry.note}
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
                  <button
                    type="button"
                    className="btn-ghost shrink-0 text-red-700"
                    onClick={() => removeEntry(entry.id)}
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
