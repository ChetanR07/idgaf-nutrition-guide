import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Camera, Check, ImageIcon, Loader2, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/idgaf/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEAL_CATEGORIES, useFood, type MealCategory } from "@/lib/food-store";
import {
  recognizeFood,
  scaleFood,
  type RecognitionResult,
  type RecognizedFood,
} from "@/lib/food-recognition";
import { nextMealSlot } from "@/lib/nutrition";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan your food — IDGAF" },
      {
        name: "description",
        content: "Point your camera at your meal and IDGAF estimates calories, protein, carbs, fat and fibre instantly.",
      },
      { property: "og:title", content: "Scan your food — IDGAF" },
      { property: "og:description", content: "Snap a photo of your meal and log its full nutrition in seconds." },
    ],
  }),
  component: ScanPage,
});

type Phase = "capture" | "preview" | "analyzing" | "result" | "error";

const defaultSlot = (): MealCategory => {
  const s = nextMealSlot();
  return s === "Snack" ? "Snacks" : (s as MealCategory);
};

function ScanPage() {
  const navigate = useNavigate();
  const { addEntry } = useFood();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [phase, setPhase] = useState<Phase>("capture");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraReady(true);
    } catch {
      setCameraError("Camera unavailable. You can upload a photo from your gallery instead.");
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    if (phase === "capture") void startCamera();
    return () => stopCamera();
  }, [phase, startCamera, stopCamera]);

  const analyze = useCallback(async (dataUrl: string) => {
    setPhase("analyzing");
    try {
      const res = await recognizeFood(dataUrl);
      setResult(res);
      setPhase("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong while analyzing.");
      setPhase("error");
    }
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setImage(canvas.toDataURL("image/jpeg", 0.85));
    stopCamera();
    setPhase("preview");
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      stopCamera();
      setPhase("preview");
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setPhase("capture");
  };

  return (
    <AppShell>
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Scan food</h1>
          <p className="mt-1 text-sm text-muted-foreground">Point your camera at your food.</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close scanner"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {phase === "capture" ? (
        <section className="step-enter">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-border bg-foreground/90">
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            {!cameraReady ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Camera className="h-8 w-8 text-background/80" />
                <p className="text-sm font-medium text-background/90">
                  {cameraError ?? "Starting camera…"}
                </p>
                {cameraError ? (
                  <Button variant="secondary" className="rounded-xl" onClick={() => void startCamera()}>
                    Try camera again
                  </Button>
                ) : null}
              </div>
            ) : null}
            <ScanFrame />
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              className="h-12 rounded-xl"
              onClick={() => fileRef.current?.click()}
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Gallery
            </Button>
            <button
              type="button"
              aria-label="Capture photo"
              onClick={capture}
              disabled={!cameraReady}
              className="flex h-18 w-18 items-center justify-center rounded-full bg-primary p-1 text-primary-foreground shadow-lift ring-4 ring-primary/20 transition-transform active:scale-95 disabled:opacity-50"
              style={{ height: 72, width: 72 }}
            >
              <Camera className="h-7 w-7" />
            </button>
            <Button
              variant="outline"
              className="h-12 rounded-xl"
              onClick={() => navigate({ to: "/history" })}
            >
              History
            </Button>
          </div>
        </section>
      ) : null}

      {(phase === "preview" || phase === "analyzing") && image ? (
        <section className="step-enter">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-border bg-muted">
            <img src={image} alt="Captured food" className="h-full w-full object-cover" />
            {phase === "analyzing" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/60 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-background" />
                <p className="text-sm font-semibold text-background">Analyzing your food…</p>
                <p className="text-xs text-background/80">Estimating portion and macros</p>
              </div>
            ) : (
              <ScanFrame />
            )}
          </div>

          {phase === "preview" ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-xl" onClick={reset}>
                <RefreshCw className="mr-2 h-4 w-4" /> Retake
              </Button>
              <Button className="h-12 rounded-xl" onClick={() => void analyze(image)}>
                <Check className="mr-2 h-4 w-4" /> Scan food
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {phase === "error" ? (
        <section className="step-enter rounded-3xl border border-border bg-card p-6 text-center shadow-soft">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-3 text-base font-bold">{errorMsg}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get closer to the plate, add some light, and keep the whole meal in frame.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-xl" onClick={reset}>
              Retake photo
            </Button>
            <Button
              className="h-12 rounded-xl"
              onClick={() => image && void analyze(image)}
            >
              Try again
            </Button>
          </div>
        </section>
      ) : null}

      {phase === "result" && result ? (
        <ResultEditor
          image={image}
          result={result}
          onCancel={reset}
          onAdd={(entry) => {
            addEntry({ ...entry, source: "scan" });
            toast.success("Food added successfully", {
              description: `${entry.name} logged to ${entry.meal}.`,
            });
            navigate({ to: "/dashboard" });
          }}
        />
      ) : null}
    </AppShell>
  );
}

function ScanFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative h-[62%] w-[80%]">
        {["left-0 top-0 border-l-4 border-t-4 rounded-tl-2xl", "right-0 top-0 border-r-4 border-t-4 rounded-tr-2xl", "left-0 bottom-0 border-l-4 border-b-4 rounded-bl-2xl", "right-0 bottom-0 border-r-4 border-b-4 rounded-br-2xl"].map(
          (pos) => (
            <span key={pos} className={cn("absolute h-10 w-10 border-primary", pos)} />
          ),
        )}
      </div>
    </div>
  );
}

function ResultEditor({
  image,
  result,
  onCancel,
  onAdd,
}: {
  image: string | null;
  result: RecognitionResult;
  onCancel: () => void;
  onAdd: (entry: {
    name: string;
    image: string | null;
    servingGrams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    meal: MealCategory;
  }) => void;
}) {
  const [food, setFood] = useState<RecognizedFood>(result.top);
  const [name, setName] = useState(result.top.name);
  const [grams, setGrams] = useState(result.top.servingGrams);
  const [meal, setMeal] = useState<MealCategory>(defaultSlot());
  const [macros, setMacros] = useState(() => scaleFood(result.top, result.top.servingGrams));
  const [edited, setEdited] = useState(false);

  const applyServing = (g: number) => {
    setGrams(g);
    if (!edited) setMacros(scaleFood(food, g));
  };

  const chooseAlternative = (alt: RecognizedFood) => {
    setFood(alt);
    setName(alt.name);
    setGrams(alt.servingGrams);
    setMacros(scaleFood(alt, alt.servingGrams));
    setEdited(false);
  };

  const num = (v: string) => (v === "" ? 0 : Math.max(0, Number(v)));

  return (
    <section className="step-enter space-y-5">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        {image ? <img src={image} alt={name} className="h-44 w-full object-cover" /> : null}
        <div className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-deep">
            {Math.round(food.confidence * 100)}% match
          </p>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Food name"
            className="mt-2 h-12 rounded-xl border-border bg-card px-4 text-lg font-bold"
          />

          <div className="mt-4">
            <Label className="text-sm font-semibold">Serving size</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={grams}
                onChange={(e) => applyServing(num(e.target.value))}
                className="h-12 w-32 rounded-xl px-4 text-base"
              />
              <span className="text-sm font-semibold text-muted-foreground">grams</span>
              <div className="ml-auto flex gap-2">
                {[0.5, 1, 1.5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => applyServing(Math.round(food.servingGrams * m))}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-accent"
                  >
                    {m}×
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Label className="text-sm font-semibold">Meal</Label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {MEAL_CATEGORIES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMeal(m)}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors",
                    meal === m
                      ? "border-primary bg-primary-soft text-accent-foreground"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {([
              ["Calories", "calories", "kcal"],
              ["Protein", "protein", "g"],
              ["Carbs", "carbs", "g"],
              ["Fat", "fat", "g"],
              ["Fibre", "fiber", "g"],
            ] as const).map(([label, key, unit]) => (
              <div key={key}>
                <Label className="text-xs font-semibold text-muted-foreground">
                  {label} ({unit})
                </Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={macros[key]}
                  onChange={(e) => {
                    setEdited(true);
                    setMacros((m) => ({ ...m, [key]: num(e.target.value) }));
                  }}
                  className="mt-1 h-11 rounded-xl px-3 text-sm font-bold"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {result.alternatives.length ? (
        <div>
          <p className="mb-2 text-sm font-semibold">Not quite right?</p>
          <div className="flex flex-wrap gap-2">
            {result.alternatives.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => chooseAlternative(a)}
                className="rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-accent"
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-12 rounded-xl" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="h-12 rounded-xl"
          onClick={() =>
            onAdd({
              name: name.trim() || food.name,
              image,
              servingGrams: grams,
              meal,
              ...macros,
            })
          }
        >
          Add to today's intake
        </Button>
      </div>
    </section>
  );
}
