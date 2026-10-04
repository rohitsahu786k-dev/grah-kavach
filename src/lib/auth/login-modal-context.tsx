"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type LoginModalContextValue = {
  isOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

/** Owns whether the phone-login sheet is open, so the header, menu and auto-prompt share one instance. */
export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openLogin = useCallback(() => setIsOpen(true), []);
  const closeLogin = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, openLogin, closeLogin }), [isOpen, openLogin, closeLogin]);

  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>;
}

export function useLoginModal(): LoginModalContextValue {
  const context = useContext(LoginModalContext);
  if (!context) throw new Error("useLoginModal must be used within a <LoginModalProvider>.");
  return context;
}
