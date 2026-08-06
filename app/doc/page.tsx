import type { Metadata } from "next";
import { CopyButton } from "./copy-button";

export const metadata: Metadata = {
  title: "API Documentation — Glass Swing Door Configurator",
  description: "Complete API reference for the Glass Swing Door Hardware Configurator.",
};

// ============================================================
// Data — all endpoint definitions in one place for easy editing
// ============================================================

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  title: string;
  description: string;
  request?: {
    contentType: string;
    body: Record<string, unknown>;
    params?: { name: string; type: string; description: string }[];
  };
  response: unknown;
  curl: string;
}

const baseUrl = "http://localhost:3000";

const endpoints: Endpoint[] = [
  // --- 1. Families ---
  {
    method: "GET",
    path: "/api/configurator/families",
    title: "List Product Families",
    description:
      "Returns all active product families. Currently only Glass Swing Door is available; the schema supports adding Shower Door, Sliding Door, Pivot Door etc. in future phases.",
    response: {
      success: true,
      data: [
        {
          id: 1,
          code: "GLASS_SWING_DOOR",
          name: "Glass Swing Door",
          description: "Frameless glass swing door hardware configurator demo",
          status: "active",
        },
      ],
    },
    curl: `curl ${baseUrl}/api/configurator/families`,
  },

  // --- 2. Get Product Detail ---
  {
    method: "GET",
    path: "/api/products/:id",
    title: "Get Product Detail",
    description:
      "Returns a product's full details including all configurable options with their selectable values and the product's variants. Useful for inspecting the full product definition.",
    request: {
      contentType: "Path Parameter",
      body: {},
      params: [
        { name: "id", type: "integer", description: "Product ID (e.g. 1)" },
      ],
    },
    response: {
      success: true,
      data: {
        id: 1,
        name: "Glass Swing Door",
        basePrice: "0",
        options: [
          {
            id: 1,
            name: "Door Type",
            values: [
              { id: 1, value: "single" },
              { id: 2, value: "double" },
            ],
          },
        ],
        variants: [
          {
            id: 1,
            sku: "DOOR-SINGLE-8-SSS",
            price: "0",
            stock: 100,
            optionCombination: {},
            recommendations: [],
          },
        ],
      },
    },
    curl: `curl ${baseUrl}/api/products/1`,
  },

  // --- 3. Get Product Variants ---
  {
    method: "GET",
    path: "/api/products/:id/variants",
    title: "Get Product Variants",
    description:
      "Returns all variants for a given product, including SKU, price, stock, and the option combination that defines each variant. Also includes recommended upsell SKUs per variant.",
    request: {
      contentType: "Path Parameter",
      body: {},
      params: [
        { name: "id", type: "integer", description: "Product ID (e.g. 1)" },
      ],
    },
    response: {
      success: true,
      data: [
        {
          id: 1,
          sku: "DOOR-SINGLE-8-SSS",
          price: "299.00",
          stock: 100,
          optionCombination: { doorType: "single", glassThickness: "8", finish: "sss" },
          recommendations: [
            { sku: "DOOR-SEAL-8MM", reason: "Compatible bottom seal for 8mm glass" },
          ],
        },
      ],
    },
    curl: `curl ${baseUrl}/api/products/1/variants`,
  },

  // --- 4. Attributes ---
  {
    method: "GET",
    path: "/api/configurator/attributes?family=GLASS_SWING_DOOR",
    title: "Get Configurator Attributes",
    description:
      "Returns all configurator attributes and their selectable options for a given product family. Attributes marked `required: true` must be provided in configuration requests; `required: false` attributes are optional.",
    request: {
      contentType: "Query Parameter",
      body: {},
      params: [
        { name: "family", type: "string", description: "Product family code, e.g. GLASS_SWING_DOOR" },
      ],
    },
    response: {
      success: true,
      data: {
        family: { id: 1, code: "GLASS_SWING_DOOR", name: "Glass Swing Door" },
        attributes: [
          {
            code: "door_type",
            name: "Door Type",
            dataType: "select",
            required: true,
            options: [
              { code: "single", label: "Single Door" },
              { code: "double", label: "Double Door" },
            ],
          },
          {
            code: "glass_thickness",
            name: "Glass Thickness",
            dataType: "select",
            required: true,
            options: [
              { code: "8", label: "8mm", numericValue: 8 },
              { code: "10", label: "10mm", numericValue: 10 },
              { code: "12", label: "12mm", numericValue: 12 },
            ],
          },
          {
            code: "door_width",
            name: "Door Width (mm)",
            dataType: "number",
            required: true,
            options: [],
          },
          {
            code: "door_height",
            name: "Door Height (mm)",
            dataType: "number",
            required: true,
            options: [],
          },
          {
            code: "mounting_type",
            name: "Mounting Type",
            dataType: "select",
            required: true,
            options: [
              { code: "glass_to_glass", label: "Glass-to-Glass" },
              { code: "glass_to_wall", label: "Glass-to-Wall" },
            ],
          },
          {
            code: "opening_type",
            name: "Opening Type",
            dataType: "select",
            required: true,
            options: [
              { code: "left", label: "Left Hand" },
              { code: "right", label: "Right Hand" },
              { code: "double", label: "Double Swing" },
            ],
          },
          {
            code: "finish",
            name: "Finish",
            dataType: "select",
            required: true,
            options: [
              { code: "sss", label: "Satin Stainless Steel" },
              { code: "pss", label: "Polished Stainless Steel" },
              { code: "black", label: "Matte Black" },
              { code: "gold", label: "Brushed Gold" },
            ],
          },
          {
            code: "handle_size",
            name: "Handle Size",
            dataType: "select",
            required: false,
            options: [
              { code: "600", label: "600mm", numericValue: 600 },
              { code: "800", label: "800mm", numericValue: 800 },
              { code: "1000", label: "1000mm", numericValue: 1000 },
            ],
          },
          {
            code: "lock_type",
            name: "Lock Type",
            dataType: "select",
            required: false,
            options: [
              { code: "standard", label: "Standard Glass Lock" },
              { code: "deadlock", label: "Dead Lock" },
            ],
          },
        ],
      },
    },
    curl: `curl "${baseUrl}/api/configurator/attributes?family=GLASS_SWING_DOOR"`,
  },

  // --- 5. Get Product Configuration Options ---
  {
    method: "GET",
    path: "/api/configurator/:id",
    title: "Get Product Configuration Options",
    description:
      "Returns the configurable options for a product by its numeric ID. Each option includes its name and available values. This endpoint provides a flattened view of options — use it when you need just the option/value structure without the full product details.",
    request: {
      contentType: "Path Parameter",
      body: {},
      params: [
        { name: "id", type: "integer", description: "Product ID (e.g. 1)" },
      ],
    },
    response: {
      success: true,
      data: {
        options: [
          { name: "Door Type", values: ["single", "double"] },
          { name: "Glass Thickness", values: ["8", "10", "12"] },
          { name: "Mounting Type", values: ["glass_to_glass", "glass_to_wall"] },
          { name: "Opening Type", values: ["left", "right", "double"] },
          { name: "Finish", values: ["sss", "pss", "black", "gold"] },
        ],
      },
    },
    curl: `curl ${baseUrl}/api/configurator/1`,
  },

  // --- 6. Validate ---
  {
    method: "POST",
    path: "/api/configurator/validate",
    title: "Validate Configuration",
    description:
      "Validates a door configuration against the family's attribute definitions. Checks that all required fields are present, values are within valid options, and dimensions are within supported ranges (width: 600–1400mm, height: 1800–2600mm).",
    request: {
      contentType: "application/json",
      body: {
        family: "GLASS_SWING_DOOR",
        configuration: {
          doorType: "single",
          glassThickness: "10",
          doorWidth: 900,
          doorHeight: 2100,
          mountingType: "glass_to_glass",
          openingType: "left",
          finish: "sss",
          handleSize: "600",
          lockType: "standard",
        },
      },
    },
    response: {
      success: true,
      data: { valid: true, errors: [] },
    },
    curl: `curl -X POST ${baseUrl}/api/configurator/validate \\
  -H "Content-Type: application/json" \\
  -d '{"family":"GLASS_SWING_DOOR","configuration":{"doorType":"single","glassThickness":"10","doorWidth":900,"doorHeight":2100,"mountingType":"glass_to_glass","openingType":"left","finish":"sss","handleSize":"600","lockType":"standard"}}'`,
  },

  // --- 7. Recommend (core) ---
  {
    method: "POST",
    path: "/api/configurator/recommend",
    title: "Recommend Hardware Package",
    description:
      "The core configurator API. Runs the full recommendation pipeline: validates configuration → calculates door area and glass weight → matches recommendation rules (25 rules, AND logic with eq/neq/gte/lte operators, highest priority wins) → resolves quantities via weight/size-based quantity rules → checks SKU compatibility → generates a priced BOM. See the data flow diagram below for details.",
    request: {
      contentType: "application/json",
      body: {
        family: "GLASS_SWING_DOOR",
        configuration: {
          doorType: "single",
          glassThickness: "10",
          doorWidth: 900,
          doorHeight: 2100,
          mountingType: "glass_to_glass",
          openingType: "left",
          finish: "sss",
          handleSize: "600",
          lockType: "standard",
        },
      },
    },
    response: {
      success: true,
      data: {
        configuration: {
          doorType: "single",
          glassThickness: "10",
          doorWidth: 900,
          doorHeight: 2100,
          mountingType: "glass_to_glass",
          openingType: "left",
          finish: "sss",
          handleSize: "600",
          lockType: "standard",
        },
        calculation: { area: 1.89, glassWeight: 47.25 },
        matchedRule: {
          code: "SWING-SINGLE-10-STD",
          name: "Single 10mm Standard Glass-to-Glass",
          priority: 110,
        },
        hardware: [
          {
            sku: "HINGE-G2G-90-SSS",
            name: "90 Degree Glass-to-Glass Hinge SSS",
            productType: "hinge",
            quantity: 3,
            required: true,
            unit: "pcs",
            unitPrice: 28,
            totalPrice: 84,
            whyRecommended: [
              "✓ Glass thickness compatible (8-10mm)",
              "✓ Door weight compatible (max 40kg)",
              "✓ Door width compatible (max 900mm)",
              "✓ Door height compatible (max 2100mm)",
              "✓ Finish matches (SSS)",
            ],
          },
          {
            sku: "HANDLE-600-SSS",
            name: "600mm Pull Handle SSS",
            productType: "handle",
            quantity: 1,
            required: true,
            unit: "set",
            unitPrice: 42,
            totalPrice: 42,
            whyRecommended: ["✓ Door size compatible", "✓ Finish matches (SSS)"],
          },
          {
            sku: "LOCK-GLASS-SSS",
            name: "Standard Glass Door Lock SSS",
            productType: "lock",
            quantity: 1,
            required: true,
            unit: "pcs",
            unitPrice: 38,
            totalPrice: 38,
            whyRecommended: ["✓ Door size compatible", "✓ Finish matches (SSS)"],
          },
          {
            sku: "SEAL-PVC-10MM",
            name: "PVC Glass Seal 10mm",
            productType: "seal",
            quantity: 1,
            required: false,
            unit: "m",
            unitPrice: 3.8,
            totalPrice: 3.8,
            whyRecommended: ["✓ Glass thickness compatible (10-10mm)"],
          },
          {
            sku: "SEAL-BOTTOM-UNIVERSAL",
            name: "Universal Bottom Door Seal",
            productType: "seal",
            quantity: 1,
            required: false,
            unit: "m",
            unitPrice: 8.5,
            totalPrice: 8.5,
            whyRecommended: ["✓ Glass thickness compatible (8-12mm)"],
          },
        ],
        bom: { items: ["..."], subtotal: 176.3 },
        warnings: [],
      },
    },
    curl: `curl -X POST ${baseUrl}/api/configurator/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"family":"GLASS_SWING_DOOR","configuration":{"doorType":"single","glassThickness":"10","doorWidth":900,"doorHeight":2100,"mountingType":"glass_to_glass","openingType":"left","finish":"sss","handleSize":"600","lockType":"standard"}}'`,
  },

  // --- 8. BOM ---
  {
    method: "POST",
    path: "/api/configurator/bom",
    title: "Generate Hardware BOM",
    description:
      "Generates a detailed Bill of Materials for a given configuration. Internally reuses the recommend pipeline and returns the BOM view. Supports an optional `ruleCode` to force a specific recommendation rule.",
    request: {
      contentType: "application/json",
      body: {
        family: "GLASS_SWING_DOOR",
        configuration: {
          doorType: "single",
          glassThickness: "10",
          doorWidth: 900,
          doorHeight: 2100,
          mountingType: "glass_to_glass",
          openingType: "left",
          finish: "sss",
        },
      },
    },
    response: {
      success: true,
      data: {
        family: "GLASS_SWING_DOOR",
        configuration: {},
        rule: { code: "SWING-SINGLE-10-STD", name: "...", priority: 110 },
        items: [],
        subtotal: 176.3,
      },
    },
    curl: `curl -X POST ${baseUrl}/api/configurator/bom \\
  -H "Content-Type: application/json" \\
  -d '{"family":"GLASS_SWING_DOOR","configuration":{"doorType":"single","glassThickness":"10","doorWidth":900,"doorHeight":2100,"mountingType":"glass_to_glass","openingType":"left","finish":"sss"}}'`,
  },

  // --- 9. Calculate Price ---
  {
    method: "POST",
    path: "/api/configurator/price",
    title: "Calculate Price",
    description:
      "Calculates the total price for a product with selected options. Takes a product ID and a key-value map of option selections. Adds each option's extra price to the product base price. Returns the total price, matched variant SKU, current stock, and any variant-level recommendations.",
    request: {
      contentType: "application/json",
      body: {
        productId: 1,
        options: {
          doorType: "single",
          glassThickness: "10",
          finish: "sss",
        },
      },
    },
    response: {
      success: true,
      data: {
        price: 349.5,
        sku: "DOOR-SINGLE-10-SSS",
        stock: 100,
        recommendations: [
          { sku: "DOOR-SEAL-10MM", reason: "Compatible seal for 10mm glass" },
        ],
      },
    },
    curl: `curl -X POST ${baseUrl}/api/configurator/price \\
  -H "Content-Type: application/json" \\
  -d '{"productId":1,"options":{"doorType":"single","glassThickness":"10","finish":"sss"}}'`,
  },

  // --- 10. Create Quote ---
  {
    method: "POST",
    path: "/api/quotes",
    title: "Submit Quote Request",
    description:
      "Submits a quote request with company details, the full door configuration, and the recommended hardware BOM. Returns a unique quote number (format: QT-YYYYMMDD-XXXX). Saves to the `quotes` and `quote_items` tables.",
    request: {
      contentType: "application/json",
      body: {
        companyName: "Test Corp",
        contactName: "John Smith",
        email: "john@testcorp.com",
        phone: "+1-555-0123",
        projectName: "Office Renovation",
        quantity: 3,
        configuration: {
          doorType: "single",
          glassThickness: "10",
          doorWidth: 900,
          doorHeight: 2100,
          mountingType: "glass_to_glass",
          openingType: "left",
          finish: "sss",
          handleSize: "600",
          lockType: "standard",
        },
        hardware: [
          {
            sku: "HINGE-G2G-90-SSS",
            name: "90 Degree Glass-to-Glass Hinge SSS",
            productType: "hinge",
            quantity: 3,
            required: true,
            unit: "pcs",
            unitPrice: 28,
            totalPrice: 84,
          },
        ],
        estimatedTotal: 176.3,
        notes: "Please deliver by end of month.",
      },
    },
    response: {
      success: true,
      data: {
        id: 1,
        quoteNumber: "QT-20260805-2643",
        status: "submitted",
      },
    },
    curl: `curl -X POST ${baseUrl}/api/quotes \\
  -H "Content-Type: application/json" \\
  -d '{"companyName":"Test Corp","contactName":"John","email":"john@test.com","phone":"123","projectName":"Office","quantity":3,"configuration":{...},"hardware":[...],"estimatedTotal":176.3}'`,
  },

  // --- 11. Get Quote ---
  {
    method: "GET",
    path: "/api/quotes/:id",
    title: "Get Quote Detail",
    description:
      "Retrieves a previously submitted quote by ID, including all company details, the full configuration, hardware items with pricing, and the quote status.",
    request: {
      contentType: "Path Parameter",
      body: {},
      params: [
        { name: "id", type: "integer", description: "Quote ID returned by POST /api/quotes" },
      ],
    },
    response: {
      success: true,
      data: {
        id: 1,
        quoteNumber: "QT-20260805-2643",
        companyName: "Test Corp",
        contactName: "John Smith",
        email: "john@testcorp.com",
        phone: "+1-555-0123",
        projectName: "Office Renovation",
        quantity: 3,
        configuration: {},
        estimatedTotal: 176.3,
        status: "submitted",
        notes: null,
        createdAt: "2026-08-05T12:00:00.000Z",
        items: [
          {
            sku: "HINGE-G2G-90-SSS",
            name: "90 Degree Glass-to-Glass Hinge SSS",
            quantity: 3,
            unitPrice: 28,
            totalPrice: 84,
          },
        ],
      },
    },
    curl: `curl ${baseUrl}/api/quotes/1`,
  },
];

const configurationFields = [
  { field: "doorType", type: '"single" | "double"', required: true, desc: "Single or double door" },
  { field: "glassThickness", type: '"8" | "10" | "12"', required: true, desc: "Glass thickness in mm" },
  { field: "doorWidth", type: "number", required: true, desc: "Door width in mm (600–1400)" },
  { field: "doorHeight", type: "number", required: true, desc: "Door height in mm (1800–2600)" },
  { field: "mountingType", type: '"glass_to_glass" | "glass_to_wall"', required: true, desc: "Mounting surface type" },
  { field: "openingType", type: '"left" | "right" | "double"', required: true, desc: "Door swing direction" },
  { field: "finish", type: '"sss" | "pss" | "black" | "gold"', required: true, desc: "Hardware finish" },
  { field: "handleSize", type: '"600" | "800" | "1000"', required: false, desc: "Pull handle length in mm" },
  { field: "lockType", type: '"standard" | "deadlock"', required: false, desc: "Door lock type" },
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

const quoteStatuses = ["draft", "submitted", "reviewing", "quoted", "closed"];

// ============================================================
// Page Component
// ============================================================

export default function DocPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Glass Swing Door Configurator
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            API Documentation
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Complete reference for all configurator API endpoints. The API follows a
            layered architecture: Route Handlers → Application Service → Domain Logic
            → Repositories → PostgreSQL.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* ---- Quick Nav ---- */}
        <nav className="mb-12 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Endpoints
          </h2>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {endpoints.map((ep) => (
              <li key={ep.path}>
                <a
                  href={`#${ep.path.replace(/[^a-zA-Z0-9]/g, "-")}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <MethodBadge method={ep.method} />
                  <code className="text-xs">{ep.path}</code>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <a
              href="#configuration-reference"
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Configuration Reference
            </a>
            <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href="#data-flow"
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Data Flow
            </a>
            <span className="mx-2 text-zinc-300 dark:text-zinc-700">·</span>
            <a
              href="#error-codes"
              className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              Error Codes
            </a>
          </div>
        </nav>

        {/* ---- Endpoint Sections ---- */}
        <div className="space-y-12">
          {endpoints.map((ep) => (
            <EndpointSection key={ep.path} endpoint={ep} />
          ))}
        </div>

        {/* ---- Configuration Reference ---- */}
        <section id="configuration-reference" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Configuration Reference
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            All configuration objects share these fields. Fields marked{" "}
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              required
            </span>{" "}
            must be provided in every request.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Field</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Required</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                {configurationFields.map((f) => (
                  <tr key={f.field}>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {f.field}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{f.type}</td>
                    <td className="px-4 py-3">
                      {f.required ? (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          required
                        </span>
                      ) : (
                        <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                          optional
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Data Flow ---- */}
        <section id="data-flow" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Data Flow
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            The recommend API executes this pipeline for each request:
          </p>
          <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <pre className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
{`POST /api/configurator/recommend
  │
  ├─ 1. Zod Validate ── validate request body
  │
  ├─ 2. Lookup Family ── verify product family exists
  │
  ├─ 3. Load Rules ── fetch all enabled rules + conditions + items
  │
  ├─ 4. Calculate ── doorArea = (W×H)/1e6 m²
  │                   glassWeight = area × factor (8mm→20, 10mm→25, 12mm→30 kg/m²)
  │
  ├─ 5. Match Rules ── for each rule: ALL conditions must pass (AND logic)
  │                     operators: eq | neq | gte | lte
  │                     sort by priority DESC, pick highest
  │
  ├─ 6. Resolve Qty ── apply quantity_rule overrides by weight/size ranges
  │                     e.g. 40–60kg → 3 hinges instead of 2
  │
  ├─ 7. Load SKUs ── fetch SKU details (name, price, unit, specs)
  │
  ├─ 8. Compatibility ── check sku_compatibility for conflicts
  │
  ├─ 9. Build BOM ── generate line items with pricing
  │
  └─ 10. Respond ── { configuration, calculation, matchedRule,
                      hardware[], bom: { subtotal }, warnings[] }`}
            </pre>
          </div>
        </section>

        {/* ---- Architecture ---- */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Architecture Layers
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                layer: "Route Handler",
                desc: "Thin HTTP layer. Parse request, Zod validate, call service, return response. No business logic.",
                path: "app/api/configurator/**/route.ts",
              },
              {
                layer: "Application",
                desc: "Orchestrates the pipeline. Calls repositories and domain services in order.",
                path: "src/application/configurator/",
              },
              {
                layer: "Domain",
                desc: "Pure TypeScript functions. Calculator, rule engine, quantity engine, compatibility checker, BOM builder.",
                path: "src/domain/configurator/",
              },
              {
                layer: "Infrastructure",
                desc: "PostgreSQL queries via pg Pool. All SQL is in repository files — easily testable and swappable.",
                path: "src/infrastructure/db/repositories/",
              },
            ].map((item) => (
              <div
                key={item.layer}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.layer}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
                <code className="mt-2 block text-[11px] text-zinc-400 dark:text-zinc-500">
                  {item.path}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Error Codes ---- */}
        <section id="error-codes" className="mt-16 scroll-mt-20">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Error Codes
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            All errors follow a consistent envelope:{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              {"{ success: false, error: string }"}
            </code>
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Meaning</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                <tr>
                  <td className="px-4 py-3">
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      200
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Success</td>
                  <td className="px-4 py-3 text-zinc-500">Normal response with data</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      201
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Created</td>
                  <td className="px-4 py-3 text-zinc-500">Quote successfully submitted</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      400
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Bad Request</td>
                  <td className="px-4 py-3 text-zinc-500">Invalid request body, missing required field</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      404
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Not Found</td>
                  <td className="px-4 py-3 text-zinc-500">Product family not found, quote not found</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      500
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">Internal Server Error</td>
                  <td className="px-4 py-3 text-zinc-500">Unexpected database error (details logged server-side)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Reference Data ---- */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Reference Data
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Hardware Categories
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hardwareCategories.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Quote Statuses
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {quoteStatuses.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Glass Weight Factors
              </h3>
              <div className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <p>8mm → 20 kg/m²</p>
                <p>10mm → 25 kg/m²</p>
                <p>12mm → 30 kg/m²</p>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Rule Matching Operators
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["eq", "neq", "gte", "lte"].map((op) => (
                  <span
                    key={op}
                    className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-mono text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {op}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                All conditions within a rule use AND logic. Rules are matched by priority DESC.
              </p>
            </div>
          </div>
        </section>

        {/* ---- Database Stats ---- */}
        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Database Overview
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Table</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Rows</th>
                  <th className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-400">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                {[
                  ["product_family", "1", "Product family definitions (extensible)"],
                  ["configurator_attribute", "9", "Configurable door parameters"],
                  ["attribute_option", "19", "Selectable values for each attribute"],
                  ["product_sku", "50", "Sellable hardware SKUs with specs & pricing"],
                  ["recommendation_rule", "25", "Hardware recommendation rules"],
                  ["recommendation_rule_condition", "76", "Rule matching conditions (eq/neq/gte/lte)"],
                  ["recommendation_rule_item", "84", "SKU recommendations per rule"],
                  ["recommendation_quantity_rule", "23", "Dynamic quantity overrides (weight-based)"],
                  ["sku_compatibility", "10", "SKU compatibility relationships"],
                  ["bom", "1", "Reusable BOM templates"],
                  ["bom_item", "5", "BOM template line items"],
                  ["test_configuration", "5", "Pre-built test configurations"],
                  ["quotes", "—", "Submitted quote requests"],
                  ["quote_items", "—", "Quote hardware line items"],
                ].map(([table, rows, purpose]) => (
                  <tr key={table}>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                      {table}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-xs text-zinc-500">
                      {rows}
                    </td>
                    <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-zinc-400">
          Glass Swing Door Hardware Configurator · Built with Next.js 16 · PostgreSQL
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function MethodBadge({ method }: { method: "GET" | "POST" }) {
  const colors =
    method === "GET"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold ${colors}`}>
      {method}
    </span>
  );
}

function EndpointSection({ endpoint }: { endpoint: Endpoint }) {
  const anchor = endpoint.path.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <section id={anchor} className="scroll-mt-20">
      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <MethodBadge method={endpoint.method} />
          <code className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {endpoint.path}
          </code>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{endpoint.title}</span>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Description */}
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {endpoint.description}
          </p>

          {/* Request params */}
          {endpoint.request?.params && endpoint.request.params.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Parameters
              </h4>
              <div className="mt-2 overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-3 py-2 font-medium text-zinc-500">Name</th>
                      <th className="px-3 py-2 font-medium text-zinc-500">Type</th>
                      <th className="px-3 py-2 font-medium text-zinc-500">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.request.params.map((p) => (
                      <tr key={p.name} className="border-t border-zinc-50 dark:border-zinc-800">
                        <td className="px-3 py-2 font-mono text-zinc-800 dark:text-zinc-200">
                          {p.name}
                        </td>
                        <td className="px-3 py-2 text-zinc-500">{p.type}</td>
                        <td className="px-3 py-2 text-zinc-500">{p.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Request body */}
          {endpoint.method === "POST" && endpoint.request && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Request Body
              </h4>
              <CodeBlock
                code={JSON.stringify(endpoint.request.body, null, 2)}
                lang="json"
              />
            </div>
          )}

          {/* Response */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Response
            </h4>
            <CodeBlock
              code={JSON.stringify(endpoint.response, null, 2)}
              lang="json"
            />
          </div>

          {/* cURL */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              cURL
            </h4>
            <CodeBlock code={endpoint.curl} lang="bash" />
          </div>
        </div>
      </div>
    </section>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  // Truncate very long blocks for readability
  const display =
    code.length > 3000
      ? code.slice(0, 3000) + "\n// ... (truncated for display)"
      : code;

  return (
    <div className="mt-2 overflow-auto rounded-lg border border-zinc-200 bg-zinc-950 dark:border-zinc-700">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-1.5">
        <span className="text-[11px] text-zinc-500">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-xs leading-5 text-zinc-300">{display}</code>
      </pre>
    </div>
  );
}

