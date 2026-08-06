import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hardware Configurator — AI-Powered B2B Product Configurator",
  description:
    "Enterprise-grade hardware configurator for glass doors, windows, and architectural hardware. AI-powered rule engine, real-time pricing, BOM generation, and quote management.",
};

// ============================================================
// Data
// ============================================================

interface ProductFamily {
  code: string;
  name: string;
  description: string;
  icon: string;
  status: "live" | "coming" | "planned";
  eta?: string;
}

const productFamilies: ProductFamily[] = [
  {
    code: "GLASS_SWING_DOOR",
    name: "Glass Swing Door",
    description:
      "Frameless glass swing door hardware. Hinges, handles, locks, seals, door closers, and accessories. 25 matching rules across 50 SKUs.",
    icon: "🚪",
    status: "live",
  },
  {
    code: "SLIDING_DOOR",
    name: "Sliding Door",
    description:
      "Glass sliding door systems including top-hung and bottom-rolling configurations. Track systems, rollers, guides, and soft-close mechanisms.",
    icon: "🪟",
    status: "coming",
    eta: "Q4 2026",
  },
  {
    code: "SHOWER_DOOR",
    name: "Shower Door",
    description:
      "Frameless shower door and enclosure hardware. Pivot hinges, side panels, support bars, U-channels, and water seals.",
    icon: "🚿",
    status: "coming",
    eta: "Q4 2026",
  },
  {
    code: "OFFICE_PARTITION",
    name: "Office Partition",
    description:
      "Demountable glass partition systems. Floor channels, ceiling channels, glass-to-glass connectors, door integrated frames.",
    icon: "🏢",
    status: "planned",
  },
  {
    code: "RAILING",
    name: "Railing",
    description:
      "Glass railing and balustrade hardware. Spigots, standoffs, base channels, handrail brackets, and glass clamps.",
    icon: "🏗️",
    status: "planned",
  },
  {
    code: "SPIDER_FITTINGS",
    name: "Spider Fittings",
    description:
      "Point-fixed spider fittings for structural glass façades. 1-arm, 2-arm, 4-arm spiders, rotules, and fin supports.",
    icon: "🕸️",
    status: "planned",
  },
  {
    code: "CURTAIN_WALL",
    name: "Curtain Wall",
    description:
      "Unitized and stick-built curtain wall hardware. Mullions, transoms, pressure plates, gaskets, and thermal breaks.",
    icon: "🏬",
    status: "planned",
  },
  {
    code: "ALUMINUM_DOOR",
    name: "Aluminum Door",
    description:
      "Aluminum framed door hardware. Multi-point locks, panic bars, concealed closers, thresholds, and weather seals.",
    icon: "🔲",
    status: "planned",
  },
  {
    code: "WINDOW_HARDWARE",
    name: "Window Hardware",
    description:
      "Window opening systems. Casement stays, friction hinges, multi-point espags, restrictors, handles, and trickle vents.",
    icon: "🪟",
    status: "planned",
  },
];

const stats = [
  { value: "25", label: "Rule Engine Rules" },
  { value: "50", label: "Hardware SKUs" },
  { value: "8", label: "Product Categories" },
  { value: "9", label: "Product Families" },
];

const howItWorks = [
  {
    step: 1,
    title: "Configure",
    description:
      "Select your product family and specify dimensions, glass thickness, mounting type, finish, and hardware preferences through the configurator wizard.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Validate",
    description:
      "The system validates all inputs against product family constraints. Width ranges, height ranges, glass thickness compatibility, and option dependencies are checked in real time.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Recommend",
    description:
      "Our AI rule engine matches your configuration against 25 hierarchical rules using AND-logic conditions. Fractions, glass weight, dimensions, and finish all factor into the optimal hardware selection.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Generate Quote",
    description:
      "A complete BOM is generated with quantities, unit prices, and total pricing. Submit as a quote with one click. Quotes include full configuration snapshots, hardware line items, and estimated totals.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

const features = [
  {
    title: "25-Rule Engine",
    description:
      "Hierarchical rule matching with AND-logic conditions. Operators: eq, neq, gte, lte. Rules sorted by priority, highest match wins. Supports finish-specific overrides and dimension-based selection.",
    icon: "🧠",
  },
  {
    title: "50 Hardware SKUs",
    description:
      "Comprehensive catalog across 8 categories: hinges, handles, locks, floor springs, door closers, glass clamps, seals, and accessories. Each SKU carries physical constraints and pricing data.",
    icon: "📦",
  },
  {
    title: "Smart BOM Generation",
    description:
      "Automatic quantity resolution based on door weight and dimensions. 23 quantity override rules ensure correct hardware counts. Compatibility checking prevents conflicting SKU pairings.",
    icon: "📋",
  },
  {
    title: "REST API",
    description:
      "11 endpoints covering families, attributes, validation, recommendation, BOM generation, pricing, and quote management. Consistent JSON envelope, Zod validation, PostgreSQL-backed.",
    icon: "🔌",
  },
  {
    title: "TypeScript Stack",
    description:
      "Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, PostgreSQL with Prisma 7 + raw SQL repositories. Domain-driven design with clean separation of concerns.",
    icon: "⚡",
  },
  {
    title: "Extensible Architecture",
    description:
      "Product family abstraction supports adding new door/window types without changing the engine. Clean domain → application → infrastructure layers. PostgreSQL schema designed for multi-family expansion.",
    icon: "🧩",
  },
];

const databaseTables = [
  { table: "product_family", rows: 1, purpose: "Product family definitions (extensible)" },
  { table: "configurator_attribute", rows: 9, purpose: "Configurable door parameters" },
  { table: "attribute_option", rows: 19, purpose: "Selectable values per attribute" },
  { table: "product_sku", rows: 50, purpose: "Sellable hardware SKUs with specs & pricing" },
  { table: "recommendation_rule", rows: 25, purpose: "Hardware recommendation rules" },
  { table: "recommendation_rule_condition", rows: 76, purpose: "Rule conditions (AND logic)" },
  { table: "recommendation_rule_item", rows: 84, purpose: "SKU assignments per rule" },
  { table: "recommendation_quantity_rule", rows: 23, purpose: "Dynamic quantity overrides" },
  { table: "sku_compatibility", rows: 10, purpose: "SKU compatibility relationships" },
  { table: "bom", rows: 1, purpose: "Reusable BOM templates" },
  { table: "bom_item", rows: 5, purpose: "BOM template line items" },
  { table: "test_configuration", rows: 5, purpose: "Pre-built test configurations" },
  { table: "quotes", rows: "—", purpose: "Submitted quote requests" },
  { table: "quote_items", rows: "—", purpose: "Quote hardware line items" },
];

const apiEndpoints = [
  { method: "GET", path: "/api/configurator/families", desc: "List all product families" },
  { method: "GET", path: "/api/configurator/attributes", desc: "Get configurator attributes with options" },
  { method: "POST", path: "/api/configurator/validate", desc: "Validate a door configuration" },
  { method: "POST", path: "/api/configurator/recommend", desc: "Recommend hardware package (core)" },
  { method: "POST", path: "/api/configurator/bom", desc: "Generate priced BOM" },
  { method: "POST", path: "/api/configurator/price", desc: "Calculate price for product + options" },
  { method: "GET", path: "/api/configurator/:id", desc: "Get product configuration options" },
  { method: "GET", path: "/api/products/:id", desc: "Get full product detail" },
  { method: "GET", path: "/api/products/:id/variants", desc: "Get product variants with recommendations" },
  { method: "POST", path: "/api/quotes", desc: "Submit a quote request" },
  { method: "GET", path: "/api/quotes/:id", desc: "Retrieve a submitted quote" },
];

const hardwareCategories = [
  "hinge",
  "handle",
  "lock",
  "floor_spring",
  "door_closer",
  "glass_clamp",
  "seal",
  "accessory",
];

const finishOptions = [
  { code: "sss", label: "Satin Stainless Steel", hex: "#C0C0C0" },
  { code: "pss", label: "Polished Stainless Steel", hex: "#E8E8E8" },
  { code: "black", label: "Matte Black", hex: "#2D2D2D" },
  { code: "gold", label: "Brushed Gold", hex: "#D4A853" },
];

// ============================================================
// Page Component
// ============================================================

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* ================================================================ */}
      {/* ① Navigation Bar                                                  */}
      {/* ================================================================ */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white">
              <span className="text-sm font-bold text-white dark:text-zinc-900">HC</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              Hardware Configurator
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <a href="#families" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              Families
            </a>
            <a href="#how-it-works" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              How It Works
            </a>
            <a href="/glass" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              Configurator
            </a>
            <a href="#api" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              API
            </a>
            <a href="/doc" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              Docs
            </a>
            <a href="/admin" className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
              Admin
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href="/glass"
              className="hidden rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200 sm:inline-flex"
            >
              Configurator →
            </a>
            <a
              href="#cta"
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* ② Hero                                                            */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        {/* Gradient mesh background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-zinc-200/50 blur-3xl dark:bg-zinc-800/30" />
          <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-zinc-300/30 blur-3xl dark:bg-zinc-700/20" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Glass Swing Door — Live in Production
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">AI-Powered B2B</span>
              <span className="mt-2 block bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900 bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-400 dark:to-zinc-100">
                Product Configurator
              </span>
              <span className="mt-2 block text-zinc-500 dark:text-zinc-400">
                for Glass Door Hardware
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-zinc-500 dark:text-zinc-400">
              Enterprise-grade configurator engine that validates configurations, matches 25
              hardware recommendation rules across 50 SKUs, resolves quantities by weight and
              dimensions, checks compatibility, and generates priced BOMs — all through a clean
              REST API.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <a
                href="/doc"
                className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 hover:shadow-md dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Explore the API
              </a>
              <a
                href="#how-it-works"
                className="rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                How It Works
              </a>
            </div>

            {/* Trust stats */}
            <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-zinc-100 bg-white/60 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60"
                >
                  <div className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ③ Product Families                                                */}
      {/* ================================================================ */}
      <section id="families" className="scroll-mt-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Product Families
            </h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              One platform. Nine configurable product lines. Start with Glass Swing Door — more
              families are planned for upcoming releases.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productFamilies.map((family) => (
              <div
                key={family.code}
                className={`group relative rounded-xl border p-5 transition-all ${
                  family.status === "live"
                    ? "border-emerald-200 bg-white shadow-sm hover:shadow-md dark:border-emerald-800 dark:bg-zinc-900"
                    : family.status === "coming"
                      ? "border-amber-200 bg-white/60 hover:border-amber-300 dark:border-amber-800 dark:bg-zinc-900/60 dark:hover:border-amber-700"
                      : "border-zinc-200 bg-white/40 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
                }`}
              >
                {/* Status badge */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl">{family.icon}</span>
                  <StatusBadge status={family.status} eta={family.eta} />
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {family.name}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {family.description}
                </p>

                {family.status === "live" && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Active — 50 SKUs · 25 Rules
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ④ How It Works                                                    */}
      {/* ================================================================ */}
      <section id="how-it-works" className="scroll-mt-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              From configuration to quote — a four-step AI-powered pipeline
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Step number */}
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.step}
                </div>

                {/* Icon */}
                <div className="mb-3 text-zinc-600 dark:text-zinc-400">
                  {item.icon}
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Pipeline diagram */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {howItWorks.map((item, i) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {item.title}
                </div>
                {i < howItWorks.length - 1 && (
                  <span className="text-zinc-300 dark:text-zinc-600">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑤ Feature Highlights                                              */}
      {/* ================================================================ */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Platform Features</h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              Built for hardware manufacturers and distributors who need reliable, automated product
              configuration
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 text-2xl">{feature.icon}</div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Finish options */}
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Available Finishes
            </h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {finishOptions.map((finish) => (
                <div
                  key={finish.code}
                  className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div
                    className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-600"
                    style={{ backgroundColor: finish.hex }}
                  />
                  <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                    {finish.code}
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-500">—</span>
                  <span className="text-xs text-zinc-700 dark:text-zinc-300">
                    {finish.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑥ Architecture Overview                                           */}
      {/* ================================================================ */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Clean Architecture</h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              Domain-driven design with clear separation of concerns. Each layer is independently
              testable and swappable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {([
              {
                layer: "Route Handler",
                desc: "Thin HTTP layer. Parse request, Zod validate, call service, return response. Zero business logic.",
                path: "app/api/configurator/**/route.ts",
                color: "border-l-blue-400 dark:border-l-blue-500",
              },
              {
                layer: "Application",
                desc: "Orchestrates the recommendation pipeline. Calls repositories and domain services in sequence.",
                path: "src/application/configurator/",
                color: "border-l-emerald-400 dark:border-l-emerald-500",
              },
              {
                layer: "Domain",
                desc: "Pure TypeScript. Calculator, rule engine, quantity engine, compatibility checker, BOM builder.",
                path: "src/domain/configurator/",
                color: "border-l-amber-400 dark:border-l-amber-500",
              },
              {
                layer: "Infrastructure",
                desc: "PostgreSQL via pg Pool. All SQL in repository files — easily testable and swappable.",
                path: "src/infrastructure/db/repositories/",
                color: "border-l-purple-400 dark:border-l-purple-500",
              },
            ] as const).map((item) => (
              <div
                key={item.layer}
                className={`rounded-xl border border-zinc-200 border-l-4 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 ${item.color}`}
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.layer}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
                <code className="mt-3 block text-[11px] text-zinc-400 dark:text-zinc-500">
                  {item.path}
                </code>
              </div>
            ))}
          </div>

          {/* Hardware categories */}
          <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Hardware Categories
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hardwareCategories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑦ API Reference                                                   */}
      {/* ================================================================ */}
      <section id="api" className="scroll-mt-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">REST API</h2>
                <p className="mt-2 text-base text-zinc-500 dark:text-zinc-400">
                  11 endpoints. Consistent JSON envelope. All inputs Zod-validated.
                </p>
              </div>
              <a
                href="/doc"
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
              >
                Full Documentation →
              </a>
            </div>
          </div>

          {/* Endpoint table */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Method
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Endpoint
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {apiEndpoints.map((ep) => (
                    <tr
                      key={ep.path}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="px-5 py-3">
                        <MethodBadge method={ep.method} />
                      </td>
                      <td className="px-5 py-3">
                        <code className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {ep.path}
                        </code>
                      </td>
                      <td className="hidden px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400 sm:table-cell">
                        {ep.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Response envelope */}
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-2 dark:border-zinc-800 dark:bg-zinc-900">
              <span className="text-xs font-medium text-zinc-500">Response Envelope</span>
            </div>
            <pre className="overflow-x-auto bg-white p-5 dark:bg-zinc-950">
              <code className="text-xs leading-6 text-zinc-700 dark:text-zinc-300">
                {`// Success (200/201)
{ "success": true, "data": { ... } }

// Error (400/404/500)
{ "success": false, "error": "Human-readable message" }`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑧ Database Overview                                               */}
      {/* ================================================================ */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">PostgreSQL Database</h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
              14 tables powering configuration, recommendation, BOM generation, and quote
              management
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Table
                    </th>
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Rows
                    </th>
                    <th className="hidden px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 sm:table-cell">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                  {databaseTables.map((t) => (
                    <tr
                      key={t.table}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="px-5 py-2.5">
                        <code className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {t.table}
                        </code>
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <code className="text-xs text-zinc-500">{t.rows}</code>
                      </td>
                      <td className="hidden px-5 py-2.5 text-xs text-zinc-500 dark:text-zinc-400 sm:table-cell">
                        {t.purpose}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑨ CTA Banner                                                      */}
      {/* ================================================================ */}
      <section id="cta" className="scroll-mt-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 p-10 text-center dark:border-zinc-700 dark:bg-zinc-100">
            {/* Background pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-10">
              <div className="absolute -left-20 -top-20 h-[300px] w-[300px] rounded-full bg-white/20 blur-2xl" />
              <div className="absolute -bottom-20 right-10 h-[250px] w-[250px] rounded-full bg-white/10 blur-2xl" />
            </div>

            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl dark:text-zinc-900">
                Ready to Automate Your Hardware Configuration?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-zinc-400 dark:text-zinc-600">
                Explore the full API documentation, run test configurations, and see how the rule
                engine matches hardware to your specifications.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <a
                  href="/doc"
                  className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-all hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
                >
                  View API Docs
                </a>
                <a
                  href="#families"
                  className="rounded-xl border border-zinc-600 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-400 hover:text-white dark:border-zinc-400 dark:text-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-900"
                >
                  Explore Families
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* ⑩ Footer                                                          */}
      {/* ================================================================ */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
                  <span className="text-xs font-bold text-white dark:text-zinc-900">HC</span>
                </div>
                <span className="text-sm font-semibold tracking-tight">
                  Hardware Configurator
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                AI-powered B2B product configurator for architectural hardware. Built with Next.js
                16, TypeScript, and PostgreSQL.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Product
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="/glass" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                    Configurator
                  </a>
                </li>
                <li>
                  <a href="#families" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                    Product Families
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="/doc" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200">
                    Database Admin
                  </a>
                </li>
              </ul>
            </div>

            {/* Technology */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Technology
              </h3>
              <ul className="mt-3 space-y-2">
                <li className="text-sm text-zinc-500">Next.js 16</li>
                <li className="text-sm text-zinc-500">TypeScript Strict</li>
                <li className="text-sm text-zinc-500">Tailwind CSS v4</li>
                <li className="text-sm text-zinc-500">PostgreSQL + Prisma 7</li>
              </ul>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Status
              </h3>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Glass Swing Door — Live
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                  Sliding Door — Q4 2026
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400" />
                  Shower Door — Q4 2026
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-500">
                  <span className="flex h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />6 more planned
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
            © 2026 Hardware Configurator. Built for the architectural hardware industry.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StatusBadge({
  status,
  eta,
}: {
  status: "live" | "coming" | "planned";
  eta?: string;
}) {
  const styles: Record<string, string> = {
    live: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
    coming:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
    planned:
      "border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500",
  };
  const labels: Record<string, string> = {
    live: "Live",
    coming: eta ? `Coming ${eta}` : "Coming Soon",
    planned: "Planned",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors =
    method === "GET"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold font-mono ${colors}`}
    >
      {method}
    </span>
  );
}
