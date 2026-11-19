'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LC_PROGRESS_EVENT, clearModuleProgress, readStore, reconcileProgress, storageAvailable, type LcModuleProgress, type LcModuleShape } from './progress';

export type LcProgressState = {
  /** False until the browser has been read, so the server and first paint always agree. */
  ready: boolean;
  /** False when this browser blocks storage (private mode, settings). */
  available: boolean;
  progress: LcModuleProgress | null;
  /** True when saved progress belonged to an older version of the module and was cleared. */
  stale: boolean;
};

/** Read this browser's saved place in one module, kept in step with other tabs and the player. */
export function useLcProgress(moduleId: string, shape: LcModuleShape): LcProgressState & { reset: () => void } {
  const [state, setState] = useState<LcProgressState>({ ready: false, available: true, progress: null, stale: false });
  const sawStale = useRef(false);
  const shapeKey = `${shape.version}|${shape.lessons.map((l) => `${l.id}:${l.stepCount}`).join(',')}`;
  const shapeRef = useRef(shape);
  shapeRef.current = shape;

  useEffect(() => {
    const read = () => {
      const r = reconcileProgress(readStore().modules[moduleId], shapeRef.current);
      if (r.stale) {
        sawStale.current = true;
        clearModuleProgress(moduleId);
      }
      setState({ ready: true, available: storageAvailable(), progress: r.progress, stale: sawStale.current });
    };
    read();
    window.addEventListener(LC_PROGRESS_EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(LC_PROGRESS_EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, [moduleId, shapeKey]);

  const reset = useCallback(() => {
    sawStale.current = false;
    clearModuleProgress(moduleId);
  }, [moduleId]);

  return { ...state, reset };
}
