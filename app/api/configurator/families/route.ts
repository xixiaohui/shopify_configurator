import { success, error } from "@/src/lib/api-response";
import { getProductFamilies } from "@/src/infrastructure/db/repositories/family-repository";

export async function GET() {
  try {
    const families = await getProductFamilies();
    return success(families, 200);
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
