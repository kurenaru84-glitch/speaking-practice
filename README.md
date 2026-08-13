# Picture Speaking

画像を見て 1 分で英語・ドイツ語などを話す練習アプリです。

## 使い方（Mac ローカル）

Finder で **スピーキング練習** をダブルクリック（初回は右クリック → 開く）。  
Gemini API キーは `.env.local` の `GEMINI_API_KEY=` に入れます。

## スマホで使う（GitHub → Vercel）

1. GitHub に push する
2. [Vercel](https://vercel.com) でリポジトリを Import
3. Environment Variables に `GEMINI_API_KEY` を追加
4. Deploy 後、スマホで URL を開く
5. Safari / Chrome の **ホーム画面に追加** でアプリのように使える

## 練習パターン

| パターン | フォルダ |
|---------|---------|
| 状況説明 | `public/images/describe/` |
| ストーリー | `public/images/story/セット名/`（01.jpg, 02.jpg...） |
| 推測・予測 | `public/images/speculate/` |
| ロールプレイ | `public/images/roleplay/` |

`.jpg` / `.png` / `.webp` を入れると一覧に出ます。

## 音声の仕組み

- **録音中**: ブラウザの Web Speech API でリアルタイムプレビュー
- **録音後**: Gemini が音声全体を文字起こしして確定版に更新（精度が高い）

## 構成

- `src/components/SpeakingPractice.tsx` … 画面
- `src/lib/use-recorder.ts` … 60秒録音
- `src/lib/use-live-preview.ts` … リアルタイムプレビュー
- `src/app/api/transcribe/route.ts` … Gemini 音声文字起こし
- `src/lib/patterns.ts` … 練習パターンとプロンプト
- `src/lib/gemini.ts` … 添削 API
