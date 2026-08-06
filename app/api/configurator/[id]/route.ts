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
            values: {
              select: {
                value: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return error("Product not found", 404);
    }

    const data = {
      options: product.options.map((opt) => ({
        name: opt.name,
        values: opt.values.map((v) => v.value),
      })),
    };

    return success(data, 200);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
