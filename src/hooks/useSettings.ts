import { useLocalStorage } from "./useLocalStorage";
import { useCallback } from "react";

export interface AppSettings {
  theme: "light" | "dark" | "system";
  language: "pt-BR";
  dateFormat: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
  currency: "BRL" | "USD" | "EUR";
  farmName: string;
  farmLocation: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

const defaultSettings: AppSettings = {
  theme: "system",
  language: "pt-BR",
  dateFormat: "dd/MM/yyyy",
  currency: "BRL",
  farmName: "",
  farmLocation: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
};

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    "horsecontrol-settings",
    defaultSettings
  );

  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  const clearAllData = useCallback(() => {
    // Clear all localStorage data for the app
    const keys = [
      "horsecontrol-horses",
      "horsecontrol-events",
      "horsecontrol-activities",
      "horsecontrol-stock",
      "horsecontrol-competitions",
      "horsecontrol-reproductions",
      "horsecontrol-notifications",
      "horsecontrol-notification-settings",
      "horsecontrol-settings",
    ];
    keys.forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    clearAllData,
  };
}
