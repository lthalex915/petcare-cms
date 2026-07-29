import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
const PAGE_SIZE = 25;
function formatValue(value) {
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
    }
    catch {
        return "[unserializable]";
    }
}
export default function DbmsPage() {
    const { adminMode } = useAuth();
    const [tables, setTables] = useState([]);
    const [activeTable, setActiveTable] = useState("");
    const [tableData, setTableData] = useState(null);
    const [page, setPage] = useState(1);
    const [loadingTables, setLoadingTables] = useState(false);
    const [loadingRows, setLoadingRows] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createText, setCreateText] = useState("{}\n");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("{}\n");
    function extractErrorMessage(value) {
        const axiosError = value;
        if (axiosError?.response?.data?.message) {
            return axiosError.response.data.message;
        }
        if (axiosError?.response?.data?.error) {
            return axiosError.response.data.error;
        }
        return "Request failed";
    }
    function formatJson(value) {
        return `${JSON.stringify(value, null, 2)}\n`;
    }
    async function loadRows(tableKey, currentPage) {
        setLoadingRows(true);
        setError("");
        try {
            const res = await api.get(`/dbms/table/${tableKey}?page=${currentPage}&pageSize=${PAGE_SIZE}`);
            setTableData(res.data);
        }
        catch (nextError) {
            setTableData(null);
            setError(extractErrorMessage(nextError));
        }
        finally {
            setLoadingRows(false);
        }
    }
    useEffect(() => {
        setLoadingTables(true);
        setError("");
        api
            .get("/dbms/tables")
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
            const payload = JSON.parse(createText);
            await api.post(`/dbms/table/${activeTable}`, payload);
            setCreating(false);
            setCreateText("{}\n");
            await loadRows(activeTable, 1);
            setPage(1);
        }
        catch (nextError) {
            if (nextError instanceof SyntaxError) {
                setError("Invalid JSON for create payload");
            }
            else {
                setError(extractErrorMessage(nextError));
            }
        }
        finally {
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
            const payload = JSON.parse(editText);
            await api.put(`/dbms/table/${activeTable}/${editingId}`, payload);
            setEditingId(null);
            setEditText("{}\n");
            await loadRows(activeTable, page);
        }
        catch (nextError) {
            if (nextError instanceof SyntaxError) {
                setError("Invalid JSON for update payload");
            }
            else {
                setError(extractErrorMessage(nextError));
            }
        }
        finally {
            setSaving(false);
        }
    }
    async function deleteRow(id) {
        if (!activeTable || !adminMode) {
            return;
        }
        setSaving(true);
        setError("");
        try {
            await api.delete(`/dbms/table/${activeTable}/${id}`);
            await loadRows(activeTable, page);
        }
        catch (nextError) {
            setError(extractErrorMessage(nextError));
        }
        finally {
            setSaving(false);
        }
    }
    const columns = useMemo(() => {
        if (!tableData || tableData.rows.length === 0) {
            return [];
        }
        const keys = new Set();
        tableData.rows.forEach((row) => {
            Object.keys(row).forEach((key) => keys.add(key));
        });
        return Array.from(keys);
    }, [tableData]);
    return (_jsxs("div", { className: "page-card", children: [_jsx("h1", { style: { marginTop: 0, fontSize: 20 }, children: "DBMS Data Explorer" }), _jsx("div", { style: { color: "#444", marginBottom: 12 }, children: adminMode
                    ? "Admin mode enabled: you can add/update/delete rows in each table."
                    : "Read-only mode. Enable Admin Mode in Settings to write data." }), adminMode && activeTable && (_jsxs("div", { style: { marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }, children: [_jsx("button", { type: "button", onClick: () => {
                            setCreating((prev) => !prev);
                            setEditingId(null);
                            setError("");
                        }, style: { border: "1px solid #000", background: "#fff", padding: "6px 10px" }, children: creating ? "Close Create" : "Add Row" }), saving ? _jsx("div", { style: { color: "#666", fontSize: 12 }, children: "Saving..." }) : null] })), adminMode && creating && (_jsxs("section", { style: { border: "1px solid #ddd", background: "#fafafa", padding: 12, marginBottom: 12 }, children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 8 }, children: "Create Row JSON" }), _jsx("textarea", { value: createText, onChange: (e) => setCreateText(e.target.value), rows: 10, style: { width: "100%", fontFamily: "monospace", fontSize: 12 } }), _jsx("div", { style: { marginTop: 8 }, children: _jsx("button", { type: "button", onClick: createRow, disabled: saving, style: { border: "none", background: "#000", color: "#fff", padding: "6px 10px" }, children: "Create" }) })] })), _jsxs("div", { style: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }, children: [_jsxs("section", { style: { border: "1px solid #ddd", background: "#fafafa", padding: 12 }, children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 8 }, children: "Tables" }), loadingTables ? (_jsx("div", { children: "Loading tables..." })) : (_jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: tables.map((table) => (_jsxs("button", { type: "button", onClick: () => {
                                        if (!table.available) {
                                            return;
                                        }
                                        setActiveTable(table.key);
                                        setPage(1);
                                    }, disabled: !table.available, title: table.warning, style: {
                                        textAlign: "left",
                                        border: activeTable === table.key ? "1px solid #000" : "1px solid #ccc",
                                        background: activeTable === table.key ? "#efefef" : "#fff",
                                        padding: "8px 10px",
                                        opacity: table.available ? 1 : 0.6,
                                        cursor: table.available ? "pointer" : "not-allowed"
                                    }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: 12 }, children: table.label }), _jsxs("div", { style: { fontSize: 11, color: "#666" }, children: [table.count, " rows"] }), !table.available && table.warning ? (_jsx("div", { style: { marginTop: 4, fontSize: 11, color: "#b00020" }, children: table.warning })) : null] }, table.key))) }))] }), _jsx("section", { style: { border: "1px solid #ddd", background: "#fff", padding: 12, overflowX: "auto" }, children: loadingRows ? (_jsx("div", { children: "Loading rows..." })) : tableData ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }, children: [_jsx("div", { style: { fontWeight: 700 }, children: tableData.label }), _jsxs("div", { style: { fontSize: 12, color: "#555" }, children: ["Page ", tableData.page, " of ", tableData.totalPages, " | Total rows: ", tableData.total] })] }), tableData.rows.length === 0 ? (_jsx("div", { children: "No rows found." })) : (_jsxs("table", { className: "table", style: { minWidth: 700 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [columns.map((column) => (_jsx("th", { children: column }, column))), adminMode && _jsx("th", { children: "Admin Actions" })] }) }), _jsx("tbody", { children: tableData.rows.map((row, index) => (_jsxs("tr", { children: [columns.map((column) => (_jsx("td", { style: { verticalAlign: "top", fontFamily: "monospace", fontSize: 11 }, children: formatValue(row[column]) }, column))), adminMode && (_jsxs("td", { style: { whiteSpace: "nowrap", display: "flex", gap: 6 }, children: [_jsx("button", { type: "button", onClick: () => {
                                                                    const id = typeof row.id === "string" ? row.id : "";
                                                                    if (!id) {
                                                                        setError("This row cannot be edited because it has no string id field");
                                                                        return;
                                                                    }
                                                                    setEditingId(id);
                                                                    setEditText(formatJson(row));
                                                                    setCreating(false);
                                                                }, style: { border: "1px solid #000", background: "#fff", padding: "2px 8px" }, children: "Edit" }), _jsx("button", { type: "button", onClick: () => {
                                                                    const id = typeof row.id === "string" ? row.id : "";
                                                                    if (!id) {
                                                                        setError("This row cannot be deleted because it has no string id field");
                                                                        return;
                                                                    }
                                                                    void deleteRow(id);
                                                                }, style: { border: "1px solid #a31616", background: "#fff", color: "#a31616", padding: "2px 8px" }, children: "Delete" })] }))] }, index))) })] })), _jsxs("div", { style: { marginTop: 12, display: "flex", gap: 8 }, children: [_jsx("button", { type: "button", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: tableData.page <= 1, style: { border: "1px solid #000", background: "#fff", padding: "6px 10px" }, children: "Previous" }), _jsx("button", { type: "button", onClick: () => setPage((p) => Math.min(tableData.totalPages, p + 1)), disabled: tableData.page >= tableData.totalPages, style: { border: "1px solid #000", background: "#fff", padding: "6px 10px" }, children: "Next" })] })] })) : (_jsx("div", { children: "Select a table to inspect rows." })) })] }), adminMode && editingId && (_jsxs("section", { style: { border: "1px solid #ddd", background: "#fafafa", padding: 12, marginTop: 12 }, children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 8 }, children: "Edit Row JSON" }), _jsxs("div", { style: { marginBottom: 8, color: "#666", fontSize: 12 }, children: ["Row ID: ", editingId] }), _jsx("textarea", { value: editText, onChange: (e) => setEditText(e.target.value), rows: 12, style: { width: "100%", fontFamily: "monospace", fontSize: 12 } }), _jsxs("div", { style: { marginTop: 8, display: "flex", gap: 8 }, children: [_jsx("button", { type: "button", onClick: saveEditRow, disabled: saving, style: { border: "none", background: "#000", color: "#fff", padding: "6px 10px" }, children: "Save Changes" }), _jsx("button", { type: "button", onClick: () => {
                                    setEditingId(null);
                                    setEditText("{}\n");
                                }, style: { border: "1px solid #666", background: "#fff", padding: "6px 10px" }, children: "Cancel" })] })] })), error ? _jsx("div", { style: { marginTop: 12, color: "#b00020", fontWeight: 700 }, children: error }) : null] }));
}
