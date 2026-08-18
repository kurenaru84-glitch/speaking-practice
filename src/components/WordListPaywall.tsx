import Link from "next/link";

export function WordListPaywall() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-4 md:px-8 md:py-8">
      <header className="flex flex-col gap-3">
        <Link href="/" className="hidden text-sm font-medium text-amber-800 hover:underline md:inline">
          ← 練習に戻る
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">単語リスト</h1>
      </header>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <p className="text-sm font-medium text-amber-900">有料プラン限定機能</p>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          単語リスト（手動追加・自動翻訳・暗記テスト）は Standard / Pro プランで利用できます。
          無料版ではスピーキング練習とフィードバック（1日2回・月8回まで）をお試しいただけます。
        </p>
        <ul className="mt-4 space-y-2 text-sm text-stone-600">
          <li>・Standard: 月60セッション + 単語リスト</li>
          <li>・Pro: より多くのセッション + 単語リスト</li>
        </ul>
        <p className="mt-4 text-xs text-stone-500">課金機能は準備中です。</p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          練習に戻る
        </Link>
      </section>
    </main>
  );
}
