"use client";

import { useCallback, useEffect, useState } from "react";
import type { CamModel, ModelsResult } from "@/lib/models/types";

type DirectoryState = {
  models: CamModel[];
  loading: boolean;
  error: boolean;
};

let sharedCache: CamModel[] | null = null;
let sharedPromise: Promise<CamModel[]> | null = null;

function fetchDirectory(): Promise<CamModel[]> {
  if (sharedCache) return Promise.resolve(sharedCache);
  if (sharedPromise) return sharedPromise;
  sharedPromise = fetch("/api/models?limit=48&live=true")
    .then((r) => r.json())
    .then((data: ModelsResult) => {
      sharedCache = data.models ?? [];
      return sharedCache;
    })
    .catch(() => {
      sharedPromise = null;
      return [];
    });
  return sharedPromise;
}

export function useModelDirectory(enabled = true) {
  const [state, setState] = useState<DirectoryState>({
    models: sharedCache ?? [],
    loading: enabled && !sharedCache,
    error: false,
  });

  const refresh = useCallback(() => {
    sharedCache = null;
    sharedPromise = null;
    setState({ models: [], loading: true, error: false });
    fetchDirectory()
      .then((models) => setState({ models, loading: false, error: false }))
      .catch(() => setState({ models: [], loading: false, error: true }));
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (sharedCache) {
      setState({ models: sharedCache, loading: false, error: false });
      return;
    }
    fetchDirectory()
      .then((models) => setState({ models, loading: false, error: false }))
      .catch(() => setState({ models: [], loading: false, error: true }));
  }, [enabled]);

  return { ...state, refresh };
}
