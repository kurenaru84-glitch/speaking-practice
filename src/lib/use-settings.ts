"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type UserSettings } from "@/lib/settings";

export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettingsState(getSettings());
    setReady(true);
  }, []);

  const setSettings = useCallback((next: UserSettings) => {
    saveSettings(next);
    setSettingsState(next);
  }, []);

  return { settings, setSettings, ready };
}
