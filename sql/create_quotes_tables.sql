-- Quotes and quote_items tables for Glass Door Configurator
-- Run: psql -h 208.167.233.53 -U shopify -d shopify_db -f sql/create_quotes_tables.sql

BEGIN;

CREATE TABLE IF NOT EXISTS quotes (
    id BIGSERIAL PRIMARY KEY,
    quote_number VARCHAR(30) UNIQUE NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    configuration JSONB NOT NULL,
    estimated_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'submitted', 'reviewing', 'quoted', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quote_items (
    id BIGSERIAL PRIMARY KEY,
    quote_id BIGINT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    sku VARCHAR(80) NOT NULL,
    name VARCHAR(200) NOT NULL,
    quantity NUMERIC(10,2) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);

COMMIT;
