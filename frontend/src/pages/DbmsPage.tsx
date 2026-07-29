import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import type { DbmsTableData, DbmsTableSummary } from "../types";

const PAGE_SIZE = 25;

function formatValue(value: unknown): string {
  if (value == null) {
    return "-";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
}

export default function DbmsPage() {
  const { adminMode } = useAuth();
  const [tables, setTables] = useState<DbmsTableSummary[]>([]);
  const [activeTable, setActiveTable] = useState("");
  const [tableData, setTableData] = useState<DbmsTableData | null>(null);
  const [page, setPage] = useState(1);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createText, setCreateText] = useState("{}\n");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("{}\n");

  function extractErrorMessage(value: unknown): string {
    const axiosError = value as AxiosError<{ message?: string; error?: string }>;
    if (axiosError?.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError?.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return "Request failed";
  }

  function formatJson(value: unknown): string {
    return `${JSON.stringify(value, null, 2)}\n`;
  }

  async function loadRows(tableKey: string, currentPage: number) {
    setLoadingRows(true);
    setError("");
    try {
      const res = await api.get<DbmsTableData>(`/dbms/table/${tableKey}?page=${currentPage}&pageSize=${PAGE_SIZE}`);
      setTableData(res.data);
    } catch (nextError) {
      setTableData(null);
      setError(extractErrorMessage(nextError));
    } finally {
      setLoadingRows(false);
    }
  }

  useEffect(() => {
    setLoadingTables(true);
    setError("");
    api
      .get<DbmsTableSummary[]>("/dbms/tables")
      .then((res) => {
        const nextTables = res.data;
        setTables(nextTables);
        const defaultTable = nextTables.find((table) => table.available) ?? nextTables[0];
        if (defaultTable) {
          setActiveTable(defaultTable.key);
        }
      })
      .catch(() => {
        setError("Failed to load DBMS tables");
      })
      .finally(() => {
        setLoadingTables(false);
      });
  }, []);

  useEffect(() => {
    if (!activeTable) {
      return;
    }
    void loadRows(activeTable, page);
  }, [activeTable, page]);

  async function createRow() {
    if (!activeTable || !adminMode) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = JSON.parse(createText) as Record<string, unknown>;
      await api.post(`/dbms/table/${activeTable}`, payload);
      setCreating(false);
      setCreateText("{}\n");
      await loadRows(activeTable, 1);
      setPage(1);
    } catch (nextError) {
      if (nextError instanceof SyntaxError) {
        setError("Invalid JSON for create payload");
      } else {
        setError(extractErrorMessage(nextError));
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveEditRow() {
    if (!activeTable || !editingId || !adminMode) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = JSON.parse(editText) as Record<string, unknown>;
      await api.put(`/dbms/table/${activeTable}/${editingId}`, payload);
      setEditingId(null);
      setEditText("{}\n");
      await loadRows(activeTable, page);
    } catch (nextError) {
      if (nextError instanceof SyntaxError) {
        setError("Invalid JSON for update payload");
      } else {
        setError(extractErrorMessage(nextError));
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(id: string) {
    if (!activeTable || !adminMode) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.delete(`/dbms/table/${activeTable}/${id}`);
      await loadRows(activeTable, page);
    } catch (nextError) {
      setError(extractErrorMessage(nextError));
    } finally {
      setSaving(false);
    }
  }

  const columns = useMemo(() => {
    if (!tableData || tableData.rows.length === 0) {
      return [];
    }

    const keys = new Set<string>();
    tableData.rows.forEach((row) => {
      Object.keys(row).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [tableData]);

  return (
    <div className="page-card">
      <h1 style={{ marginTop: 0, fontSize: 20 }}>DBMS Data Explorer</h1>
      <div style={{ color: "#444", marginBottom: 12 }}>
        {adminMode
          ? "Admin mode enabled: you can add/update/delete rows in each table."
          : "Read-only mode. Enable Admin Mode in Settings to write data."}
      </div>

      {adminMode && activeTable && (
        <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              setCreating((prev) => !prev);
              setEditingId(null);
              setError("");
            }}
            style={{ border: "1px solid #000", background: "#fff", padding: "6px 10px" }}
          >
            {creating ? "Close Create" : "Add Row"}
          </button>
          {saving ? <div style={{ color: "#666", fontSize: 12 }}>Saving...</div> : null}
        </div>
      )}

      {adminMode && creating && (
        <section style={{ border: "1px solid #ddd", background: "#fafafa", padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Create Row JSON</div>
          <textarea
            value={createText}
            onChange={(e) => setCreateText(e.target.value)}
            rows={10}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
          />
          <div style={{ marginTop: 8 }}>
            <button
              type="button"
              onClick={createRow}
              disabled={saving}
              style={{ border: "none", background: "#000", color: "#fff", padding: "6px 10px" }}
            >
              Create
            </button>
          </div>
        </section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", background: "#fafafa", padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Tables</div>
          {loadingTables ? (
            <div>Loading tables...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {tables.map((table) => (
                <button
                  key={table.key}
                  type="button"
                  onClick={() => {
                    if (!table.available) {
                      return;
                    }
                    setActiveTable(table.key);
                    setPage(1);
                  }}
                  disabled={!table.available}
                  title={table.warning}
                  style={{
                    textAlign: "left",
                    border: activeTable === table.key ? "1px solid #000" : "1px solid #ccc",
                    background: activeTable === table.key ? "#efefef" : "#fff",
                    padding: "8px 10px",
                    opacity: table.available ? 1 : 0.6,
                    cursor: table.available ? "pointer" : "not-allowed"
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{table.label}</div>
                  <div style={{ fontSize: 11, color: "#666" }}>{table.count} rows</div>
                  {!table.available && table.warning ? (
                    <div style={{ marginTop: 4, fontSize: 11, color: "#b00020" }}>{table.warning}</div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </section>

        <section style={{ border: "1px solid #ddd", background: "#fff", padding: 12, overflowX: "auto" }}>
          {loadingRows ? (
            <div>Loading rows...</div>
          ) : tableData ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 700 }}>{tableData.label}</div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  Page {tableData.page} of {tableData.totalPages} | Total rows: {tableData.total}
                </div>
              </div>

              {tableData.rows.length === 0 ? (
                <div>No rows found.</div>
              ) : (
                <table className="table" style={{ minWidth: 700 }}>
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                      {adminMode && <th>Admin Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, index) => (
                      <tr key={index}>
                        {columns.map((column) => (
                          <td key={column} style={{ verticalAlign: "top", fontFamily: "monospace", fontSize: 11 }}>
                            {formatValue(row[column])}
                          </td>
                        ))}
                        {adminMode && (
                          <td style={{ whiteSpace: "nowrap", display: "flex", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => {
                                const id = typeof row.id === "string" ? row.id : "";
                                if (!id) {
                                  setError("This row cannot be edited because it has no string id field");
                                  return;
                                }
                                setEditingId(id);
                                setEditText(formatJson(row));
                                setCreating(false);
                              }}
                              style={{ border: "1px solid #000", background: "#fff", padding: "2px 8px" }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const id = typeof row.id === "string" ? row.id : "";
                                if (!id) {
                                  setError("This row cannot be deleted because it has no string id field");
                                  return;
                                }
                                void deleteRow(id);
                              }}
                              style={{ border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }}
                            >
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={tableData.page <= 1}
                  style={{ border: "1px solid #000", background: "#fff", padding: "6px 10px" }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(tableData.totalPages, p + 1))}
                  disabled={tableData.page >= tableData.totalPages}
                  style={{ border: "1px solid #000", background: "#fff", padding: "6px 10px" }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div>Select a table to inspect rows.</div>
          )}
        </section>
      </div>

      {adminMode && editingId && (
        <section style={{ border: "1px solid #ddd", background: "#fafafa", padding: 12, marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Edit Row JSON</div>
          <div style={{ marginBottom: 8, color: "#666", fontSize: 12 }}>Row ID: {editingId}</div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={12}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
          />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={saveEditRow}
              disabled={saving}
              style={{ border: "none", background: "#000", color: "#fff", padding: "6px 10px" }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setEditText("{}\n");
              }}
              style={{ border: "1px solid #666", background: "#fff", padding: "6px 10px" }}
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      {error ? <div style={{ marginTop: 12, color: "#b00020", fontWeight: 700 }}>{error}</div> : null}
    </div>
  );
}
