"use client";

export function ContentLoadingSkeleton({ className = "aspect-[4/3]" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-stone-200 ${className}`} role="status" aria-label="読み込み中">
      <span className="sr-only">読み込み中...</span>
    </div>
  );
}
