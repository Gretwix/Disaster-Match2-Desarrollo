// Centralized storage helpers and types

export type LoggedUser = {
  username: string;
  role?: string;
  token?: string;
  avatarUrl?: string;
  [key: string]: unknown;
} | null;

export const CART_KEY = "cart";
export const LOGGED_USER_KEY = "loggedUser";

export function safeParseJSON<T>(value: string | null, fallback: T): T {
  try {
    const parsed = value ? JSON.parse(value) : null;
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

// Cart helpers
export function getCart<T = any[]>(): T {
  return safeParseJSON<T>(localStorage.getItem(CART_KEY), ([] as unknown) as T);
}

export function saveCart(items: unknown[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Logged user helpers
export function getLoggedUser<T extends LoggedUser = LoggedUser>(): T {
  return safeParseJSON<T>(localStorage.getItem(LOGGED_USER_KEY), null as unknown as T);
}

export function setLoggedUser(user: unknown) {
  localStorage.setItem(LOGGED_USER_KEY, JSON.stringify(user));
}

export function clearLoggedUser() {
  localStorage.removeItem(LOGGED_USER_KEY);
}

// Namespaced keys
export function purchasedIncidentsKey(username: string) {
  return `purchasedIncidents_${username}`;
}
