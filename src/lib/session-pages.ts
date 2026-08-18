export const SESSION_PAGE_SIZE = 20;

export function getSessionPageCount(total: number, pageSize = SESSION_PAGE_SIZE): number {
  if (total <= 0) return 1;
  return Math.ceil(total / pageSize);
}

export function getSessionPageLabel(
  pageIndex: number,
  total: number,
  pageSize = SESSION_PAGE_SIZE
): string {
  const start = pageIndex * pageSize + 1;
  const end = Math.min((pageIndex + 1) * pageSize, total);
  return `${start}–${end}`;
}

export function getPageForIndex(index: number, pageSize = SESSION_PAGE_SIZE): number {
  return Math.floor(index / pageSize);
}
