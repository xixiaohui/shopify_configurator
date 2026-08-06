import { success, error } from "@/src/lib/api-response";
import { bomRequestSchema } from "@/src/lib/validations-configurator";
import { getRecommendation } from "@/src/application/configurator/recommend-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bomRequestSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid request body", 400);
    }

    const { family, configuration } = parsed.data;

    // Reuse the recommend pipeline — BOM is a view of the same data
    const result = await getRecommendation(family, configuration);

    return success(
      {
        family,
        configuration,
        rule: result.matchedRule,
        items: result.hardware,
        subtotal: result.bom.subtotal,
      },
      200
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    console.error(e);
    return error(status === 404 ? message : "Internal server error", status);
  }
}
