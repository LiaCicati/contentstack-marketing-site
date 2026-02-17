"use client";

/**
 * PersonalizeContext
 * ──────────────────────────────────────────────────────────
 * Provides a client-side Personalize SDK instance for
 * triggering impressions, conversion events and setting
 * user attributes from any component.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// The SDK instance type — use a loose type since the SDK
// doesn't export the instance type cleanly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PersonalizeSdk = any;

const PersonalizeContext = createContext<PersonalizeSdk | null>(null);

export function PersonalizeProvider({ children }: { children: ReactNode }) {
  const [sdk, setSdk] = useState<PersonalizeSdk | null>(null);

  useEffect(() => {
    const projectUid = process.env.NEXT_PUBLIC_PERSONALIZE_PROJECT_UID;
    if (!projectUid) return;

    import("@contentstack/personalize-edge-sdk").then(
      async ({ default: Personalize }) => {
        const instance = await Personalize.init(projectUid);
        setSdk(instance);
      },
    );
  }, []);

  return (
    <PersonalizeContext.Provider value={sdk}>
      {children}
    </PersonalizeContext.Provider>
  );
}

/**
 * Hook to access the Personalize SDK from any client component.
 *
 * Usage:
 *   const personalize = usePersonalize();
 *   await personalize?.triggerImpression(experienceShortUid);
 *   await personalize?.triggerEvent("cta_clicked");
 *   await personalize?.set({ plan: "enterprise" });
 */
export function usePersonalize() {
  return useContext(PersonalizeContext);
}
