import { createContext, useContext, useRef, ReactNode } from 'react';

type LockSuspendContextType = {
  isSuspendedRef: React.MutableRefObject<boolean>;
  suspendLock: () => void;
  resumeLock: (graceMs?: number) => void;
};

const LockSuspendContext = createContext<LockSuspendContextType | undefined>(undefined);

export function LockSuspendProvider({ children }: { children: ReactNode }) {
  const isSuspendedRef = useRef(false);
  const graceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const suspendLock = () => {
    if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
    isSuspendedRef.current = true;
  };

  const resumeLock = (graceMs: number = 1000) => {
    if (graceTimeoutRef.current) clearTimeout(graceTimeoutRef.current);
    // Garde la suspension active encore un court instant : le temps que
    // l'app finisse sa transition background -> active côté OS après
    // la fermeture du picker/caméra.
    graceTimeoutRef.current = setTimeout(() => {
      isSuspendedRef.current = false;
    }, graceMs);
  };

  return (
    <LockSuspendContext.Provider value={{ isSuspendedRef, suspendLock, resumeLock }}>
      {children}
    </LockSuspendContext.Provider>
  );
}

export const useLockSuspend = () => {
  const ctx = useContext(LockSuspendContext);
  if (!ctx) throw new Error('useLockSuspend must be used inside LockSuspendProvider');
  return ctx;
};