import { z } from "zod";

// --- Configuration field schemas ---

const doorTypeSchema = z.enum(["single", "double"]);
const glassThicknessSchema = z.enum(["8", "10", "12"]);
const mountingTypeSchema = z.enum(["glass_to_glass", "glass_to_wall"]);
const openingTypeSchema = z.enum(["left", "right", "double"]);
const finishSchema = z.enum(["sss", "pss", "black", "gold"]);
const handleSizeSchema = z.enum(["600", "800", "1000"]).optional();
const lockTypeSchema = z.enum(["standard", "deadlock"]).optional();

// --- Door Configuration ---

export const doorConfigurationSchema = z.object({
  doorType: doorTypeSchema,
  glassThickness: glassThicknessSchema,
  doorWidth: z
    .number()
    .int("Width must be a whole number")
    .min(600, "Minimum door width is 600mm")
    .max(1400, "Maximum supported door width is 1400mm"),
  doorHeight: z
    .number()
    .int("Height must be a whole number")
    .min(1800, "Minimum door height is 1800mm")
    .max(2600, "Maximum supported door height is 2600mm"),
  mountingType: mountingTypeSchema,
  openingType: openingTypeSchema,
  finish: finishSchema,
  handleSize: handleSizeSchema,
  lockType: lockTypeSchema,
});

export type DoorConfigurationInput = z.infer<typeof doorConfigurationSchema>;

// --- Recommend Request ---

export const recommendRequestSchema = z.object({
  family: z.string().min(1, "Family code is required"),
  configuration: doorConfigurationSchema,
});

export type RecommendRequestInput = z.infer<typeof recommendRequestSchema>;

// --- Validate Request ---

export const validateRequestSchema = z.object({
  family: z.string().min(1, "Family code is required"),
  configuration: doorConfigurationSchema,
});

// --- BOM Request ---

export const bomRequestSchema = z.object({
  family: z.string().min(1, "Family code is required"),
  configuration: doorConfigurationSchema,
  ruleCode: z.string().optional(),
});

export type BomRequestInput = z.infer<typeof bomRequestSchema>;

// --- Hardware Item (for quote) ---

export const hardwareItemSchema = z.object({
  sku: z.string(),
  name: z.string(),
  productType: z.string(),
  quantity: z.number().positive(),
  required: z.boolean(),
  unit: z.string(),
  unitPrice: z.number(),
  totalPrice: z.number(),
});

// --- Quote Request ---

export const quoteRequestSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone is required"),
  projectName: z.string().min(1, "Project name is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  configuration: doorConfigurationSchema,
  hardware: z.array(hardwareItemSchema).min(1, "At least one hardware item is required"),
  estimatedTotal: z.number().min(0),
  notes: z.string().optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;
