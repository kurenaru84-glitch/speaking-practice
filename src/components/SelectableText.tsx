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

function isNodeInContainer(node: Node | null, container: HTMLElement) {
  if (!node) return false;
  if (node === container) return true;
  return container.contains(node);
}

function estimateRows(text: string) {
  const lines = text.split("\n").length;
  return Math.min(12, Math.max(2, lines + Math.ceil(text.length / 48)));
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
  const containerRef = useRef<HTMLElement>(null);
  const selectionTimerRef = useRef<number | null>(null);
  const { addEntry } = useWordList();
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [touchUi, setTouchUi] = useState(false);

  const clearPopup = useCallback(() => {
    setPopup(null);
  }, []);

  const showPopup = useCallback((selected: string, rect?: DOMRect) => {
    const useBottomBar = isTouchUi();
    const placement = useBottomBar || !rect || rect.top < 72 ? "below" : "above";
    setPopup({
      x: rect
        ? Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80)
        : window.innerWidth / 2,
      y: rect ? (placement === "above" ? rect.top : rect.bottom) : 0,
      text: selected,
      placement,
    });
  }, []);

  const handleTextareaSelection = useCallback(() => {
    const el = containerRef.current;
    if (!el || !(el instanceof HTMLTextAreaElement)) {
      clearPopup();
      return;
    }

    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) {
      clearPopup();
      return;
    }

    const selected = el.value.slice(selectionStart, selectionEnd).trim();
    if (!selected || selected.length > 200) {
      clearPopup();
      return;
    }

    showPopup(selected);
  }, [clearPopup, showPopup]);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    const container = containerRef.current;
    if (!selection || selection.isCollapsed || !container) {
      clearPopup();
      return;
    }

    const selected = selection.toString().trim();
    if (!selected || selected.length > 200) {
      clearPopup();
      return;
    }

    if (
      !isNodeInContainer(selection.anchorNode, container) ||
      !isNodeInContainer(selection.focusNode, container)
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

    showPopup(selected, rect);
  }, [clearPopup, showPopup]);

  const scheduleSelectionCheck = useCallback(
    (delay = 120) => {
      if (selectionTimerRef.current) {
        window.clearTimeout(selectionTimerRef.current);
      }
      selectionTimerRef.current = window.setTimeout(() => {
        selectionTimerRef.current = null;
        if (containerRef.current instanceof HTMLTextAreaElement) {
          handleTextareaSelection();
        } else {
          handleSelection();
        }
      }, delay);
    },
    [handleSelection, handleTextareaSelection]
  );

  useEffect(() => {
    setTouchUi(isTouchUi());
  }, []);

  useEffect(() => {
    if (popup && touchUi && allowAdd) {
      document.body.dataset.wordSelectOpen = "1";
    } else {
      delete document.body.dataset.wordSelectOpen;
    }
    return () => {
      delete document.body.dataset.wordSelectOpen;
    };
  }, [popup, touchUi, allowAdd]);

  useEffect(() => {
    if (touchUi) return;

    const onSelectionChange = () => scheduleSelectionCheck(120);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      if (selectionTimerRef.current) {
        window.clearTimeout(selectionTimerRef.current);
      }
    };
  }, [scheduleSelectionCheck, touchUi]);

  function handleAdd() {
    if (!popup || !allowAdd) return;
    const result = addEntry({
      term: popup.text,
      language,
      source,
    });
    onToast?.(result.ok ? "単語リストに追加しました" : "すでに登録済みです");
    window.getSelection()?.removeAllRanges();
    if (containerRef.current instanceof HTMLTextAreaElement) {
      containerRef.current.setSelectionRange(0, 0);
    }
    clearPopup();
  }

  function keepSelection(event: React.SyntheticEvent) {
    event.preventDefault();
  }

  const preview =
    popup && popup.text.length > 36 ? `${popup.text.slice(0, 36)}…` : popup?.text;

  const useMobileTextarea = touchUi && allowAdd;
  const sharedClassName = `${inline ? "" : "block"} ${className}`;

  return (
    <>
      {useMobileTextarea ? (
        <textarea
          ref={containerRef as React.RefObject<HTMLTextAreaElement>}
          readOnly
          aria-label="選択して単語リストに追加"
          value={text}
          rows={estimateRows(text)}
          className={`select-text selectable-textarea w-full resize-none border-0 bg-transparent p-0 leading-inherit outline-none [-webkit-tap-highlight-color:transparent] ${sharedClassName}`}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onSelect={() => scheduleSelectionCheck(0)}
          onTouchEnd={() => scheduleSelectionCheck(250)}
        />
      ) : (
        <span
          ref={containerRef as React.RefObject<HTMLSpanElement>}
          className={`select-text ${sharedClassName}`}
          onMouseUp={() => scheduleSelectionCheck(0)}
        >
          {text}
        </span>
      )}
      {popup && allowAdd && touchUi ? (
        <div
          data-add-word-popup
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-stone-200 bg-white px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.15)]"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <p className="mb-2 truncate text-xs text-stone-500">選択: {preview}</p>
          <button
            type="button"
            className="w-full rounded-full bg-stone-900 px-4 py-3.5 text-sm font-medium text-white"
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
            className="fixed z-[60] rounded-full bg-stone-900 px-3 py-2 text-xs font-medium text-white shadow-lg"
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
