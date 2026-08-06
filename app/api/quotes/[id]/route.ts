import { success, error } from "@/src/lib/api-response";
import { pool } from "@/src/infrastructure/db/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const quoteId = parseInt(id, 10);

    if (isNaN(quoteId)) {
      return error("Invalid quote ID", 400);
    }

    // Get quote
    const quoteResult = await pool.query(
      `SELECT id, quote_number, company_name, contact_name, email, phone,
              project_name, quantity, configuration, estimated_total,
              status, notes, created_at
       FROM quotes
       WHERE id = $1`,
      [quoteId]
    );

    if (quoteResult.rows.length === 0) {
      return error("Quote not found", 404);
    }

    const q = quoteResult.rows[0];

    // Get quote items
    const itemsResult = await pool.query(
      `SELECT sku, name, quantity, unit_price, total_price
       FROM quote_items
       WHERE quote_id = $1
       ORDER BY id`,
      [quoteId]
    );

    // Parse configuration (stored as JSONB)
    let configuration = {};
    if (q.configuration) {
      configuration =
        typeof q.configuration === "string"
          ? JSON.parse(q.configuration as string)
          : q.configuration;
    }

    return success(
      {
        id: q.id,
        quoteNumber: q.quote_number,
        companyName: q.company_name,
        contactName: q.contact_name,
        email: q.email,
        phone: q.phone,
        projectName: q.project_name,
        quantity: q.quantity,
        configuration,
        estimatedTotal: Number(q.estimated_total),
        status: q.status,
        notes: q.notes ?? null,
        createdAt: q.created_at ? String(q.created_at) : null,
        items: itemsResult.rows.map((item: Record<string, unknown>) => ({
          sku: String(item.sku),
          name: String(item.name),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          totalPrice: Number(item.total_price),
        })),
      },
      200
    );
  } catch (e) {
    console.error(e);
    return error("Internal server error", 500);
  }
}
