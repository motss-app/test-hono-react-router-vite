export function getRpcFetchTime(headers: Headers, elapsed: number): number {
  const match = headers.get('server-timing')?.match(/(?:^|,)\s*bff\s*;\s*dur=([^;,\s]+)/);
  const duration = match ? Number(match[1]) : Number.NaN;
  return Number((Number.isFinite(duration) && duration >= 0 ? duration : elapsed).toFixed(5));
}
