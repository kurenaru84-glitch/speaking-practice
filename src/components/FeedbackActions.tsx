"use client";

type Props = {
  onRetry: () => void;
  onRewriteWithModel: () => void;
  onAddToQueue: () => void;
  inQueue: boolean;
};

export function FeedbackActions({ onRetry, onRewriteWithModel, onAddToQueue, inQueue }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-ghost text-sm" onClick={onRetry}>
        もう一度挑戦
      </button>
      <button type="button" className="btn-ghost text-sm" onClick={onRewriteWithModel}>
        模範例を参考にリライト
      </button>
      <button
        type="button"
        className="btn-ghost text-sm"
        onClick={onAddToQueue}
        disabled={inQueue}
      >
        {inQueue ? "再挑戦キューに追加済み" : "再挑戦キューに追加"}
      </button>
    </div>
  );
}
