import { success, error } from "@/src/lib/api-response";
import { getAttributesWithOptions } from "@/src/infrastructure/db/repositories/family-repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const family = searchParams.get("family");

    if (!family) {
      return error("Query parameter 'family' is required", 400);
    }

    const result = await getAttributesWithOptions(family);

    if (!result) {
      return error(`Product family '${family}' not found`, 404);
    }

    return success(result, 200);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
