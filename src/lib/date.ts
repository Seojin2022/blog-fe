import { format } from 'date-fns';

export function formatDate(value: unknown, pattern = 'yyyy.MM.dd'): string {
  if (value == null || value === '') return '—';
  let date: Date;
  if (typeof value === 'number') {
    // 초 단위(10자리)면 밀리초로 변환
    date = value < 1e12 ? new Date(value * 1000) : new Date(value);
  } else {
    date = new Date(value as string);
  }
  return Number.isNaN(date.getTime()) ? '—' : format(date, pattern);
}

/** Post/RecentPost에서 날짜 필드 읽기 (created_at 또는 createdAt) */
export function getCreatedAt(obj: { created_at?: unknown; createdAt?: unknown } | null | undefined): unknown {
  return obj?.created_at ?? obj?.createdAt;
}
