import { useEffect, useState } from "react";
import { getAuthToken } from "@/lib/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface FeaturedLaunch {
  id: string;
  title: string;
  subtitle: string | null;
  eyebrow: string;
  description: string | null;
  hero_video_url: string | null;
  hero_image_url: string | null;
  cta_label: string;
  lookbook_label: string;
  images: string[];
  is_active: boolean;
  updated_at: string;
}

export function useFeaturedLaunch() {
  const [launch, setLaunch] = useState<FeaturedLaunch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/featured-launch`);
        if (!alive || !res.ok) return;
        const json = await res.json();
        if (!alive) return;
        if (json?.data) {
          const d = json.data;
          setLaunch({
            ...d,
            images: Array.isArray(d.images)
              ? d.images
              : typeof d.images === "string"
              ? JSON.parse(d.images)
              : [],
          });
        }
      } catch {
        // silently fall through to static fallback
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { launch, loading };
}

// ── Admin API helpers ────────────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const t = getAuthToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

async function adminCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export const fetchAllLaunches = () =>
  adminCall<{ data: FeaturedLaunch[] }>("GET", "/api/featured-launch/all").then((r) => r.data);

export const createLaunch = (payload: Partial<FeaturedLaunch>) =>
  adminCall<{ data: FeaturedLaunch }>("POST", "/api/featured-launch", payload).then((r) => r.data);

export const updateLaunch = (id: string, payload: Partial<FeaturedLaunch>) =>
  adminCall<{ data: FeaturedLaunch }>("PUT", `/api/featured-launch/${id}`, payload).then((r) => r.data);

export const deleteLaunch = (id: string) =>
  adminCall("DELETE", `/api/featured-launch/${id}`);
