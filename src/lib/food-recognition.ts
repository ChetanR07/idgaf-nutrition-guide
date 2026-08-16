/**
 * Food recognition boundary.
 *
 * `recognizeFood()` is the ONLY place the app talks to a recognition engine.
 * Today it returns mock predictions; swapping in a real TensorFlow / PyTorch
 * service means replacing the body of `recognizeFood` with a fetch to the
 * inference endpoint. Nothing else in the app needs to change.
 */

export interface RecognizedFood {
  /** Model label id */
  id: string;
  name: string;
  /** Reference serving the nutrition below is measured against, in grams */
  servingGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  /** 0..1 model confidence */
  confidence: number;
}

export interface RecognitionResult {
  top: RecognizedFood;
  alternatives: RecognizedFood[];
}

const CATALOG: Omit<RecognizedFood, "confidence">[] = [
  { id: "chicken-rice-bowl", name: "Chicken rice bowl", servingGrams: 350, calories: 520, protein: 32, carbs: 58, fat: 16, fiber: 5 },
  { id: "paneer-tikka", name: "Paneer tikka with salad", servingGrams: 300, calories: 460, protein: 28, carbs: 24, fat: 26, fiber: 6 },
  { id: "veg-thali", name: "Vegetable thali", servingGrams: 480, calories: 640, protein: 21, carbs: 92, fat: 18, fiber: 13 },
  { id: "masala-dosa", name: "Masala dosa", servingGrams: 250, calories: 390, protein: 9, carbs: 58, fat: 13, fiber: 5 },
  { id: "greek-salad", name: "Greek salad", servingGrams: 260, calories: 230, protein: 8, carbs: 14, fat: 16, fiber: 5 },
  { id: "grilled-salmon", name: "Grilled salmon with greens", servingGrams: 300, calories: 480, protein: 40, carbs: 12, fat: 30, fiber: 4 },
  { id: "avocado-toast", name: "Avocado toast with egg", servingGrams: 220, calories: 420, protein: 18, carbs: 34, fat: 24, fiber: 8 },
  { id: "pasta-arrabbiata", name: "Penne arrabbiata", servingGrams: 340, calories: 560, protein: 17, carbs: 88, fat: 14, fiber: 7 },
  { id: "rajma-chawal", name: "Rajma chawal", servingGrams: 400, calories: 560, protein: 22, carbs: 88, fat: 10, fiber: 12 },
  { id: "fruit-bowl", name: "Mixed fruit bowl", servingGrams: 300, calories: 190, protein: 3, carbs: 46, fat: 1, fiber: 7 },
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

export class RecognitionError extends Error {}

/**
 * Analyze a captured food image.
 * @param _image data URL or File of the captured photo (sent to the model).
 */
export async function recognizeFood(_image: string): Promise<RecognitionResult> {
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 900));

  // Mock: rare failure so the error state is reachable and testable.
  if (Math.random() < 0.06) {
    throw new RecognitionError("We couldn't identify this food. Try another photo.");
  }

  const shuffled = [...CATALOG].sort(() => Math.random() - 0.5);
  const top = { ...pick(shuffled), confidence: 0.72 + Math.random() * 0.25 };
  const alternatives = shuffled
    .filter((c) => c.id !== top.id)
    .slice(0, 3)
    .map((c) => ({ ...c, confidence: 0.3 + Math.random() * 0.3 }));

  return { top, alternatives };
}

/** Scale a recognized food's nutrition to a different serving size. */
export function scaleFood(food: RecognizedFood, grams: number) {
  const f = grams / food.servingGrams;
  const r = (n: number) => Math.round(n * f);
  const r1 = (n: number) => Math.round(n * f * 10) / 10;
  return {
    calories: r(food.calories),
    protein: r1(food.protein),
    carbs: r1(food.carbs),
    fat: r1(food.fat),
    fiber: r1(food.fiber),
  };
}
