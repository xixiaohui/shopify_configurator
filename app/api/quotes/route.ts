import { success, error } from "@/src/lib/api-response";
import { quoteRequestSchema } from "@/src/lib/validations-configurator";
import { pool } from "@/src/infrastructure/db/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = quoteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return error("Invalid request body", 400);
    }

    const data = parsed.data;

    // Generate quote number: QT-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    const quoteNumber = `QT-${dateStr}-${random}`;

    // Insert quote
    const result = await pool.query<{ id: number }>(
      `INSERT INTO quotes (quote_number, company_name, contact_name, email, phone,
                            project_name, quantity, configuration, estimated_total,
                            status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, 'submitted', $10, now())
       RETURNING id`,
      [
        quoteNumber,
        data.companyName,
        data.contactName,
        data.email,
        data.phone,
        data.projectName,
        data.quantity,
        JSON.stringify(data.configuration),
        data.estimatedTotal,
        data.notes ?? null,
      ]
    );

    const quoteId = result.rows[0].id;

    // Insert quote items
    for (const item of data.hardware) {
      await pool.query(
        `INSERT INTO quote_items (quote_id, sku, name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [quoteId, item.sku, item.name, item.quantity, item.unitPrice, item.totalPrice]
      );
    }

    return success(
      {
        id: quoteId,
        quoteNumber,
        status: "submitted",
      },
      201
    );
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
