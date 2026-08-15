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

type PopupState = {
  x: number;
  y: number;
  text: string;
  placement: "above" | "below";
};

function isTouchUi() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export function SelectableText({
  text,
  language,
  source,
  className = "",
  inline = false,
  allowAdd = true,
  onToast,
}: SelectableTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const selectionTimerRef = useRef<number | null>(null);
  const { addEntry } = useWordList();
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [touchUi, setTouchUi] = useState(false);

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
    if (rect.width === 0 && rect.height === 0) {
      clearPopup();
      return;
    }

    const useBottomBar = isTouchUi();
    const placement = useBottomBar || rect.top < 72 ? "below" : "above";

    setPopup({
      x: Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80),
      y: placement === "above" ? rect.top : rect.bottom,
      text: selected,
      placement,
    });
  }, [clearPopup]);

  const scheduleSelectionCheck = useCallback(() => {
    if (selectionTimerRef.current) {
      window.clearTimeout(selectionTimerRef.current);
    }
    selectionTimerRef.current = window.setTimeout(() => {
      selectionTimerRef.current = null;
      handleSelection();
    }, 120);
  }, [handleSelection]);

  useEffect(() => {
    setTouchUi(isTouchUi());
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", scheduleSelectionCheck);
    return () => {
      document.removeEventListener("selectionchange", scheduleSelectionCheck);
      if (selectionTimerRef.current) {
        window.clearTimeout(selectionTimerRef.current);
      }
    };
  }, [scheduleSelectionCheck]);

  useEffect(() => {
    function shouldIgnoreTarget(target: Node | null) {
      if (!target) return false;
      if (containerRef.current?.contains(target)) return true;
      if (target instanceof Element && target.closest("[data-add-word-popup]")) return true;
      return false;
    }

    function handleDismiss(e: Event) {
      const target = e.target as Node | null;
      if (shouldIgnoreTarget(target)) return;
      clearPopup();
    }

    document.addEventListener("mousedown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
    };
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

  function keepSelection(event: React.SyntheticEvent) {
    event.preventDefault();
  }

  const preview =
    popup && popup.text.length > 36 ? `${popup.text.slice(0, 36)}…` : popup?.text;

  return (
    <>
      <span
        ref={containerRef}
        className={`select-text ${inline ? "" : "block"} ${className}`}
        onMouseUp={scheduleSelectionCheck}
        onTouchEnd={scheduleSelectionCheck}
      >
        {text}
      </span>
      {popup && allowAdd && touchUi ? (
        <div
          data-add-word-popup
          className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <p className="mb-2 truncate text-xs text-stone-500">選択: {preview}</p>
          <button
            type="button"
            className="w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white"
            onMouseDown={keepSelection}
            onTouchStart={keepSelection}
            onClick={handleAdd}
          >
            ＋ 単語リストに追加
          </button>
        </div>
      ) : (
        popup &&
        allowAdd && (
          <button
            type="button"
            data-add-word-popup
            className="fixed z-[60] -translate-x-1/2 rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
            style={{
              left: popup.x,
              top: popup.placement === "above" ? popup.y - 8 : popup.y + 8,
              transform:
                popup.placement === "above"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
            onMouseDown={keepSelection}
            onTouchStart={keepSelection}
            onClick={handleAdd}
          >
            ＋ 単語リストに追加
          </button>
        )
      )}
    </>
  );
}
