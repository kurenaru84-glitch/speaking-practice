"use client";

import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
};

export function PracticeImage({ src, alt, className }: Props) {
  const [readySrc, setReadySrc] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      if (!cancelled) setReadySrc(src);
    };
    img.onerror = () => {
      if (!cancelled) setReadySrc(src);
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!readySrc) {
    return <div className={`animate-pulse bg-stone-200 ${className ?? ""}`} aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={readySrc}
      alt={alt}
      className={className}
      decoding="async"
      fetchPriority="high"
    />
  );
}

function preloadImage(src: string) {
  if (!src) return;
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

export function preloadImages(sources: string[]) {
  for (const src of sources) {
    preloadImage(src);
  }
}
