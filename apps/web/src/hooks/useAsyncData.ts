"use client";

import { useCallback, useEffect, useState } from "react";

interface State<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Loads data from an external source (our API) and keeps it in state.
 * `enabled` defers the fetch until prerequisites are ready, e.g. the signed-in
 * user is known. Results arrive in a callback, never synchronously in the effect.
 */
export function useAsyncData<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
  options: { enabled?: boolean } = {},
): State<T> & { setData: (updater: (prev: T | null) => T | null) => void; reload: () => void } {
  const enabled = options.enabled ?? true;
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: enabled });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, error: err instanceof Error ? err.message : "Something went wrong", loading: false });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, nonce, ...deps]);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setState((s) => ({ ...s, data: updater(s.data) }));
  }, []);
  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { ...state, setData, reload };
}
