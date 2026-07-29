import { prisma } from "@/src/lib/prisma";
import { success, error } from "@/src/lib/api-response";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return error("Invalid product ID", 400, corsHeaders);
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
      return error("No variants found for this product", 404, corsHeaders);
    }

    return success(variants, 200, corsHeaders);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500, corsHeaders);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
