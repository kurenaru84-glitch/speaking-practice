"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LanguageId } from "@/lib/languages";
import { useWordList } from "@/lib/use-word-list";

type SelectableTextProps = {
  text: string;
  language: LanguageId;
  source: string;
  className?: string;
  inline?: boolean;
  allowAdd?: boolean;
  onToast?: (message: string) => void;
};

export function SelectableText({
  text,
  language,
  source,
  className = "",
  inline = false,
  allowAdd = true,
  onToast,
}: SelectableTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { addEntry } = useWordList();
  const [popup, setPopup] = useState<{ x: number; y: number; text: string } | null>(null);

  const clearPopup = useCallback(() => setPopup(null), []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !containerRef.current) {
      clearPopup();
      return;
    }

    const selected = selection.toString().trim();
    if (!selected || selected.length > 200) {
      clearPopup();
      return;
    }

    const anchor = selection.anchorNode;
    const focus = selection.focusNode;
    if (
      !anchor ||
      !focus ||
      !containerRef.current.contains(anchor) ||
      !containerRef.current.contains(focus)
    ) {
      clearPopup();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopup({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: selected,
    });
  }, [clearPopup]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-add-word-popup]")) return;
      clearPopup();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [clearPopup]);

  function handleAdd() {
    if (!popup || !allowAdd) return;
    const result = addEntry({
      term: popup.text,
      language,
      source,
    });
    onToast?.(result.ok ? "単語リストに追加しました" : "すでに登録済みです");
    window.getSelection()?.removeAllRanges();
    clearPopup();
  }

  const Tag = inline ? "span" : "div";

  return (
    <>
      <Tag
        ref={containerRef}
        className={`select-text ${className}`}
        onMouseUp={handleSelection}
        onTouchEnd={handleSelection}
      >
        {text}
      </Tag>
      {popup && allowAdd && (
        <button
          type="button"
          data-add-word-popup
          className="fixed z-50 -translate-x-1/2 -translate-y-full rounded-full bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ left: popup.x, top: popup.y - 8 }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleAdd}
        >
          ＋ 単語リストに追加
        </button>
      )}
    </>
  );
}
