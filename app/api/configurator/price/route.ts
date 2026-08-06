import { prisma } from "@/src/lib/prisma";
import { success, error } from "@/src/lib/api-response";
import { priceRequestSchema } from "@/src/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = priceRequestSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid request body", 400);
    }

    const { productId, options } = parsed.data;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: {
          include: {
            values: true,
          },
        },
      },
    });

    if (!product) {
      return error("Product not found", 404);
    }

    // Calculate base price
    let totalPrice = Number(product.basePrice);

    // Add extra prices from selected options
    for (const [optionName, optionValue] of Object.entries(options)) {
      const option = product.options.find((o) => o.name === optionName);
      if (!option) {
        return error(`Option "${optionName}" not found for this product`, 400);
      }

      const value = option.values.find((v) => v.value === optionValue);
      if (!value) {
        return error(
          `Value "${optionValue}" not found for option "${optionName}"`,
          400
        );
      }

      totalPrice += Number(value.extraPrice);
    }

    // Find matching variant
    const variant = await prisma.productVariant.findFirst({
      where: { productId },
    });

    if (!variant) {
      return error("No variants found for this product", 404);
    }

    // Try to find an exact variant match
    const allVariants = await prisma.productVariant.findMany({
      where: { productId },
    });

    let matchedVariant = allVariants.find((v) => {
      const combination = v.optionCombination as Record<string, unknown>;
      const comb = combination as Record<string, string>;
      if (!comb || typeof comb !== "object") return false;
      const entries = Object.entries(options);
      return entries.every(([key, val]) => comb[key] === val);
    });

    // Fall back to first variant if no exact match
    if (!matchedVariant) {
      matchedVariant = variant;
    }

    return success({
      price: totalPrice,
      sku: matchedVariant.sku,
      stock: matchedVariant.stock,
      recommendations: matchedVariant.recommendations,
    }, 200);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
