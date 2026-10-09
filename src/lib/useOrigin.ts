"use client";
import { useSyncExternalStore } from "react";

const noop = () => () => {};
/** The site's origin (e.g. https://formtified.com), safe during server rendering. */
export function useOrigin() {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}
