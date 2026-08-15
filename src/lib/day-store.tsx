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

export type MealSlot = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export interface LoggedMeal {
  id: string;
  slot: MealSlot;
  name: string;
  emoji: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  source: "manual" | "photo" | "recommendation";
  items?: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export interface DayState {
  date: string;
  meals: LoggedMeal[];
  waterLitres: number;
  streak: number;
  notifications: AppNotification[];
}

/** Demo data — replace with backend reads once the API is connected. */
const demoState = (): DayState => ({
  date: new Date().toISOString().slice(0, 10),
  meals: [
    {
      id: "m1",
      slot: "Breakfast",
      name: "Eggs + toast",
      emoji: "🥚",
      time: "08:20",
      calories: 420,
      protein: 26,
      carbs: 38,
      fat: 18,
      source: "manual",
      items: ["3 eggs", "2 slices multigrain toast"],
    },
    {
      id: "m2",
      slot: "Lunch",
      name: "Chicken biryani",
      emoji: "🍛",
      time: "13:10",
      calories: 650,
      protein: 38,
      carbs: 78,
      fat: 20,
      source: "photo",
      items: ["Chicken biryani, 1 plate", "Raita"],
    },
    {
      id: "m3",
      slot: "Snack",
      name: "Banana + milk",
      emoji: "🍌",
      time: "17:05",
      calories: 220,
      protein: 10,
      carbs: 34,
      fat: 5,
      source: "manual",
      items: ["1 banana", "250ml milk"],
    },
  ],
  waterLitres: 1.8,
  streak: 5,
  notifications: [
    { id: "n1", title: "Dinner reminder", body: "You still have calories left for a proper dinner.", time: "18:30", read: false },
    { id: "n2", title: "Hydration", body: "0.7L to go to hit today's water target.", time: "16:00", read: false },
    { id: "n3", title: "Milestone", body: "5 day logging streak. Nice.", time: "09:00", read: true },
  ],
});

const STORAGE_KEY = "idgaf.day.v1";

interface Ctx {
  day: DayState;
  totals: Totals;
  addMeal: (meal: Omit<LoggedMeal, "id" | "time">) => void;
  removeMeal: (id: string) => void;
  addWater: (litres: number) => void;
  markNotificationsRead: () => void;
  resetDay: () => void;
  hydrated: boolean;
}

const DayContext = createContext<Ctx | null>(null);

export function DayProvider({ children }: { children: ReactNode }) {
  const [day, setDay] = useState<DayState>(demoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDay({ ...demoState(), ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(day));
    } catch {
      /* ignore */
    }
  }, [day, hydrated]);

  const addMeal = useCallback((meal: Omit<LoggedMeal, "id" | "time">) => {
    setDay((d) => ({
      ...d,
      meals: [
        ...d.meals,
        {
          ...meal,
          id: `m${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }),
        },
      ],
    }));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setDay((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));
  }, []);

  const addWater = useCallback((litres: number) => {
    setDay((d) => ({ ...d, waterLitres: Math.max(0, Math.round((d.waterLitres + litres) * 10) / 10) }));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setDay((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
  }, []);

  const resetDay = useCallback(() => {
    setDay((d) => ({ ...d, meals: [], waterLitres: 0 }));
  }, []);

  const totals = useMemo(
    () =>
      day.meals.reduce<Totals>(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fat: acc.fat + m.fat,
        }),
        emptyTotals(),
      ),
    [day.meals],
  );

  const value = useMemo(
    () => ({ day, totals, addMeal, removeMeal, addWater, markNotificationsRead, resetDay, hydrated }),
    [day, totals, addMeal, removeMeal, addWater, markNotificationsRead, resetDay, hydrated],
  );

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

export function useDay() {
  const ctx = useContext(DayContext);
  if (!ctx) throw new Error("useDay must be used inside DayProvider");
  return ctx;
}
