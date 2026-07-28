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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        options: {
          include: {
            values: true,
          },
        },
        variants: true,
      },
    });

    if (!product) {
      return error("Product not found", 404);
    }

    return success(product);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
