import { useState, useEffect, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080/api";

const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((d) => (d && d.content !== undefined ? d.content : d)),
  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.message || r.status); }); return r.json(); }),
  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.message || r.status); }); return r.json().catch(() => ({})); }),
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    patients: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    doctors: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>),
    appointments: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>),
    specialties: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
    offices: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>),
    schedules: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>),
    availability: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>),
    reports: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
    plus: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
    edit: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
    eye: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>),
    close: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
    check: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>),
    cancel: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>),
    noshow: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
    menu: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
    apptypes: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
  };
  return icons[name] || null;
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0f1117; --bg2: #181c27; --bg3: #1e2333; --card: #1a1f2e;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
    --accent: #4f8ef7; --accent2: #7c5cfc; --accent3: #00d4aa;
    --text: #eef0f6; --text2: #9499b0; --text3: #5a5f78;
    --danger: #ff5c72; --warn: #ffb340; --success: #00d4aa;
    --sidebar-w: 240px; --font-head: 'Syne', sans-serif; --font-body: 'DM Sans', sans-serif;
    --radius: 12px; --radius-sm: 8px; --transition: 0.18s cubic-bezier(0.4,0,0.2,1);
  }
  body { font-family: var(--font-body); background: var(--bg); color: var(--text); min-height: 100vh; }
  .app-shell { display: flex; min-height: 100vh; }
  .sidebar { width: var(--sidebar-w); background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transition: transform var(--transition); }
  .sidebar.hidden { transform: translateX(-100%); }
  .sidebar-logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); }
  .logo-mark { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 34px; height: 34px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .logo-text { font-family: var(--font-head); font-size: 16px; font-weight: 700; background: linear-gradient(90deg, var(--accent), var(--accent2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-sub { font-size: 10px; color: var(--text3); letter-spacing: 1.5px; text-transform: uppercase; }
  .sidebar-nav { flex: 1; padding: 16px 10px; overflow-y: auto; }
  .nav-section { margin-bottom: 8px; }
  .nav-label { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text3); padding: 8px 10px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: var(--radius-sm); cursor: pointer; color: var(--text2); font-size: 13.5px; font-weight: 400; transition: all var(--transition); user-select: none; border: none; background: none; width: 100%; text-align: left; }
  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active { background: rgba(79,142,247,0.12); color: var(--accent); }
  .nav-item svg { opacity: 0.6; flex-shrink: 0; }
  .nav-item.active svg { opacity: 1; }
  .main { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-height: 100vh; }
  .topbar { height: 60px; background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 28px; gap: 16px; position: sticky; top: 0; z-index: 50; }
  .topbar-title { font-family: var(--font-head); font-size: 17px; font-weight: 600; flex: 1; }
  .topbar-badge { font-size: 11px; padding: 3px 10px; border-radius: 20px; background: rgba(79,142,247,0.15); color: var(--accent); font-weight: 500; }
  .btn-menu { display: none; background: none; border: none; color: var(--text2); cursor: pointer; padding: 4px; }
  .content { padding: 28px; flex: 1; }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--border); }
  .card-title { font-family: var(--font-head); font-size: 15px; font-weight: 600; }
  .card-body { padding: 22px; }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: var(--radius-sm); font-family: var(--font-body); font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all var(--transition); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #3a7de8; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(79,142,247,0.35); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--bg3); color: var(--text); }
  .btn-danger { background: rgba(255,92,114,0.15); color: var(--danger); border: 1px solid rgba(255,92,114,0.2); }
  .btn-danger:hover { background: rgba(255,92,114,0.25); }
  .btn-success { background: rgba(0,212,170,0.12); color: var(--success); border: 1px solid rgba(0,212,170,0.2); }
  .btn-success:hover { background: rgba(0,212,170,0.22); }
  .btn-warn { background: rgba(255,179,64,0.12); color: var(--warn); border: 1px solid rgba(255,179,64,0.2); }
  .btn-warn:hover { background: rgba(255,179,64,0.22); }
  .btn-sm { padding: 6px 11px; font-size: 12px; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th { text-align: left; padding: 11px 14px; color: var(--text3); font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; border-bottom: 1px solid var(--border); }
  td { padding: 13px 14px; border-bottom: 1px solid var(--border); color: var(--text2); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); color: var(--text); }
  .td-bold { color: var(--text); font-weight: 500; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }
  .badge-blue { background: rgba(79,142,247,0.15); color: var(--accent); }
  .badge-green { background: rgba(0,212,170,0.12); color: var(--success); }
  .badge-red { background: rgba(255,92,114,0.12); color: var(--danger); }
  .badge-warn { background: rgba(255,179,64,0.12); color: var(--warn); }
  .badge-gray { background: rgba(255,255,255,0.06); color: var(--text2); }
  .badge-purple { background: rgba(124,92,252,0.15); color: var(--accent2); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid.cols-1 { grid-template-columns: 1fr; }
  .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }
  label { font-size: 12px; font-weight: 500; color: var(--text3); letter-spacing: 0.4px; text-transform: uppercase; }
  input, select, textarea { background: var(--bg3); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 9px 12px; color: var(--text); font-family: var(--font-body); font-size: 14px; transition: border-color var(--transition); width: 100%; }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,142,247,0.12); }
  select option { background: var(--bg3); }
  textarea { resize: vertical; min-height: 80px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; animation: modalIn 0.2s ease; }
  .modal-lg { max-width: 750px; }
  @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: none; } }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border); }
  .modal-title { font-family: var(--font-head); font-size: 16px; font-weight: 600; }
  .modal-body { padding: 24px; }
  .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border); }
  .btn-icon { background: none; border: none; cursor: pointer; color: var(--text3); padding: 4px; border-radius: 6px; display: flex; align-items: center; transition: all var(--transition); }
  .btn-icon:hover { background: var(--bg3); color: var(--text); }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px 22px; }
  .stat-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; }
  .stat-value { font-family: var(--font-head); font-size: 30px; font-weight: 700; color: var(--text); line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text3); margin-top: 6px; }
  .stat-icon { float: right; width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; margin-top: -2px; }
  .alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .alert-success { background: rgba(0,212,170,0.1); border: 1px solid rgba(0,212,170,0.2); color: var(--success); }
  .alert-error { background: rgba(255,92,114,0.1); border: 1px solid rgba(255,92,114,0.2); color: var(--danger); }
  .actions-row { display: flex; gap: 6px; flex-wrap: wrap; }
  .empty-state { text-align: center; padding: 48px 20px; color: var(--text3); }
  .empty-state p { font-size: 14px; }
  .spinner { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid var(--border2); border-top-color: var(--accent); animation: spin 0.7s linear infinite; margin: 40px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .report-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; }
  .report-header { padding: 16px 22px; background: linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,92,252,0.06)); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .report-title { font-family: var(--font-head); font-size: 14px; font-weight: 600; }
  .report-body { padding: 20px 22px; }
  .avail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
  .avail-slot { background: rgba(0,212,170,0.08); border: 1px solid rgba(0,212,170,0.18); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; color: var(--success); text-align: center; }
  .avail-slot-time { font-weight: 600; font-size: 13px; }
  .avail-slot-label { color: var(--text3); font-size: 11px; margin-top: 2px; }
  .tab-list { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .tab { padding: 10px 16px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: none; color: var(--text3); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all var(--transition); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }
  .tab:hover:not(.active) { color: var(--text); }
  @media (max-width: 900px) {
    .main { margin-left: 0; } .sidebar { transform: translateX(-100%); } .sidebar.open { transform: translateX(0); }
    .btn-menu { display: flex; } .stats-grid { grid-template-columns: repeat(2, 1fr); }
    .form-grid { grid-template-columns: 1fr; } .form-grid.cols-3 { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function useData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await fetchFn()); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

function Modal({ title, onClose, onSave, saving, children, size = "" }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}><Icon name="close" size={16} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DataTable({ columns, rows, loading, emptyMsg = "Sin datos" }) {
  if (loading) return <div className="spinner" />;
  if (!rows || !Array.isArray(rows) || rows.length === 0)
    return <div className="empty-state"><p>{emptyMsg}</p></div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key} className={c.bold ? "td-bold" : ""}>
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`alert alert-${type}`} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, minWidth: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
      <Icon name={type === "success" ? "check" : "cancel"} size={15} />{msg}
    </div>
  );
}

const DOC_TYPES = ["CC", "TI", "CE", "PASAPORTE", "NIT"];

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function PatientsView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/patients"));
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/patients", form);
      else await api.put(`/patients/${selected.id}`, form);
      toast("Paciente guardado", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error al guardar", "error"); }
    finally { setSaving(false); }
  };

  const cols = [
    { key: "fullName", label: "Nombre completo", bold: true },
    { key: "documentType", label: "Tipo doc", render: (r) => <span className="badge badge-gray">{r.documentType}</span> },
    { key: "documentNumber", label: "Documento" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Teléfono" },
    { key: "active", label: "Estado", render: (r) => <span className={`badge ${r.active ? "badge-green" : "badge-red"}`}>{r.active ? "Activo" : "Inactivo"}</span> },
    { key: "actions", label: "", render: (r) => (
      <div className="actions-row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, documentType: r.documentType }); setModal("edit"); }}><Icon name="edit" size={13} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Pacientes</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo paciente</button>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay pacientes registrados" />
      </div>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo paciente" : "Editar paciente"} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group full"><label>Nombre completo</label><input value={form.fullName || ""} onChange={(e) => f("fullName", e.target.value)} /></div>
            <div className="form-group"><label>Tipo de documento</label>
              <select value={form.documentType || ""} onChange={(e) => f("documentType", e.target.value)}>
                <option value="">Selecciona…</option>
                {DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Número de documento</label><input value={form.documentNumber || ""} onChange={(e) => f("documentNumber", e.target.value)} disabled={modal === "edit"} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email || ""} onChange={(e) => f("email", e.target.value)} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.phoneNumber || ""} onChange={(e) => f("phoneNumber", e.target.value)} /></div>
            {modal === "create" && <div className="form-group"><label>Fecha de nacimiento</label><input type="date" value={form.birthDay || ""} onChange={(e) => f("birthDay", e.target.value)} /></div>}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DOCTORS ──────────────────────────────────────────────────────────────────
function DoctorsView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/doctors"));
  const { data: specs } = useData(() => api.get("/specialties"));
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/doctors", form);
      else await api.put(`/doctors/${selected.id}`, form);
      toast("Médico guardado", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const getSpecName = (id) => (specs || []).find((s) => s.id === id)?.name ?? id ?? "—";

  const cols = [
    { key: "fullName", label: "Nombre completo", bold: true },
    { key: "specialtyId", label: "Especialidad", render: (r) => <span className="badge badge-purple">{getSpecName(r.specialtyId)}</span> },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Teléfono" },
    { key: "numberLicense", label: "Licencia" },
    { key: "active", label: "Estado", render: (r) => <span className={`badge ${r.active ? "badge-green" : "badge-red"}`}>{r.active ? "Activo" : "Inactivo"}</span> },
    { key: "actions", label: "", render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ specialtyId: r.specialtyId, fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, numberLicense: r.numberLicense, documentNumber: r.documentNumber, active: r.active }); setModal("edit"); }}><Icon name="edit" size={13} /></button>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Médicos</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo médico</button>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} />
      </div>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo médico" : "Editar médico"} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group full"><label>Nombre completo</label><input value={form.fullName || ""} onChange={(e) => f("fullName", e.target.value)} /></div>
            <div className="form-group"><label>Especialidad</label>
              <select value={form.specialtyId || ""} onChange={(e) => f("specialtyId", e.target.value)}>
                <option value="">Selecciona…</option>
                {(specs || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Email</label><input type="email" value={form.email || ""} onChange={(e) => f("email", e.target.value)} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.phoneNumber || ""} onChange={(e) => f("phoneNumber", e.target.value)} /></div>
            <div className="form-group"><label>Número de licencia</label><input value={form.numberLicense || ""} onChange={(e) => f("numberLicense", e.target.value)} /></div>
            {modal === "create" && <>
              <div className="form-group"><label>Tipo de documento</label>
                <select value={form.documentType || ""} onChange={(e) => f("documentType", e.target.value)}>
                  <option value="">Selecciona…</option>
                  {DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Número de documento</label><input value={form.documentNumber || ""} onChange={(e) => f("documentNumber", e.target.value)} /></div>
            </>}
            {modal === "edit" && (
              <div className="form-group"><label>Activo</label>
                <select value={form.active === true ? "true" : "false"} onChange={(e) => f("active", e.target.value === "true")}>
                  <option value="true">Sí</option><option value="false">No</option>
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
function AppointmentsView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/appointments"));
  const { data: patients } = useData(() => api.get("/patients"));
  const { data: doctors } = useData(() => api.get("/doctors"));
  const { data: offices } = useData(() => api.get("/offices"));
  const { data: apptypes } = useData(() => api.get("/appointment-types"));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const statusMap = {
    CONFIRMED: ["Confirmada", "badge-green"],
    PENDING: ["Pendiente", "badge-warn"],
    CANCELLED: ["Cancelada", "badge-red"],
    COMPLETED: ["Completada", "badge-blue"],
    NO_SHOW: ["No asistió", "badge-gray"],
  };

  const doAction = async (id, action) => {
    try {
      await api.put(`/appointments/${id}/${action}`);
      const labels = { confirm: "confirmada", cancel: "cancelada", complete: "completada", "no-show": "marcada como no-show" };
      toast(`Cita ${labels[action]}`, "success"); reload();
    } catch (e) { toast(e.message || "Error", "error"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/appointments", form);
      toast("Cita creada", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error al crear cita", "error"); }
    finally { setSaving(false); }
  };

  const getName = (list, id) => (list || []).find((x) => x.id === id)?.fullName ?? (list || []).find((x) => x.id === id)?.name ?? id ?? "—";

  const cols = [
    { key: "patientId", label: "Paciente", bold: true, render: (r) => getName(patients, r.patientId) },
    { key: "doctorId", label: "Médico", render: (r) => getName(doctors, r.doctorId) },
    { key: "date", label: "Fecha", render: (r) => r.date ?? "—" },
    { key: "startsAt", label: "Hora", render: (r) => r.startAt ?? r.startsAt ?? "—" },
    { key: "status", label: "Estado", render: (r) => { const [l, c] = statusMap[r.status] ?? ["—", "badge-gray"]; return <span className={`badge ${c}`}>{l}</span>; } },
    { key: "actions", label: "Acciones", render: (r) => (
      <div className="actions-row">
        {r.status === "PENDING" && <button className="btn btn-success btn-sm" onClick={() => doAction(r.id, "confirm")}><Icon name="check" size={12} /> Confirmar</button>}
        {(r.status === "PENDING" || r.status === "CONFIRMED") && <button className="btn btn-danger btn-sm" onClick={() => doAction(r.id, "cancel")}><Icon name="cancel" size={12} /> Cancelar</button>}
        {r.status === "CONFIRMED" && <button className="btn btn-ghost btn-sm" onClick={() => doAction(r.id, "complete")}>Completar</button>}
        {(r.status === "PENDING" || r.status === "CONFIRMED") && <button className="btn btn-warn btn-sm" onClick={() => doAction(r.id, "no-show")}><Icon name="noshow" size={12} /> No-show</button>}
      </div>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Citas</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nueva cita</button>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} />
      </div>
      {modal === "create" && (
        <Modal title="Nueva cita" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Paciente</label>
              <select value={form.patientId || ""} onChange={(e) => f("patientId", e.target.value)}>
                <option value="">Selecciona…</option>
                {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Médico</label>
              <select value={form.doctorId || ""} onChange={(e) => f("doctorId", e.target.value)}>
                <option value="">Selecciona…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Consultorio</label>
              <select value={form.officeId || ""} onChange={(e) => f("officeId", e.target.value)}>
                <option value="">Selecciona…</option>
                {(offices || []).map((o) => <option key={o.id} value={o.id}>{o.name} — {o.location}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Tipo de cita</label>
              <select value={form.appointmentTypeId || ""} onChange={(e) => f("appointmentTypeId", e.target.value)}>
                <option value="">Selecciona…</option>
                {(apptypes || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
              </select>
            </div>
            <div className="form-group"><label>Fecha</label><input type="date" value={form.date || ""} onChange={(e) => f("date", e.target.value)} /></div>
            <div className="form-group"><label>Hora de inicio</label><input type="time" value={form.startsAt || ""} onChange={(e) => f("startsAt", e.target.value)} /></div>
            <div className="form-group full"><label>Observaciones</label><textarea value={form.observations || ""} onChange={(e) => f("observations", e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SPECIALTIES ──────────────────────────────────────────────────────────────
function SpecialtiesView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/specialties"));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/specialties", form);
      toast("Especialidad creada", "success"); reload(); setModal(false);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Especialidades</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal(true); }}><Icon name="plus" size={14} /> Nueva especialidad</button>
        </div>
        <DataTable columns={[
          { key: "name", label: "Nombre", bold: true },
          { key: "description", label: "Descripción" },
        ]} rows={data} loading={loading} />
      </div>
      {modal && (
        <Modal title="Nueva especialidad" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="form-grid cols-1">
            <div className="form-group"><label>Nombre</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} /></div>
            <div className="form-group"><label>Descripción</label><textarea value={form.description || ""} onChange={(e) => f("description", e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── OFFICES ──────────────────────────────────────────────────────────────────
function OfficesView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/offices"));
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/offices", form);
      else await api.put(`/offices/${selected.id}`, form);
      toast("Consultorio guardado", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const cols = [
    { key: "name", label: "Nombre", bold: true },
    { key: "location", label: "Ubicación" },
    { key: "active", label: "Estado", render: (r) => <span className={`badge ${r.active ? "badge-green" : "badge-red"}`}>{r.active ? "Activo" : "Inactivo"}</span> },
    { key: "actions", label: "", render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ name: r.name, location: r.location, active: r.active }); setModal("edit"); }}><Icon name="edit" size={13} /></button>
    )},
  ];

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Consultorios</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo consultorio</button>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} />
      </div>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo consultorio" : "Editar consultorio"} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Nombre</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} /></div>
            <div className="form-group"><label>Ubicación</label><input value={form.location || ""} onChange={(e) => f("location", e.target.value)} /></div>
            {modal === "edit" && (
              <div className="form-group"><label>Activo</label>
                <select value={form.active === true ? "true" : "false"} onChange={(e) => f("active", e.target.value === "true")}>
                  <option value="true">Sí</option><option value="false">No</option>
                </select>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APPOINTMENT TYPES ────────────────────────────────────────────────────────
function AppTypesView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/appointment-types"));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/appointment-types", form);
      toast("Tipo de cita creado", "success"); reload(); setModal(false);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <span className="card-title">Tipos de cita</span>
          <button className="btn btn-primary" onClick={() => { setForm({}); setModal(true); }}><Icon name="plus" size={14} /> Nuevo tipo</button>
        </div>
        <DataTable columns={[
          { key: "name", label: "Nombre", bold: true },
          { key: "durationMinutes", label: "Duración (min)" },
          { key: "description", label: "Descripción" },
        ]} rows={data} loading={loading} />
      </div>
      {modal && (
        <Modal title="Nuevo tipo de cita" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Nombre</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} /></div>
            <div className="form-group"><label>Duración (minutos)</label><input type="number" value={form.durationMinutes || ""} onChange={(e) => f("durationMinutes", parseInt(e.target.value))} /></div>
            <div className="form-group full"><label>Descripción</label><textarea value={form.description || ""} onChange={(e) => f("description", e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── SCHEDULES ────────────────────────────────────────────────────────────────
function SchedulesView({ toast }) {
  const { data: doctors } = useData(() => api.get("/doctors"));
  const [doctorId, setDoctorId] = useState("");
  const [schedules, setSchedules] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const loadSchedules = async (id) => {
    if (!id) return;
    setLoading(true);
    try { setSchedules(await api.get(`/doctors/${id}/schedules`)); }
    catch { setSchedules([]); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!doctorId) return toast("Selecciona un médico", "error");
    setSaving(true);
    try {
      await api.post(`/doctors/${doctorId}/schedules`, { ...form, doctorId });
      toast("Horario guardado", "success"); loadSchedules(doctorId); setModal(false);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
  const DAY_ES = { MONDAY:"Lunes", TUESDAY:"Martes", WEDNESDAY:"Miércoles", THURSDAY:"Jueves", FRIDAY:"Viernes", SATURDAY:"Sábado", SUNDAY:"Domingo" };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">Horarios por médico</span></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Seleccionar médico</label>
              <select value={doctorId} onChange={(e) => { setDoctorId(e.target.value); loadSchedules(e.target.value); }}>
                <option value="">Selecciona un médico…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
      {doctorId && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Horarios</span>
            <button className="btn btn-primary" onClick={() => { setForm({}); setModal(true); }}><Icon name="plus" size={14} /> Agregar horario</button>
          </div>
          <DataTable loading={loading} rows={schedules} columns={[
            { key: "dayOfWeek", label: "Día", bold: true, render: (r) => <span className="badge badge-blue">{DAY_ES[r.dayOfWeek] ?? r.dayOfWeek}</span> },
            { key: "startsAt", label: "Hora inicio" },
            { key: "endsAt", label: "Hora fin" },
          ]} />
        </div>
      )}
      {modal && (
        <Modal title="Nuevo horario" onClose={() => setModal(false)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Día de la semana</label>
              <select value={form.dayOfWeek || ""} onChange={(e) => f("dayOfWeek", e.target.value)}>
                <option value="">Selecciona…</option>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_ES[d]}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Hora inicio</label><input type="time" value={form.startAt || ""} onChange={(e) => f("startAt", e.target.value)} /></div>
            <div className="form-group"><label>Hora fin</label><input type="time" value={form.endAt || ""} onChange={(e) => f("endAt", e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── AVAILABILITY ─────────────────────────────────────────────────────────────
function AvailabilityView() {
  const { data: doctors } = useData(() => api.get("/doctors"));
  const [doctorId, setDoctorId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!doctorId) return;
    setLoading(true);
    try { setSlots(await api.get(`/availability/doctors/${doctorId}?date=${fecha}`)); }
    catch { setSlots([]); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">Consultar disponibilidad</span></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group"><label>Médico</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Selecciona…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Fecha</label><input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 16 }}><button className="btn btn-primary" onClick={search}><Icon name="availability" size={14} /> Consultar</button></div>
        </div>
      </div>
      {loading && <div className="spinner" />}
      {slots && !loading && (
        <div className="card">
          <div className="card-header"><span className="card-title">Slots disponibles — {fecha}</span></div>
          <div className="card-body">
            {!Array.isArray(slots) || slots.length === 0
              ? <div className="empty-state"><p>Sin disponibilidad para esta fecha</p></div>
              : <div className="avail-grid">
                  {slots.map((s, i) => (
                    <div className="avail-slot" key={i}>
                      <div className="avail-slot-time">{s.startsAt ?? s}</div>
                      <div className="avail-slot-label">{s.endsAt ? `→ ${s.endsAt}` : "Disponible"}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function ReportsView() {
  const [activeTab, setActiveTab] = useState("occupancy");
  const { data: occupancy, loading: l1 } = useData(() => api.get("/reports/office-occupancy"), []);
  const { data: productivity, loading: l2 } = useData(() => api.get("/reports/doctor-productivity"), []);
  const { data: noshow, loading: l3 } = useData(() => api.get("/reports/no-show-patients"), []);

  return (
    <div>
      <div className="tab-list">
        {[["occupancy","Ocupación consultorios"],["productivity","Productividad médicos"],["noshow","Pacientes no-show"]].map(([id, label]) => (
          <button key={id} className={`tab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>
      {activeTab === "occupancy" && (
        <div className="report-card">
          <div className="report-header"><Icon name="offices" size={16} /><span className="report-title">Ocupación por consultorio</span></div>
          <div className="report-body">
            <DataTable loading={l1} rows={Array.isArray(occupancy) ? occupancy : []} columns={[
              { key: "name", label: "Consultorio", bold: true },
              { key: "totalAppointments", label: "Total citas" },
            ]} />
          </div>
        </div>
      )}
      {activeTab === "productivity" && (
        <div className="report-card">
          <div className="report-header"><Icon name="doctors" size={16} /><span className="report-title">Productividad médicos</span></div>
          <div className="report-body">
            <DataTable loading={l2} rows={Array.isArray(productivity) ? productivity : []} columns={[
              { key: "fullName", label: "Médico", bold: true },
              { key: "completedAppointments", label: "Citas completadas", render: (r) => <span className="badge badge-green">{r.completedAppointments ?? 0}</span> },
            ]} />
          </div>
        </div>
      )}
      {activeTab === "noshow" && (
        <div className="report-card">
          <div className="report-header"><Icon name="noshow" size={16} /><span className="report-title">Pacientes con mayor no-show</span></div>
          <div className="report-body">
            <DataTable loading={l3} rows={Array.isArray(noshow) ? noshow : []} columns={[
              { key: "fullName", label: "Paciente", bold: true },
              { key: "noShowCount", label: "No-shows", render: (r) => <span className="badge badge-red">{r.noShowCount ?? 0}</span> },
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardView() {
  const { data: patients } = useData(() => api.get("/patients"));
  const { data: doctors } = useData(() => api.get("/doctors"));
  const { data: appointments } = useData(() => api.get("/appointments"));
  const { data: offices } = useData(() => api.get("/offices"));

  const confirmedCount = (appointments || []).filter((a) => a.status === "CONFIRMED").length;
  const pendingCount = (appointments || []).filter((a) => a.status === "PENDING").length;

  const stats = [
    { label: "Pacientes", value: (patients || []).length, sub: "registrados", icon: "patients", color: "rgba(79,142,247,0.15)", iconColor: "var(--accent)" },
    { label: "Médicos", value: (doctors || []).length, sub: "activos", icon: "doctors", color: "rgba(124,92,252,0.15)", iconColor: "var(--accent2)" },
    { label: "Citas confirmadas", value: confirmedCount, sub: `${pendingCount} pendientes`, icon: "appointments", color: "rgba(0,212,170,0.12)", iconColor: "var(--success)" },
    { label: "Consultorios", value: (offices || []).length, sub: "registrados", icon: "offices", color: "rgba(255,179,64,0.12)", iconColor: "var(--warn)" },
  ];

  const statusMap = { CONFIRMED: ["Confirmada","badge-green"], PENDING: ["Pendiente","badge-warn"], CANCELLED: ["Cancelada","badge-red"], COMPLETED: ["Completada","badge-blue"], NO_SHOW: ["No asistió","badge-gray"] };

  return (
    <div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-icon" style={{ background: s.color, color: s.iconColor }}><Icon name={s.icon} size={16} /></div>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Últimas citas</span></div>
        <DataTable rows={(appointments || []).slice(-6).reverse()} loading={false} columns={[
          { key: "patientId", label: "Paciente ID", bold: true },
          { key: "date", label: "Fecha" },
          { key: "startAt", label: "Hora" },
          { key: "status", label: "Estado", render: (r) => { const [l,c] = statusMap[r.status] ?? ["—","badge-gray"]; return <span className={`badge ${c}`}>{l}</span>; } },
        ]} emptyMsg="Sin citas aún" />
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const VIEWS = {
  dashboard:    { label: "Dashboard",       icon: "reports",       component: DashboardView,     section: "general" },
  patients:     { label: "Pacientes",       icon: "patients",      component: PatientsView,      section: "gestion" },
  doctors:      { label: "Médicos",         icon: "doctors",       component: DoctorsView,       section: "gestion" },
  appointments: { label: "Citas",           icon: "appointments",  component: AppointmentsView,  section: "gestion" },
  specialties:  { label: "Especialidades",  icon: "specialties",   component: SpecialtiesView,   section: "catalogo" },
  offices:      { label: "Consultorios",    icon: "offices",       component: OfficesView,       section: "catalogo" },
  apptypes:     { label: "Tipos de cita",   icon: "apptypes",      component: AppTypesView,      section: "catalogo" },
  schedules:    { label: "Horarios",        icon: "schedules",     component: SchedulesView,     section: "operacion" },
  availability: { label: "Disponibilidad",  icon: "availability",  component: AvailabilityView,  section: "operacion" },
  reports:      { label: "Reportes",        icon: "reports",       component: ReportsView,       section: "reportes" },
};

const SECTIONS = { general: "General", gestion: "Gestión", catalogo: "Catálogo", operacion: "Operación", reportes: "Análisis" };

export default function MedicalApp() {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });
  const ActiveView = VIEWS[view]?.component;

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">🏥</div>
              <div><div className="logo-text">MediCare</div><div className="logo-sub">Sistema clínico</div></div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {Object.entries(SECTIONS).map(([sec, label]) => (
              <div className="nav-section" key={sec}>
                <div className="nav-label">{label}</div>
                {Object.entries(VIEWS).filter(([, v]) => v.section === sec).map(([key, v]) => (
                  <button key={key} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => { setView(key); setSidebarOpen(false); }}>
                    <Icon name={v.icon} size={16} />{v.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>
        <main className="main">
          <header className="topbar">
            <button className="btn-menu" onClick={() => setSidebarOpen((o) => !o)}><Icon name="menu" size={20} /></button>
            <span className="topbar-title">{VIEWS[view]?.label}</span>
            <span className="topbar-badge">v1.0</span>
          </header>
          <div className="content">
            {ActiveView && <ActiveView toast={showToast} />}
          </div>
        </main>
        {sidebarOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}