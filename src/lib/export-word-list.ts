import type { WordListEntry } from "@/lib/word-list";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build a 2-column CSV (word, meaning) that Excel opens with UTF-8 BOM. */
export function buildWordListCsv(entries: WordListEntry[]): string {
  const rows = [
    ["単語", "意味"],
    ...entries.map((entry) => [entry.term, entry.note]),
  ];
  const body = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  return `\uFEFF${body}`;
}

export function downloadWordListCsv(entries: WordListEntry[], filenameBase: string) {
  if (entries.length === 0) return;

  const csv = buildWordListCsv(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filenameBase}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
