import { prisma } from "@/src/lib/prisma";
import { success, error } from "@/src/lib/api-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return error("Invalid product ID", 400);
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      select: {
        id: true,
        sku: true,
        price: true,
        stock: true,
        optionCombination: true,
      },
    });

    if (!variants.length) {
      return error("No variants found for this product", 404);
    }

    return success(variants);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
