import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { storefrontQuery } from "../shopify/client";
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_ACCESS_TOKEN_RENEW,
  CUSTOMER_CREATE,
  CUSTOMER_QUERY,
  CUSTOMER_RECOVER,
} from "./queries";
import type {
  Customer,
  CustomerAccessToken,
  UserError,
} from "./types";

const TOKEN_KEY = "@appalchemy/customer_token";
const RENEW_BEFORE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

interface CustomerContextValue {
  customer: Customer | null;
  accessToken: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; errors: UserError[] }>;
  register: (input: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<{ ok: true } | { ok: false; errors: UserError[] }>;
  recover: (
    email: string,
  ) => Promise<{ ok: true } | { ok: false; errors: UserError[] }>;
  logout: () => Promise<void>;
}

const Context = createContext<CustomerContextValue | null>(null);

async function loadToken(): Promise<CustomerAccessToken | null> {
  try {
    const raw = await AsyncStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.accessToken !== "string" || typeof parsed?.expiresAt !== "string") {
      return null;
    }
    return parsed as CustomerAccessToken;
  } catch {
    return null;
  }
}

async function saveToken(token: CustomerAccessToken | null): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

function isExpired(token: CustomerAccessToken): boolean {
  return Date.now() >= new Date(token.expiresAt).getTime();
}

function isExpiringSoon(token: CustomerAccessToken): boolean {
  return new Date(token.expiresAt).getTime() - Date.now() < RENEW_BEFORE_MS;
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<CustomerAccessToken | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(
    async (t: CustomerAccessToken): Promise<Customer | null> => {
      try {
        const data = await storefrontQuery<{ customer: Customer | null }>(
          CUSTOMER_QUERY,
          { accessToken: t.accessToken },
        );
        return data.customer;
      } catch {
        return null;
      }
    },
    [],
  );

  const renewIfNeeded = useCallback(
    async (t: CustomerAccessToken): Promise<CustomerAccessToken | null> => {
      if (!isExpiringSoon(t) || isExpired(t)) {
        // Either fresh enough OR already past expiry (renew won't help once expired).
        if (isExpired(t)) return null;
        return t;
      }
      try {
        const data = await storefrontQuery<{
          customerAccessTokenRenew: {
            customerAccessToken: CustomerAccessToken | null;
            userErrors: UserError[];
          };
        }>(CUSTOMER_ACCESS_TOKEN_RENEW, { customerAccessToken: t.accessToken });
        const next = data.customerAccessTokenRenew.customerAccessToken;
        if (next) {
          await saveToken(next);
          return next;
        }
      } catch {
        /* fall through to logout */
      }
      return null;
    },
    [],
  );

  // Restore session on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadToken();
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      if (isExpired(stored)) {
        await saveToken(null);
        if (!cancelled) setLoading(false);
        return;
      }
      const renewed = await renewIfNeeded(stored);
      if (!renewed) {
        await saveToken(null);
        if (!cancelled) setLoading(false);
        return;
      }
      const profile = await fetchProfile(renewed);
      if (cancelled) return;
      if (profile) {
        setToken(renewed);
        setCustomer(profile);
      } else {
        await saveToken(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchProfile, renewIfNeeded]);

  const login = useCallback<CustomerContextValue["login"]>(
    async (email, password) => {
      const data = await storefrontQuery<{
        customerAccessTokenCreate: {
          customerAccessToken: CustomerAccessToken | null;
          customerUserErrors: UserError[];
        };
      }>(CUSTOMER_ACCESS_TOKEN_CREATE, { input: { email, password } });
      const errors = data.customerAccessTokenCreate.customerUserErrors;
      const t = data.customerAccessTokenCreate.customerAccessToken;
      if (!t || errors.length > 0) {
        return { ok: false, errors };
      }
      await saveToken(t);
      const profile = await fetchProfile(t);
      setToken(t);
      setCustomer(profile);
      return { ok: true };
    },
    [fetchProfile],
  );

  const register = useCallback<CustomerContextValue["register"]>(
    async (input) => {
      const create = await storefrontQuery<{
        customerCreate: {
          customer: { id: string } | null;
          customerUserErrors: UserError[];
        };
      }>(CUSTOMER_CREATE, { input });
      const errors = create.customerCreate.customerUserErrors;
      if (errors.length > 0 || !create.customerCreate.customer) {
        return { ok: false, errors };
      }
      // Auto-login after successful register.
      return login(input.email, input.password);
    },
    [login],
  );

  const recover = useCallback<CustomerContextValue["recover"]>(async (email) => {
    const data = await storefrontQuery<{
      customerRecover: { customerUserErrors: UserError[] };
    }>(CUSTOMER_RECOVER, { email });
    const errors = data.customerRecover.customerUserErrors;
    if (errors.length > 0) return { ok: false, errors };
    return { ok: true };
  }, []);

  const logout = useCallback<CustomerContextValue["logout"]>(async () => {
    if (token) {
      try {
        await storefrontQuery(CUSTOMER_ACCESS_TOKEN_DELETE, {
          customerAccessToken: token.accessToken,
        });
      } catch {
        /* token may already be invalid; clear locally regardless */
      }
    }
    await saveToken(null);
    setToken(null);
    setCustomer(null);
  }, [token]);

  return (
    <Context.Provider
      value={{
        customer,
        accessToken: token?.accessToken ?? null,
        loading,
        login,
        register,
        recover,
        logout,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useCustomer(): CustomerContextValue {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useCustomer must be inside <CustomerProvider>");
  return ctx;
}
