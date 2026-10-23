'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'tac:my-center';
const EVENT = 'tac:my-center-change';
const VALID = ['pearland', 'sugarland', 'katy', 'plano', 'cedarhill', 'austin'];

type Ctx = { centerId: string | null; ready: boolean; setCenter: (id: string | null) => void };
const MyCenterContext = createContext<Ctx>({ centerId: null, ready: false, setCenter: () => undefined });

function read(): string | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v && VALID.includes(v) ? v : null;
  } catch {
    return null;
  }
}

/** Remembers the parent's center across the site. localStorage, wrapped in try/catch, live via context. */
export function MyCenterProvider({ children }: { children: React.ReactNode }) {
  const [centerId, setState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read());
    setReady(true);
    const sync = () => setState(read());
    window.addEventListener('storage', sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const setCenter = useCallback((id: string | null) => {
    try {
      if (id && VALID.includes(id)) window.localStorage.setItem(KEY, id);
      else window.localStorage.removeItem(KEY);
    } catch {
      // storage can be blocked; the in-memory value still updates
    }
    setState(id && VALID.includes(id) ? id : null);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const value = useMemo(() => ({ centerId, ready, setCenter }), [centerId, ready, setCenter]);
  return <MyCenterContext.Provider value={value}>{children}</MyCenterContext.Provider>;
}

export function useMyCenter() {
  return useContext(MyCenterContext);
}

/** Drop onto a page to remember its center (e.g. /locations/[slug]). */
export function RememberCenter({ centerId }: { centerId: string }) {
  const { setCenter, ready, centerId: current } = useMyCenter();
  useEffect(() => {
    if (ready && current !== centerId) setCenter(centerId);
  }, [ready, current, centerId, setCenter]);
  return null;
}
