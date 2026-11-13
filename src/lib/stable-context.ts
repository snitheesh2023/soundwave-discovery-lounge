import { createContext, type Context } from "react";

/**
 * createContext that keeps the same object across hot module reloads.
 * Without this, editing a provider file re-creates the context while the
 * mounted provider still uses the old one, so consumers throw
 * "must be used inside <Provider>" until a full page refresh.
 */
const registry = ((globalThis as Record<string, unknown>)["__soundwaveContexts"] ??= new Map()) as Map<
  string,
  Context<unknown>
>;

export function createStableContext<T>(key: string, defaultValue: T): Context<T> {
  const existing = registry.get(key);
  if (existing) return existing as Context<T>;
  const ctx = createContext<T>(defaultValue);
  ctx.displayName = key;
  registry.set(key, ctx as Context<unknown>);
  return ctx;
}
