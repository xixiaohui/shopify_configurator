import { success, error } from "@/src/lib/api-response";
import { validateRequestSchema } from "@/src/lib/validations-configurator";
import { validateConfiguration } from "@/src/application/configurator/recommend-service";
import { getProductFamilyByCode } from "@/src/infrastructure/db/repositories/family-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid request body", 400);
    }

    const { family, configuration } = parsed.data;

    // Verify family exists
    const familyRecord = await getProductFamilyByCode(family);
    if (!familyRecord) {
      return error(`Product family '${family}' not found`, 404);
    }

    // Validate
    const errors = validateConfiguration(configuration);

    return success(
      {
        valid: errors.length === 0,
        errors,
      },
      200
    );
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
