"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// Types (mirrors domain types for the client)
// ============================================================

interface AttributeOption {
  id: number;
  attributeId: number;
  code: string;
  label: string;
  numericValue: number | null;
  sortOrder: number;
}

interface ConfiguratorAttribute {
  id: number;
  familyId: number;
  code: string;
  name: string;
  dataType: "select" | "number" | "boolean" | "text";
  required: boolean;
  sortOrder: number;
  options: AttributeOption[];
}

interface FamilyWithAttributes {
  family: {
    id: number;
    code: string;
    name: string;
    description: string | null;
    status: string;
  };
  attributes: ConfiguratorAttribute[];
}

interface ConfigValues {
  [key: string]: string | number;
}

interface ValidationErrors {
  valid: boolean;
  errors: string[];
}

interface HardwareItem {
  sku: string;
  name: string;
  productType: string;
  quantity: number;
  required: boolean;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  whyRecommended: string[];
}

interface RecommendResult {
  configuration: ConfigValues;
  calculation: {
    area: number;
    glassWeight: number;
  };
  matchedRule: {
    code: string;
    name: string;
    priority: number;
  } | null;
  hardware: HardwareItem[];
  bom: {
    items: HardwareItem[];
    subtotal: number;
  };
  warnings: string[];
}

interface QuoteResult {
  id: number;
  quoteNumber: string;
  status: string;
}

interface ApiError {
  success: false;
  error: string;
}

// ============================================================
// Constants
// ============================================================

const FAMILY_CODE = "GLASS_SWING_DOOR";

/** Map DB attribute codes to DoorConfiguration camelCase field names */
const CODE_TO_FIELD: Record<string, string> = {
  door_type: "doorType",
  glass_thickness: "glassThickness",
  door_width: "doorWidth",
  door_height: "doorHeight",
  mounting_type: "mountingType",
  opening_type: "openingType",
  finish: "finish",
  handle_size: "handleSize",
  lock_type: "lockType",
};

// Type icons per attribute code
const ATTR_ICONS: Record<string, string> = {
  door_type: "🚪",
  glass_thickness: "📏",
  door_width: "↔️",
  door_height: "↕️",
  mounting_type: "🔩",
  opening_type: "🔄",
  finish: "✨",
  handle_size: "🖐️",
  lock_type: "🔒",
};

// ============================================================
// Helpers
// ============================================================

function buildDefaultConfig(attributes: ConfiguratorAttribute[]): ConfigValues {
  // Sensible defaults per attribute code (must satisfy Zod schema constraints)
  const NUMBER_DEFAULTS: Record<string, number> = {
    door_width: 900,
    door_height: 2100,
  };
  const cfg: ConfigValues = {};
  for (const attr of attributes) {
    const field = CODE_TO_FIELD[attr.code] ?? attr.code;
    if (attr.dataType === "select" && attr.options.length > 0) {
      cfg[field] = attr.options[0].code;
    } else if (attr.dataType === "number") {
      cfg[field] = NUMBER_DEFAULTS[attr.code] ?? 900;
    } else {
      cfg[field] = "";
    }
  }
  return cfg;
}

// ============================================================
// Page Component
// ============================================================

export default function GlassConfiguratorPage() {
  // --- State ---
  const [attributes, setAttributes] = useState<ConfiguratorAttribute[] | null>(null);
  const [family, setFamily] = useState<FamilyWithAttributes["family"] | null>(null);
  const [config, setConfig] = useState<ConfigValues>({});
  const [validation, setValidation] = useState<ValidationErrors | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendResult | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    projectName: "",
    quantity: "1",
    notes: "",
  });

  // UI state
  const [loading, setLoading] = useState({
    attributes: true,
    validation: false,
    recommend: false,
    quote: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"recommend" | "quote">("recommend");

  const validateTimer = useRef<ReturnType<typeof setTimeout>>(null!);

  // --- Fetch attributes on mount ---
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/configurator/attributes?family=${FAMILY_CODE}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        const data: FamilyWithAttributes = json.data;
        setAttributes(data.attributes);
        setFamily(data.family);
        setConfig(buildDefaultConfig(data.attributes));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load attributes");
      } finally {
        setLoading((p) => ({ ...p, attributes: false }));
      }
    }
    load();
  }, []);

  // --- Debounced validation ---
  const doValidate = useCallback(async (cfg: ConfigValues) => {
    if (!attributes) return;
    setLoading((p) => ({ ...p, validation: true }));
    try {
      const res = await fetch("/api/configurator/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family: FAMILY_CODE, configuration: cfg }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setValidation(json.data);
    } catch {
      // silent on validation errors
    } finally {
      setLoading((p) => ({ ...p, validation: false }));
    }
  }, [attributes]);

  useEffect(() => {
    if (Object.keys(config).length === 0) return;
    if (validateTimer.current) clearTimeout(validateTimer.current);
    validateTimer.current = setTimeout(() => doValidate(config), 400);
    return () => {
      if (validateTimer.current) clearTimeout(validateTimer.current);
    };
  }, [config, doValidate]);

  // --- Handle config change ---
  function handleChange(field: string, value: string | number) {
    setQuote(null);
    setRecommendation(null);
    setConfig((prev) => ({ ...prev, [field]: value }));
  }

  // --- Get recommendation ---
  async function handleRecommend() {
    setLoading((p) => ({ ...p, recommend: true }));
    setError(null);
    try {
      const res = await fetch("/api/configurator/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family: FAMILY_CODE, configuration: config }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setRecommendation(json.data);
      setActiveTab("recommend");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Recommendation failed");
    } finally {
      setLoading((p) => ({ ...p, recommend: false }));
    }
  }

  // --- Submit quote ---
  async function handleSubmitQuote() {
    if (!recommendation) return;
    setLoading((p) => ({ ...p, quote: true }));
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: quoteForm.companyName,
          contactName: quoteForm.contactName,
          email: quoteForm.email,
          phone: quoteForm.phone,
          projectName: quoteForm.projectName,
          quantity: parseInt(quoteForm.quantity, 10),
          configuration: config,
          hardware: recommendation.hardware,
          estimatedTotal: recommendation.bom.subtotal,
          notes: quoteForm.notes || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setQuote(json.data);
      setActiveTab("quote");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Quote submission failed");
    } finally {
      setLoading((p) => ({ ...p, quote: false }));
    }
  }

  function handleQuoteFormChange(field: string, value: string) {
    setQuoteForm((prev) => ({ ...prev, [field]: value }));
  }

  // --- Loading state ---
  if (loading.attributes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-500">Loading configurator…</p>
        </div>
      </div>
    );
  }

  if (error && !attributes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="rounded-xl border border-red-200 bg-white p-6 text-center dark:border-red-900 dark:bg-zinc-900">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Error</p>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Header family={family} />

      {/* Main: Left Form + Right Results */}
      <div className="mx-auto flex max-w-7xl gap-0 px-4 pb-16 pt-6 lg:px-6">
        {/* ============================================================ */}
        {/* LEFT PANEL: Configuration Form                               */}
        {/* ============================================================ */}
        <aside className="w-full shrink-0 lg:w-[400px]">
          <div className="sticky top-20">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                ⚙️ Configuration
              </h2>

              <div className="space-y-4">
                {attributes?.map((attr) => (
                  <AttributeInput
                    key={attr.id}
                    attr={attr}
                    value={config[CODE_TO_FIELD[attr.code] ?? attr.code]}
                    onChange={handleChange}
                  />
                ))}
              </div>

              {/* Action button */}
              <button
                onClick={handleRecommend}
                disabled={loading.recommend || !validation?.valid}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading.recommend ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white dark:border-zinc-600 dark:border-t-zinc-900" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <span>🧠</span> Get Recommendation
                  </>
                )}
              </button>

              {/* Validation indicator */}
              {validation && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs font-medium ${
                    validation.valid
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                  }`}
                >
                  {validation.valid ? "✓ Configuration valid" : "✗ Invalid configuration"}
                  {validation.errors.length > 0 && (
                    <ul className="mt-1 list-inside list-disc">
                      {validation.errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT PANEL: Results                                         */}
        {/* ============================================================ */}
        <main className="ml-0 min-w-0 flex-1 lg:ml-6 lg:mt-0">
          {!recommendation ? (
            /* Empty state */
            <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50 dark:border-zinc-700 dark:bg-zinc-900/50">
              <div className="text-center">
                <div className="text-4xl">👈</div>
                <p className="mt-3 text-sm font-medium text-zinc-500">
                  Configure your door on the left, then click
                </p>
                <p className="text-sm text-zinc-400">
                  &ldquo;Get Recommendation&rdquo; to see results here
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Tab bar */}
              <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
                {(["recommend", "quote"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={tab === "quote" && !recommendation}
                    className={`flex-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    {tab === "recommend" ? "📦 Recommendation" : "📄 Quote"}
                  </button>
                ))}
              </div>

              {activeTab === "recommend" && (
                <>
                  {/* Calculation Card */}
                  <CalculationCard calc={recommendation.calculation} />

                  {/* Matched Rule Card */}
                  <RuleCard rule={recommendation.matchedRule} />

                  {/* Warnings */}
                  {recommendation.warnings.length > 0 && (
                    <WarningsCard warnings={recommendation.warnings} />
                  )}

                  {/* Hardware Items */}
                  <HardwareCard items={recommendation.hardware} />

                  {/* BOM Summary */}
                  <BomCard
                    items={recommendation.bom.items}
                    subtotal={recommendation.bom.subtotal}
                    config={config}
                  />
                </>
              )}

              {activeTab === "quote" && quote && (
                <QuoteSuccessCard quote={quote} config={config} />
              )}

              {activeTab === "quote" && !quote && (
                /* Quote form */
                <QuoteFormCard
                  form={quoteForm}
                  onChange={handleQuoteFormChange}
                  onSubmit={handleSubmitQuote}
                  loading={loading.quote}
                  subtotal={recommendation.bom.subtotal}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================
// Header
// ============================================================

function Header({ family }: { family: FamilyWithAttributes["family"] | null }) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <div className="flex items-center gap-2">
            <a
              href="/home"
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Home
            </a>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {family?.name ?? "Glass Swing Door"} Configurator
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-zinc-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            API Connected
          </span>
          <a
            href="/doc"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            API Docs
          </a>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// Attribute Input (renders select or number based on dataType)
// ============================================================

function AttributeInput({
  attr,
  value,
  onChange,
}: {
  attr: ConfiguratorAttribute;
  value: string | number | undefined;
  onChange: (field: string, value: string | number) => void;
}) {
  const field = CODE_TO_FIELD[attr.code] ?? attr.code;
  const icon = ATTR_ICONS[attr.code] ?? "";

  if (attr.dataType === "select" && attr.options.length > 0) {
    return (
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {icon} {attr.name}
          {attr.required && (
            <span className="text-red-400">*</span>
          )}
        </label>
        <select
          value={String(value ?? attr.options[0].code)}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
        >
          {attr.options.map((opt) => (
            <option key={opt.id} value={opt.code}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (attr.dataType === "number") {
    return (
      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {icon} {attr.name}
          {attr.required && (
            <span className="text-red-400">*</span>
          )}
        </label>
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(field, parseInt(e.target.value, 10) || 0)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-500"
        />
      </div>
    );
  }

  // Fallback for text / unknown types
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {attr.name}
      </label>
      <input
        type="text"
        value={String(value ?? "")}
        onChange={(e) => onChange(field, e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </div>
  );
}

// ============================================================
// Result Cards
// ============================================================

function CalculationCard({
  calc,
}: {
  calc: { area: number; glassWeight: number };
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        📐 Calculation
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {calc.area.toFixed(2)}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">Area (m²)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {calc.glassWeight.toFixed(1)}
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">Glass Weight (kg)</div>
        </div>
      </div>
    </div>
  );
}

function RuleCard({
  rule,
}: {
  rule: { code: string; name: string; priority: number } | null;
}) {
  if (!rule) return null;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        🧠 Matched Rule
      </h3>
      <div className="mt-3">
        <div className="flex items-center gap-3">
          <code className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
            {rule.code}
          </code>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {rule.name}
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            Priority {rule.priority}
          </span>
        </div>
      </div>
    </div>
  );
}

function WarningsCard({ warnings }: { warnings: string[] }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
        ⚠️ Warnings
      </h3>
      <ul className="mt-2 space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-amber-700 dark:text-amber-400">
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HardwareCard({ items }: { items: HardwareItem[] }) {
  if (!items.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          📦 Recommended Hardware ({items.length} items)
        </h3>
      </div>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item, i) => (
          <HardwareItemRow key={`${item.sku}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

function HardwareItemRow({ item }: { item: HardwareItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[11px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {item.sku}
            </code>
            {!item.required && (
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                optional
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {item.name}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
            <span className="rounded bg-zinc-50 px-1.5 py-0.5 dark:bg-zinc-800">
              {item.productType}
            </span>
            <span>
              Qty: <strong>{item.quantity}</strong> {item.unit}
            </span>
          </div>

          {/* Why recommended */}
          {item.whyRecommended.length > 0 && expanded && (
            <ul className="mt-3 space-y-1 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
              {item.whyRecommended.map((reason, i) => (
                <li
                  key={i}
                  className="text-xs text-emerald-700 dark:text-emerald-400"
                >
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            ${item.totalPrice.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-400">
            ${item.unitPrice.toFixed(2)} / {item.unit}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-1.5 text-[11px] text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            {expanded ? "Hide reasons" : "Why?"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BomCard({
  items,
  subtotal,
  config,
}: {
  items: HardwareItem[];
  subtotal: number;
  config?: ConfigValues;
}) {
  const bomRows = items.map((item) => ({
    SKU: item.sku,
    Name: item.name,
    Type: item.productType,
    Required: item.required ? "Yes" : "No",
    Quantity: item.quantity,
    Unit: item.unit,
    "Unit Price": `$${item.unitPrice.toFixed(2)}`,
    "Total Price": `$${item.totalPrice.toFixed(2)}`,
  }));

  function downloadCSV() {
    const headers = Object.keys(bomRows[0]);
    const csvContent = [
      headers.join(","),
      ...bomRows.map((row) =>
        headers.map((h) => `"${String(row[h as keyof typeof row]).replace(/"/g, '""')}"`).join(",")
      ),
      "",
      `"Subtotal",,,,,"",,$${subtotal.toFixed(2)}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BOM_Glass_Swing_Door_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;

    const configSummary = config
      ? Object.entries(config)
          .map(([k, v]) => `<tr><td style="padding:2px 8px;font-size:12px;color:#666">${k}</td><td style="padding:2px 8px;font-size:12px;font-weight:500">${v}</td></tr>`)
          .join("")
      : "";

    const rowsHtml = items
      .map(
        (item, i) => `
      <tr style="border-bottom:1px solid #eee">
        <td style="padding:4px 8px;font-size:11px;font-family:monospace">${item.sku}</td>
        <td style="padding:4px 8px;font-size:12px">${item.name}</td>
        <td style="padding:4px 8px;font-size:11px;text-align:center">${item.productType}</td>
        <td style="padding:4px 8px;font-size:11px;text-align:center">${item.quantity} ${item.unit}</td>
        <td style="padding:4px 8px;font-size:11px;text-align:right;font-family:monospace">$${item.unitPrice.toFixed(2)}</td>
        <td style="padding:4px 8px;font-size:11px;text-align:right;font-family:monospace;font-weight:600">$${item.totalPrice.toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html><head><title>BOM - Glass Swing Door</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:40px;color:#1a1a1a}</style></head>
<body>
  <h1 style="font-size:22px;margin-bottom:4px">Material List</h1>
  <p style="font-size:13px;color:#666;margin:0 0 20px">Glass Swing Door — ${new Date().toISOString().slice(0, 10)}</p>
  ${configSummary ? `<table style="margin-bottom:24px;border-collapse:collapse">${configSummary}</table>` : ""}
  <table style="width:100%;border-collapse:collapse">
    <thead><tr style="background:#f4f4f4">
      <th style="padding:6px 8px;font-size:11px;text-align:left;text-transform:uppercase;color:#888">SKU</th>
      <th style="padding:6px 8px;font-size:11px;text-align:left;text-transform:uppercase;color:#888">Name</th>
      <th style="padding:6px 8px;font-size:11px;text-align:center;text-transform:uppercase;color:#888">Type</th>
      <th style="padding:6px 8px;font-size:11px;text-align:center;text-transform:uppercase;color:#888">Qty</th>
      <th style="padding:6px 8px;font-size:11px;text-align:right;text-transform:uppercase;color:#888">Unit</th>
      <th style="padding:6px 8px;font-size:11px;text-align:right;text-transform:uppercase;color:#888">Total</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  <div style="margin-top:20px;text-align:right;font-size:18px;font-weight:700">Subtotal: $${subtotal.toFixed(2)}</div>
</body></html>`;

    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 300);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          💰 Bill of Materials
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={downloadCSV}
            className="rounded-md border border-zinc-200 px-2.5 py-1 text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
          >
            CSV
          </button>
          <button
            onClick={downloadPDF}
            className="rounded-md border border-zinc-200 px-2.5 py-1 text-[10px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300"
          >
            PDF
          </button>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="space-y-2">
          {items.map((item, i) => (
            <div
              key={`${item.sku}-${i}`}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-1 py-0.5 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.sku}
                </code>
                <span className="text-zinc-600 dark:text-zinc-400">
                  ×{item.quantity}
                </span>
              </div>
              <span className="font-mono font-medium text-zinc-800 dark:text-zinc-200">
                ${item.totalPrice.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Subtotal
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ${subtotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuoteFormCard({
  form,
  onChange,
  onSubmit,
  loading,
  subtotal,
}: {
  form: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  subtotal: number;
}) {
  const fields = [
    { key: "companyName", label: "Company Name", type: "text", required: true },
    { key: "contactName", label: "Contact Name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "text", required: true },
    { key: "projectName", label: "Project Name", type: "text", required: true },
    { key: "quantity", label: "Quantity", type: "number", required: true },
    { key: "notes", label: "Notes", type: "text", required: false },
  ];

  const isValid =
    form.companyName &&
    form.contactName &&
    form.email &&
    form.phone &&
    form.projectName &&
    parseInt(form.quantity, 10) > 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        📝 Request Quote
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.key === "notes" ? "sm:col-span-2" : ""}>
            <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              {f.label}
              {f.required && <span className="text-red-400">*</span>}
            </label>
            {f.key === "notes" ? (
              <textarea
                value={form[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            ) : (
              <input
                type={f.type}
                value={form[f.key]}
                onChange={(e) => onChange(f.key, e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 transition-colors focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                required={f.required}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <div className="text-sm text-zinc-500">
          Estimated Total:{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            ${subtotal.toFixed(2)}
          </strong>
        </div>
        <button
          onClick={onSubmit}
          disabled={!isValid || loading}
          className="rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-white dark:border-zinc-600 dark:border-t-zinc-900" />
              Submitting…
            </span>
          ) : (
            "Submit Quote"
          )}
        </button>
      </div>
    </div>
  );
}

function QuoteSuccessCard({
  quote,
  config,
}: {
  quote: QuoteResult;
  config: ConfigValues;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-6 dark:border-emerald-800 dark:bg-zinc-900">
      <div className="text-center">
        <div className="text-3xl">🎉</div>
        <h3 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Quote Submitted Successfully!
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Your quote number is
        </p>
        <code className="mt-2 inline-block rounded-lg bg-zinc-100 px-4 py-2 text-xl font-bold tracking-wider text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
          {quote.quoteNumber}
        </code>
        <p className="mt-3 text-xs text-zinc-400">
          Status: <span className="font-medium text-emerald-600 dark:text-emerald-400">{quote.status}</span>
          {" · "}ID: {quote.id}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
          >
            New Configuration
          </button>
          <a
            href="/doc"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            View API Docs
          </a>
        </div>
      </div>
    </div>
  );
}
