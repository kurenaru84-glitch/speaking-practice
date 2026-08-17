import Link from "next/link";
import { SITE } from "@/lib/site";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function LegalPageLayout({ title, children }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="flex flex-col gap-2 border-b border-stone-200 pb-6">
        <Link href="/" className="link-accent">
          ← {SITE.appName} に戻る
        </Link>
        <p className="label-caps">{SITE.appName}</p>
        <h1 className="text-2xl font-semibold text-stone-900">{title}</h1>
      </header>
      <article className="legal-prose">{children}</article>
      <footer className="border-t border-stone-200 pt-6 text-sm text-stone-500">
        <p>
          お問い合わせ:{" "}
          <a href={`mailto:${SITE.contactEmail}`} className="link-accent">
            {SITE.contactEmail}
          </a>
        </p>
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
