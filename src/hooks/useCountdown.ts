import { useEffect, useRef, useState } from 'react';

export interface CountdownState {
  /** Total seconds remaining (0 when expired) */
  totalSeconds: number;
  /** Formatted time string, e.g. "12:34" */
  formatted: string;
  /** 0‒100 progress percentage (100 = fully elapsed) */
  progressPct: number;
  /** True once the countdown has reached zero */
  expired: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function buildState(expiresAt: Date, totalDuration: number): CountdownState {
  const remaining = Math.max(0, expiresAt.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);
  const expired = remaining === 0;

  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const formatted = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

  const progressPct =
    totalDuration > 0
      ? Math.min(100, ((totalDuration - remaining) / totalDuration) * 100)
      : 100;

  return { totalSeconds, formatted, progressPct, expired };
}

/**
 * Counts down from `blockedAt` to `blockExpiresAt`.
 *
 * @param blockExpiresAt  ISO string – when the block lifts
 * @param blockedAt       ISO string – when the block started (used to calc total duration)
 */
export function useCountdown(
  blockExpiresAt: string,
  blockedAt: string,
): CountdownState {
  const expiresAt = useRef(new Date(blockExpiresAt));
  const totalDuration = useRef(
    Math.max(0, new Date(blockExpiresAt).getTime() - new Date(blockedAt).getTime()),
  );

  const [state, setState] = useState<CountdownState>(() =>
    buildState(expiresAt.current, totalDuration.current),
  );

  useEffect(() => {
    expiresAt.current = new Date(blockExpiresAt);
    totalDuration.current = Math.max(
      0,
      new Date(blockExpiresAt).getTime() - new Date(blockedAt).getTime(),
    );

    // Refresh immediately when props change
    setState(buildState(expiresAt.current, totalDuration.current));

    const id = setInterval(() => {
      const next = buildState(expiresAt.current, totalDuration.current);
      setState(next);
      if (next.expired) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [blockExpiresAt, blockedAt]);

  return state;
}
