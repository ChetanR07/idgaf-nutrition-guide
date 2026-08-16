import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { emptyTotals, type Totals } from "@/lib/nutrition";

export type MealCategory = "Breakfast" | "Lunch" | "Snacks" | "Dinner";

export const MEAL_CATEGORIES: MealCategory[] = ["Breakfast", "Lunch", "Snacks", "Dinner"];

/**
 * A single logged food. Shaped to map 1:1 onto a `food_entries` SQL table
 * once a backend is connected (id / created_at / user_id).
 */
export interface FoodEntry {
  id: string;
  name: string;
  image: string | null;
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  meal: MealCategory;
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** HH:MM, 24h */
  time: string;
  createdAt: string;
  source: "scan" | "manual";
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppSettings {
  notifications: {
    mealReminders: boolean;
    calorieReminders: boolean;
    goalUpdates: boolean;
    pushEnabled: boolean;
  };
  units: {
    weight: "kg" | "lb";
    height: "cm" | "ftin";
    energy: "kcal" | "kJ";
    servings: "grams" | "ounces";
  };
  theme: ThemeMode;
  /** Manual overrides for computed targets; null = use the computed value. */
  targetOverrides: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    fiber: number | null;
  };
}

export const defaultSettings = (): AppSettings => ({
  notifications: {
    mealReminders: true,
    calorieReminders: true,
    goalUpdates: true,
    pushEnabled: true,
  },
  units: { weight: "kg", height: "cm", energy: "kcal", servings: "grams" },
  theme: "system",
  targetOverrides: { calories: null, protein: null, carbs: null, fat: null, fiber: null },
});

export const todayISO = () => new Date().toISOString().slice(0, 10);

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

const shiftDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

/** Realistic seed data so the app looks populated on first run. */
const seedEntries = (): FoodEntry[] => {
  const mk = (
    e: Omit<FoodEntry, "id" | "createdAt" | "image" | "source"> & { image?: string | null },
  ): FoodEntry => ({
    id: `seed-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date(`${e.date}T${e.time}:00`).toISOString(),
    image: e.image ?? null,
    source: "scan",
    ...e,
  });

  return [
    mk({ name: "Masala oats with almonds", servingGrams: 280, calories: 340, protein: 14, carbs: 52, fat: 9, fiber: 8, meal: "Breakfast", date: todayISO(), time: "08:20" }),
    mk({ name: "Chicken rice bowl", servingGrams: 350, calories: 520, protein: 32, carbs: 58, fat: 16, fiber: 5, meal: "Lunch", date: todayISO(), time: "13:15" }),
    mk({ name: "Greek yoghurt + berries", servingGrams: 180, calories: 180, protein: 16, carbs: 20, fat: 4, fiber: 3, meal: "Snacks", date: todayISO(), time: "16:40" }),
    mk({ name: "Paneer tikka wrap", servingGrams: 260, calories: 480, protein: 26, carbs: 46, fat: 21, fiber: 6, meal: "Dinner", date: shiftDays(1), time: "20:10" }),
    mk({ name: "Grilled fish + quinoa", servingGrams: 320, calories: 540, protein: 42, carbs: 48, fat: 18, fiber: 7, meal: "Lunch", date: shiftDays(1), time: "13:05" }),
    mk({ name: "Banana smoothie", servingGrams: 300, calories: 240, protein: 10, carbs: 40, fat: 5, fiber: 4, meal: "Breakfast", date: shiftDays(3), time: "09:00" }),
    mk({ name: "Rajma chawal", servingGrams: 400, calories: 560, protein: 22, carbs: 88, fat: 10, fiber: 12, meal: "Dinner", date: shiftDays(5), time: "20:40" }),
  ];
};

const ENTRIES_KEY = "idgaf.entries.v1";
const SETTINGS_KEY = "idgaf.settings.v1";
const WATER_KEY = "idgaf.water.v1";

interface Ctx {
  entries: FoodEntry[];
  todayEntries: FoodEntry[];
  todayTotals: Totals;
  settings: AppSettings;
  hydrated: boolean;
  waterLitres: number;
  addWater: (litres: number) => void;
  addEntry: (entry: Omit<FoodEntry, "id" | "createdAt" | "date" | "time"> & Partial<Pick<FoodEntry, "date" | "time">>) => FoodEntry;
  updateEntry: (id: string, patch: Partial<FoodEntry>) => void;
  removeEntry: (id: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  clearData: () => void;
}

const FoodContext = createContext<Ctx | null>(null);

export function sumTotals(entries: FoodEntry[]): Totals {
  return entries.reduce<Totals>(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
      fiber: acc.fiber + e.fiber,
    }),
    emptyTotals(),
  );
}

export function FoodProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [waterLitres, setWaterLitres] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ENTRIES_KEY);
      setEntries(raw ? (JSON.parse(raw) as FoodEntry[]) : seedEntries());
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...defaultSettings(), ...JSON.parse(s) });
      const w = localStorage.getItem(WATER_KEY);
      if (w) {
        const parsed = JSON.parse(w) as { date: string; litres: number };
        if (parsed.date === todayISO()) setWaterLitres(parsed.litres);
      }
    } catch {
      setEntries(seedEntries());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(WATER_KEY, JSON.stringify({ date: todayISO(), litres: waterLitres }));
    } catch {
      /* storage unavailable */
    }
  }, [entries, settings, waterLitres, hydrated]);

  // Theme application
  useEffect(() => {
    if (typeof document === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = settings.theme === "dark" || (settings.theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  const addEntry = useCallback<Ctx["addEntry"]>((entry) => {
    const full: FoodEntry = {
      date: todayISO(),
      time: timeNow(),
      ...entry,
      id: `f${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<FoodEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const addWater = useCallback((litres: number) => {
    setWaterLitres((w) => Math.max(0, Math.round((w + litres) * 10) / 10));
  }, []);

  const clearData = useCallback(() => {
    setEntries([]);
    setWaterLitres(0);
  }, []);

  const todayEntries = useMemo(
    () => entries.filter((e) => e.date === todayISO()),
    [entries],
  );
  const todayTotals = useMemo(() => sumTotals(todayEntries), [todayEntries]);

  const value = useMemo(
    () => ({
      entries,
      todayEntries,
      todayTotals,
      settings,
      hydrated,
      waterLitres,
      addWater,
      addEntry,
      updateEntry,
      removeEntry,
      updateSettings,
      clearData,
    }),
    [entries, todayEntries, todayTotals, settings, hydrated, waterLitres, addWater, addEntry, updateEntry, removeEntry, updateSettings, clearData],
  );

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
}

export function useFood() {
  const ctx = useContext(FoodContext);
  if (!ctx) throw new Error("useFood must be used inside FoodProvider");
  return ctx;
}
