"use client";

import { useState, useEffect, useCallback } from "react";

// ============================================================
// Types
// ============================================================

interface TableMeta {
  table: string;
  count: number;
  columns: string[];
}

interface TableData {
  rows: Record<string, unknown>[];
  total: number;
  limit: number;
  offset: number;
}

type FormData = Record<string, string>;

// Tables that cannot be modified (quotes come from the configurator flow)
const READ_ONLY_TABLES = ["quotes", "quote_items"];

const PAGE_SIZE = 20;

// ============================================================
// Page
// ============================================================

export default function AdminPage() {
  // Tables list
  const [tables, setTables] = useState<TableMeta[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);

  // Selected table
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [page, setPage] = useState(0);

  // Modal state
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [modalForm, setModalForm] = useState<FormData>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Error
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // Fetch tables list
  // ==========================================================
  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setTables(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tables");
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  // ==========================================================
  // Fetch table data
  // ==========================================================
  const fetchData = useCallback(
    async (table: string, pageNum: number) => {
      setLoadingData(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/${table}?limit=${PAGE_SIZE}&offset=${pageNum * PAGE_SIZE}`
        );
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setTableData(json.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  function selectTable(table: string) {
    setSelectedTable(table);
    setPage(0);
    setModalMode(null);
    setDeleteTarget(null);
    fetchData(table, 0);
  }

  useEffect(() => {
    if (selectedTable) {
      fetchData(selectedTable, page);
    }
  }, [page, selectedTable, fetchData]);

  // ==========================================================
  // CRUD operations
  // ==========================================================
  function openCreate() {
    if (!selectedTable) return;
    const meta = tables.find((t) => t.table === selectedTable);
    const form: FormData = {};
    if (meta) {
      for (const col of meta.columns) {
        if (col !== "id" && col !== "created_at") {
          form[col] = "";
        }
      }
    }
    setModalForm(form);
    setEditId(null);
    setModalMode("create");
  }

  function openEdit(row: Record<string, unknown>) {
    const form: FormData = {};
    for (const [key, value] of Object.entries(row)) {
      if (key !== "id" && key !== "created_at") {
        form[key] = value === null ? "" : String(value);
      }
    }
    setModalForm(form);
    setEditId(row.id as number);
    setModalMode("edit");
  }

  async function handleSave() {
    if (!selectedTable) return;
    setSaving(true);
    setError(null);
    try {
      let res: Response;
      if (modalMode === "create") {
        // Convert numeric strings to numbers
        const body: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(modalForm)) {
          body[k] = v === "" ? null : isNaN(Number(v)) ? v : Number(v);
        }
        res = await fetch(`/api/admin/${selectedTable}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        const body: Record<string, unknown> = { id: editId };
        for (const [k, v] of Object.entries(modalForm)) {
          body[k] = v === "" ? null : isNaN(Number(v)) ? v : Number(v);
        }
        res = await fetch(`/api/admin/${selectedTable}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setModalMode(null);
      fetchTables();
      fetchData(selectedTable, page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedTable || deleteTarget === null) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/${selectedTable}?id=${deleteTarget}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDeleteTarget(null);
      fetchTables();
      fetchData(selectedTable, page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function formatValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value).slice(0, 80);
    return String(value);
  }

  const isReadOnly = selectedTable ? READ_ONLY_TABLES.includes(selectedTable) : false;
  const currentMeta = tables.find((t) => t.table === selectedTable);
  const totalPages = tableData ? Math.ceil(tableData.total / PAGE_SIZE) : 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <Header />

      <div className="mx-auto flex max-w-7xl gap-0 px-4 pb-12 lg:px-6">
        {/* ======================================================== */}
        {/* LEFT SIDEBAR: Table list                                  */}
        {/* ======================================================== */}
        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="sticky top-16 pt-6">
            <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Database Tables
                </h2>
              </div>
              <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto p-2">
                {loadingTables ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-400">
                    Loading…
                  </div>
                ) : (
                  tables.map((t) => (
                    <button
                      key={t.table}
                      onClick={() => selectTable(t.table)}
                      className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        selectedTable === t.table
                          ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <span className="truncate font-mono">{t.table}</span>
                      <span className="ml-2 shrink-0 rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500">
                        {t.count}
                      </span>
                    </button>
                  ))
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Data table + actions                        */}
        {/* ======================================================== */}
        <main className="ml-0 min-w-0 flex-1 pt-6 lg:ml-6">
          {!selectedTable ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedTable}
                  </h2>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                    {tableData?.total ?? 0} rows
                  </span>
                  {isReadOnly && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                      Read-only
                    </span>
                  )}
                </div>
                {!isReadOnly && (
                  <button
                    onClick={openCreate}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    + New Row
                  </button>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-3 dark:border-red-900 dark:bg-red-950">
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                    {error}
                  </span>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-400 underline underline-offset-2 hover:text-red-600"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Data table */}
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                {loadingData ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
                  </div>
                ) : !tableData || tableData.rows.length === 0 ? (
                  <div className="py-16 text-center text-sm text-zinc-400">
                    No rows found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                        <tr>
                          {currentMeta?.columns.map((col) => (
                            <th
                              key={col}
                              className="whitespace-nowrap px-4 py-3 font-medium text-zinc-500"
                            >
                              {col === "id" ? "ID" : col.replace(/_/g, " ")}
                            </th>
                          ))}
                          {!isReadOnly && (
                            <th className="w-20 whitespace-nowrap px-4 py-3 text-right font-medium text-zinc-500">
                              Actions
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                        {tableData.rows.map((row, i) => (
                          <tr
                            key={i}
                            className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                          >
                            {currentMeta?.columns.map((col) => (
                              <td
                                key={col}
                                className="max-w-[200px] truncate whitespace-nowrap px-4 py-2.5 text-zinc-600 dark:text-zinc-400"
                                title={formatValue(row[col])}
                              >
                                {col === "id" ? (
                                  <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] dark:bg-zinc-800">
                                    {String(row[col])}
                                  </code>
                                ) : (
                                  formatValue(row[col])
                                )}
                              </td>
                            ))}
                            {!isReadOnly && (
                              <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                <button
                                  onClick={() => openEdit(row)}
                                  className="mr-2 text-[11px] text-zinc-400 underline underline-offset-2 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget(row.id as number)
                                  }
                                  className="text-[11px] text-red-400 underline underline-offset-2 transition-colors hover:text-red-600"
                                >
                                  Del
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="text-xs text-zinc-500">
                    Page {page + 1} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages - 1, p + 1))
                      }
                      disabled={page >= totalPages - 1}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================ */}
      {/* Create / Edit Modal                                          */}
      {/* ============================================================ */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pt-[10vh]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalMode(null)}
          />

          {/* Modal */}
          <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {modalMode === "create" ? "New Row" : "Edit Row"}
                {editId && (
                  <code className="ml-2 rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    ID {editId}
                  </code>
                )}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(modalForm).map(([key, value]) => (
                  <div
                    key={key}
                    className={
                      key === "description" || key === "notes" || key === "note"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                      {key.replace(/_/g, " ")}
                    </label>
                    {key === "description" || key === "notes" || key === "note" || key === "config" || key === "configuration" || key === "option_combination" ? (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          setModalForm((p) => ({ ...p, [key]: e.target.value }))
                        }
                        rows={3}
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setModalForm((p) => ({ ...p, [key]: e.target.value }))
                        }
                        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <button
                onClick={() => setModalMode(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-400 border-t-white dark:border-zinc-600 dark:border-t-zinc-900" />
                )}
                {modalMode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Delete Confirmation Dialog                                   */}
      {/* ============================================================ */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Delete Row
            </h3>
            <p className="mt-2 text-xs text-zinc-500">
              Are you sure you want to delete row{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                ID {deleteTarget}
              </code>{" "}
              from{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                {selectedTable}
              </code>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-300 border-t-white" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Header
// ============================================================

function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-2">
          <a
            href="/home"
            className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            Home
          </a>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Database Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/doc"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
          >
            API Docs
          </a>
          <a
            href="/glass"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Configurator
          </a>
        </div>
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="flex h-96 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white/50 dark:border-zinc-700 dark:bg-zinc-900/50">
      <div className="text-center">
        <div className="text-4xl">🗄️</div>
        <p className="mt-3 text-sm font-medium text-zinc-500">
          Select a table from the sidebar
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          View, create, edit, and delete records across all database tables
        </p>
      </div>
    </div>
  );
}
