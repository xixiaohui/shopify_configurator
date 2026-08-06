// ============================================================
// Glass Swing Door Configurator — Domain Types
// ============================================================

// --- Product Family ---

export interface ProductFamily {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
}

// --- Attributes ---

export interface ConfiguratorAttribute {
  id: number;
  familyId: number;
  code: string;
  name: string;
  dataType: "select" | "number" | "boolean" | "text";
  required: boolean;
  sortOrder: number;
}

export interface AttributeOption {
  id: number;
  attributeId: number;
  code: string;
  label: string;
  numericValue: number | null;
  sortOrder: number;
}

export interface AttributeWithOptions extends ConfiguratorAttribute {
  options: AttributeOption[];
}

// --- Product SKU ---

export interface ProductSku {
  id: number;
  sku: string;
  productType: string;
  name: string;
  description: string | null;
  material: string | null;
  finish: string | null;
  minGlassThickness: number | null;
  maxGlassThickness: number | null;
  maxDoorWidth: number | null;
  maxDoorHeight: number | null;
  maxDoorWeight: number | null;
  unit: string;
  price: number;
  inventory: number;
  status: "active" | "inactive";
}

// --- Recommendation Rules ---

export interface RecommendationRule {
  id: number;
  familyId: number;
  code: string;
  name: string;
  priority: number;
  enabled: boolean;
  description: string | null;
}

export interface RuleCondition {
  id: number;
  ruleId: number;
  attributeCode: string;
  operator: "eq" | "neq" | "gte" | "lte";
  value: string;
}

export interface RuleItem {
  id: number;
  ruleId: number;
  sku: string;
  quantity: number;
  required: boolean;
  sortOrder: number;
}

export interface QuantityRule {
  id: number;
  ruleItemId: number;
  minDoorWeight: number | null;
  maxDoorWeight: number | null;
  minWidth: number | null;
  maxWidth: number | null;
  minHeight: number | null;
  maxHeight: number | null;
  quantity: number;
  priority: number;
}

// --- Full rule with children (loaded from DB) ---

export interface FullRule extends RecommendationRule {
  conditions: RuleCondition[];
  items: FullRuleItem[];
}

export interface FullRuleItem extends RuleItem {
  quantityRules: QuantityRule[];
  skuDetail?: ProductSku;
}

// --- SKU Compatibility ---

export type CompatibilityRelation = "compatible" | "incompatible" | "alternative";

export interface SkuCompatibility {
  id: number;
  sku: string;
  compatibleSku: string;
  relation: CompatibilityRelation;
  note: string | null;
}

// --- BOM ---

export interface Bom {
  id: number;
  familyId: number;
  code: string;
  name: string;
  version: string;
  status: string;
}

export interface BomItem {
  id: number;
  bomId: number;
  sku: string;
  quantity: number;
  required: boolean;
  note: string | null;
}

// --- User Configuration Input ---

/** camelCase as received from API clients */
export interface DoorConfiguration {
  doorType: "single" | "double";
  glassThickness: "8" | "10" | "12";
  doorWidth: number;
  doorHeight: number;
  mountingType: "glass_to_glass" | "glass_to_wall";
  openingType: "left" | "right" | "double";
  finish: "sss" | "pss" | "black" | "gold";
  handleSize?: "600" | "800" | "1000";
  lockType?: "standard" | "deadlock";
}

/** snake_case as stored in DB attribute codes */
export interface ConfigurationRecord {
  door_type: string;
  glass_thickness: string;
  door_width: number;
  door_height: number;
  mounting_type: string;
  opening_type: string;
  finish: string;
  handle_size?: string;
  lock_type?: string;
}

// --- Calculation ---

export interface CalculationResult {
  area: number;
  glassWeight: number;
}

// --- Recommendation API ---

export interface RecommendRequest {
  family: string;
  configuration: DoorConfiguration;
}

export interface HardwareItem {
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

export interface MatchedRuleInfo {
  code: string;
  name: string;
  priority: number;
}

export interface BomResult {
  items: HardwareItem[];
  subtotal: number;
}

export interface RecommendResponse {
  configuration: DoorConfiguration;
  calculation: CalculationResult;
  matchedRule: MatchedRuleInfo | null;
  hardware: HardwareItem[];
  bom: BomResult;
  warnings: string[];
}

// --- Validation API ---

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// --- BOM API ---

export interface BomRequest {
  family: string;
  configuration: DoorConfiguration;
  ruleCode?: string;
}

export interface BomResponse {
  family: string;
  configuration: DoorConfiguration;
  rule: MatchedRuleInfo | null;
  items: HardwareItem[];
  subtotal: number;
}

// --- Quote ---

export interface QuoteRequest {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  projectName: string;
  quantity: number;
  configuration: DoorConfiguration;
  hardware: HardwareItem[];
  estimatedTotal: number;
  notes?: string;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  projectName: string;
  quantity: number;
  configuration: DoorConfiguration;
  estimatedTotal: number;
  status: "draft" | "submitted" | "reviewing" | "quoted" | "closed";
  notes: string | null;
  createdAt: string;
  items: QuoteItem[];
}

export interface QuoteItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
