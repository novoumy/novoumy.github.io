import { useSyncExternalStore } from 'react';

// Tiny shared store: "is an Interests folder still loading?". The "reading disk" badge shows while
// this is true and disappears the moment the folder content is ready (never on a fixed timer).
let loading = false;
let failSafe: number | undefined;
const listeners = new Set<() => void>();

// If something goes wrong (network hang, unmounted view) the badge must never get stuck.
const MAX_LOADING_MS = 10000;

function emit() {
  listeners.forEach((listener) => listener());
}

export function setFolderLoading(next: boolean) {
  window.clearTimeout(failSafe);
  if (next) failSafe = window.setTimeout(() => setFolderLoading(false), MAX_LOADING_MS);
  if (loading === next) return;
  loading = next;
  emit();
}

export function useFolderLoading(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => loading,
    () => false,
  );
}
