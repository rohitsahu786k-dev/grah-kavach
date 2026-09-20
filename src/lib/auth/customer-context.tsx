"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CustomerProfile = {
  customerId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  billing?: Record<string, string>;
  shipping?: Record<string, string>;
};

export type CustomerContextType = {
  customer: CustomerProfile | null;
  isLoading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer || null);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // The session check on mount. Written out rather than calling `refresh()`
  // so that no state is set synchronously while the effect body runs — every
  // update here happens in a promise callback, after the request settles.
  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then(async (res) => (res.ok ? ((await res.json()) as { customer?: CustomerProfile }) : null))
      .then((data) => {
        if (!cancelled) setCustomer(data?.customer ?? null);
      })
      .catch(() => {
        if (!cancelled) setCustomer(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: emailOrUsername, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Login failed.");
    }

    setCustomer(data.customer);
  }, []);

  const register = useCallback(
    async (formData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      setCustomer(data.customer);
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      customer,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [customer, isLoading, login, register, logout, refresh],
  );

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
