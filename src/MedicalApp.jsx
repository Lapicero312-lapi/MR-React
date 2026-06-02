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
  patch: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.message || r.status); }); return r.json().catch(() => ({})); }),
  delete: (path) =>
    fetch(`${BASE_URL}${path}`, { method: "DELETE" })
      .then((r) => { if (!r.ok) return r.json().then((e) => { throw new Error(e.message || r.status); }); return r.json().catch(() => ({})); }),
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    patients:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
    doctors:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>),
    appointments: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>),
    specialties:  (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
    offices:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>),
    schedules:    (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>),
    availability: (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>),
    reports:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>),
    dashboard:    (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
    plus:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>),
    edit:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>),
    close:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
    check:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>),
    cancel:       (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>),
    noshow:       (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>),
    menu:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>),
    apptypes:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    clock:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>),
    search:       (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>),
    pulse:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>),
    chevron:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>),
    trash:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2,0,0,1-2,2H8a2,2,0,0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1V6"/></svg>),
    stethoscope:  (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>),
    warning:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>),
  };
  return icons[name] || null;
};

// ─── DESIGN SYSTEM v2 ─────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Brand palette — white clinical + dark pastel burgundy */
    --wine:       #8B2635;
    --wine-deep:  #6B1D28;
    --wine-light: #A83347;
    --wine-pale:  #F5E8EA;
    --wine-soft:  #EDD5D8;
    --wine-mid:   #C4707D;

    --cream:      #FDFAF8;
    --white:      #FFFFFF;
    --off:        #F7F3F1;
    --stone:      #EDE8E5;
    --stone-dark: #D4CCC8;
    
    --ink:        #1C1410;
    --ink-med:    #4A3F3A;
    --ink-light:  #7A6E6A;
    --ink-ghost:  #A89E9B;
    --ink-whisper:#C8C0BC;

    --success:    #2D7A4F;
    --success-bg: #EAF4EE;
    --warn:       #8B6914;
    --warn-bg:    #FDF5E0;
    --info:       #1E5FA0;
    --info-bg:    #E8F0FA;
    --danger:     var(--wine);
    --danger-bg:  var(--wine-pale);

    --sidebar-w:  260px;
    --topbar-h:   64px;
    --radius:     10px;
    --radius-sm:  7px;
    --radius-lg:  14px;
    --shadow-sm:  0 1px 3px rgba(28,20,16,0.07), 0 1px 2px rgba(28,20,16,0.05);
    --shadow-md:  0 4px 12px rgba(28,20,16,0.08), 0 2px 4px rgba(28,20,16,0.05);
    --shadow-lg:  0 12px 32px rgba(28,20,16,0.12), 0 4px 8px rgba(28,20,16,0.06);
    --transition: 0.16s ease;
    --font-head:  'Libre Baskerville', Georgia, serif;
    --font-body:  'Plus Jakarta Sans', system-ui, sans-serif;
  }

  html { font-size: 15px; }
  body { 
    font-family: var(--font-body); 
    background: var(--off); 
    color: var(--ink); 
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* ── APP SHELL ── */
  .app-shell { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--wine-deep);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    transition: transform var(--transition);
    overflow: hidden;
  }
  .sidebar::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 280px;
    background: linear-gradient(160deg, rgba(255,255,255,0.04) 0%, transparent 100%);
    pointer-events: none;
  }
  .sidebar.hidden { transform: translateX(-100%); }

  .sidebar-logo {
    padding: 28px 22px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    position: relative;
  }
  .logo-mark {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-icon {
    width: 40px; height: 40px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .logo-name {
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.3px;
    line-height: 1.1;
  }
  .logo-sub {
    font-size: 10px;
    font-weight: 400;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1.8px;
    text-transform: uppercase;
    margin-top: 3px;
  }
  .logo-badge {
    position: absolute;
    top: 28px; right: 22px;
    font-size: 9px;
    font-weight: 600;
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.7);
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.5px;
  }

  .sidebar-nav { flex: 1; padding: 18px 12px; overflow-y: auto; }
  .sidebar-nav::-webkit-scrollbar { width: 0; }

  .nav-section { margin-bottom: 4px; }
  .nav-section-label {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.28);
    padding: 14px 10px 6px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: rgba(255,255,255,0.55);
    font-size: 13px;
    font-weight: 400;
    transition: all var(--transition);
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    position: relative;
  }
  .nav-item svg { opacity: 0.7; flex-shrink: 0; transition: opacity var(--transition); }
  .nav-item:hover { 
    background: rgba(255,255,255,0.07); 
    color: rgba(255,255,255,0.85);
  }
  .nav-item:hover svg { opacity: 0.9; }
  .nav-item.active { 
    background: rgba(255,255,255,0.13); 
    color: #fff;
    font-weight: 500;
  }
  .nav-item.active svg { opacity: 1; }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 18px;
    background: rgba(255,255,255,0.7);
    border-radius: 0 2px 2px 0;
  }

  .sidebar-footer {
    padding: 16px 22px;
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sidebar-footer-avatar {
    width: 30px; height: 30px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: rgba(255,255,255,0.8); font-weight: 600;
  }
  .sidebar-footer-info { flex: 1; min-width: 0; }
  .sidebar-footer-name { font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sidebar-footer-role { font-size: 10px; color: rgba(255,255,255,0.35); }

  /* ── MAIN ── */
  .main { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-height: 100vh; }

  /* ── TOPBAR ── */
  .topbar {
    height: var(--topbar-h);
    background: var(--white);
    border-bottom: 1px solid var(--stone);
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 50;
    box-shadow: var(--shadow-sm);
  }
  .topbar-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  .topbar-section {
    font-size: 12px;
    color: var(--ink-ghost);
    font-weight: 400;
  }
  .topbar-sep { color: var(--ink-whisper); font-size: 12px; }
  .topbar-title {
    font-family: var(--font-head);
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.2px;
  }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .topbar-pulse {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: var(--success); font-weight: 500;
  }
  .topbar-pulse-dot {
    width: 7px; height: 7px;
    background: var(--success);
    border-radius: 50%;
    animation: blink 2s ease infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .topbar-date { font-size: 12px; color: var(--ink-ghost); }
  .btn-menu { display: none; background: none; border: none; color: var(--ink-light); cursor: pointer; padding: 6px; border-radius: var(--radius-sm); }

  /* ── CONTENT ── */
  .content { padding: 28px; flex: 1; }

  /* ── PAGE HEADER ── */
  .page-header { margin-bottom: 24px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; }
  .page-header-left {}
  .page-eyebrow { font-size: 10.5px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--wine); margin-bottom: 4px; }
  .page-title { font-family: var(--font-head); font-size: 22px; color: var(--ink); letter-spacing: -0.5px; line-height: 1.2; }
  .page-subtitle { font-size: 13px; color: var(--ink-light); margin-top: 4px; font-weight: 400; }

  /* ── CARDS ── */
  .card {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid var(--stone);
    background: var(--white);
  }
  .card-title {
    font-family: var(--font-head);
    font-size: 14px;
    font-weight: 700;
    color: var(--ink);
    letter-spacing: -0.2px;
  }
  .card-subtitle { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .card-body { padding: 22px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all var(--transition);
    letter-spacing: 0.1px;
    line-height: 1;
  }
  .btn-primary { 
    background: var(--wine); 
    color: #fff; 
    box-shadow: 0 2px 6px rgba(139,38,53,0.25);
  }
  .btn-primary:hover { 
    background: var(--wine-light); 
    box-shadow: 0 4px 12px rgba(139,38,53,0.35);
    transform: translateY(-1px);
  }
  .btn-ghost { 
    background: transparent; 
    color: var(--ink-med); 
    border: 1px solid var(--stone-dark); 
  }
  .btn-ghost:hover { background: var(--off); color: var(--ink); }
  .btn-danger { 
    background: var(--wine-pale); 
    color: var(--wine); 
    border: 1px solid var(--wine-soft); 
  }
  .btn-danger:hover { background: var(--wine-soft); }
  .btn-success { 
    background: var(--success-bg); 
    color: var(--success); 
    border: 1px solid #C0DFD0; 
  }
  .btn-success:hover { background: #D6EEE3; }
  .btn-warn { 
    background: var(--warn-bg); 
    color: var(--warn); 
    border: 1px solid #F0D990; 
  }
  .btn-warn:hover { background: #FAF0C0; }
  .btn-outline {
    background: transparent;
    color: var(--wine);
    border: 1px solid var(--wine-mid);
  }
  .btn-outline:hover { background: var(--wine-pale); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-xs { padding: 4px 9px; font-size: 11px; border-radius: 5px; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* ── FORM ELEMENTS ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid.cols-1 { grid-template-columns: 1fr; }
  .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-group.full { grid-column: 1 / -1; }

  label { 
    font-size: 11px; 
    font-weight: 600; 
    color: var(--ink-light); 
    letter-spacing: 0.8px; 
    text-transform: uppercase; 
  }
  input, select, textarea {
    background: var(--cream);
    border: 1px solid var(--stone-dark);
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    color: var(--ink);
    font-family: var(--font-body);
    font-size: 14px;
    transition: all var(--transition);
    width: 100%;
    outline: none;
  }
  input:hover, select:hover { border-color: var(--wine-mid); }
  input:focus, select:focus, textarea:focus { 
    border-color: var(--wine); 
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(139,38,53,0.09); 
  }
  input::placeholder, textarea::placeholder { color: var(--ink-whisper); }
  select option { background: var(--white); }
  textarea { resize: vertical; min-height: 80px; }

  /* ── TABLES ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead { background: var(--cream); }
  th { 
    text-align: left; 
    padding: 10px 16px; 
    color: var(--ink-light); 
    font-size: 10.5px; 
    font-weight: 600; 
    letter-spacing: 1px; 
    text-transform: uppercase; 
    border-bottom: 1px solid var(--stone);
    white-space: nowrap;
  }
  td { 
    padding: 13px 16px; 
    border-bottom: 1px solid var(--stone); 
    color: var(--ink-med); 
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: var(--cream); }
  .td-primary { color: var(--ink); font-weight: 500; }
  .td-mono { font-family: 'SF Mono', 'Consolas', monospace; font-size: 12.5px; }

  /* ── BADGES ── */
  .badge { 
    display: inline-flex; 
    align-items: center; 
    gap: 4px;
    padding: 3px 10px; 
    border-radius: 20px; 
    font-size: 11px; 
    font-weight: 600; 
    letter-spacing: 0.2px; 
    white-space: nowrap;
  }
  .badge::before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .badge-green   { background: var(--success-bg); color: var(--success); }
  .badge-red     { background: var(--danger-bg);  color: var(--wine); }
  .badge-blue    { background: var(--info-bg);    color: var(--info); }
  .badge-warn    { background: var(--warn-bg);    color: var(--warn); }
  .badge-gray    { background: var(--stone);      color: var(--ink-light); }
  .badge-purple  { background: #F0EAF9;           color: #6B35A8; }
  .badge-wine    { background: var(--wine-pale);  color: var(--wine-deep); }
  .badge-no-dot::before { display: none; }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(28,20,16,0.45);
    backdrop-filter: blur(3px);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .modal {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: modalIn 0.18s ease;
  }
  .modal-lg { max-width: 720px; }
  @keyframes modalIn { 
    from { opacity: 0; transform: translateY(10px) scale(0.98); } 
    to   { opacity: 1; transform: none; } 
  }
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 18px;
    border-bottom: 1px solid var(--stone);
    background: var(--cream);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  .modal-header-left { display: flex; align-items: center; gap: 12px; }
  .modal-icon {
    width: 34px; height: 34px;
    background: var(--wine-pale);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    color: var(--wine);
    flex-shrink: 0;
  }
  .modal-title { 
    font-family: var(--font-head);
    font-size: 15px; 
    font-weight: 700; 
    color: var(--ink); 
    letter-spacing: -0.2px;
  }
  .modal-desc { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .modal-body { padding: 24px; }
  .modal-footer { 
    display: flex; 
    justify-content: flex-end; 
    gap: 10px; 
    padding: 16px 24px; 
    border-top: 1px solid var(--stone); 
    background: var(--cream);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
  .btn-icon { 
    background: none; border: none; cursor: pointer; 
    color: var(--ink-ghost); padding: 6px; border-radius: 6px; 
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition); 
  }
  .btn-icon:hover { background: var(--stone); color: var(--ink-med); }

  /* ── STATS GRID ── */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card { 
    background: var(--white); 
    border: 1px solid var(--stone); 
    border-radius: var(--radius-lg); 
    padding: 20px 22px;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
  }
  .stat-card.wine::after  { background: var(--wine); }
  .stat-card.green::after { background: var(--success); }
  .stat-card.blue::after  { background: var(--info); }
  .stat-card.amber::after { background: var(--warn); }
  .stat-icon-wrap {
    width: 38px; height: 38px;
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .stat-icon-wrap.wine  { background: var(--wine-pale);  color: var(--wine); }
  .stat-icon-wrap.green { background: var(--success-bg); color: var(--success); }
  .stat-icon-wrap.blue  { background: var(--info-bg);    color: var(--info); }
  .stat-icon-wrap.amber { background: var(--warn-bg);    color: var(--warn); }
  .stat-value { 
    font-family: var(--font-head);
    font-size: 28px; 
    font-weight: 700; 
    color: var(--ink); 
    line-height: 1;
    letter-spacing: -1px;
    margin-bottom: 6px;
  }
  .stat-label { font-size: 12px; font-weight: 500; color: var(--ink-light); }
  .stat-delta { font-size: 11px; color: var(--ink-ghost); margin-top: 4px; }

  /* ── ALERTS ── */
  .alert { 
    padding: 11px 14px; 
    border-radius: var(--radius-sm); 
    font-size: 13px; 
    margin-bottom: 16px; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    border-left: 3px solid transparent;
  }
  .alert-success { background: var(--success-bg); border-left-color: var(--success); color: var(--success); }
  .alert-error   { background: var(--danger-bg);  border-left-color: var(--wine);    color: var(--wine); }
  .alert-info    { background: var(--info-bg);    border-left-color: var(--info);    color: var(--info); }

  /* ── AVAILABILITY SLOTS ── */
  .avail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-top: 12px; }
  .avail-slot { 
    background: var(--success-bg); 
    border: 1px solid #C0DFD0; 
    border-radius: var(--radius-sm); 
    padding: 10px; 
    font-size: 12px; 
    color: var(--success); 
    text-align: center; 
    cursor: pointer; 
    transition: all var(--transition); 
  }
  .avail-slot:hover { background: #D6EEE3; transform: translateY(-2px); box-shadow: var(--shadow-sm); }
  .avail-slot.selected { 
    background: var(--success); 
    border-color: var(--success);
    color: #fff;
    box-shadow: 0 4px 10px rgba(45,122,79,0.3);
  }
  .avail-slot-time { font-weight: 700; font-size: 14px; }
  .avail-slot-label { opacity: 0.75; font-size: 10.5px; margin-top: 2px; }

  /* ── TABS ── */
  .tab-list { display: flex; gap: 2px; border-bottom: 1px solid var(--stone); margin-bottom: 24px; }
  .tab { 
    padding: 10px 18px; 
    font-size: 13px; 
    font-weight: 500; 
    cursor: pointer; 
    border: none; 
    background: none; 
    color: var(--ink-ghost); 
    border-bottom: 2px solid transparent; 
    margin-bottom: -1px; 
    transition: all var(--transition); 
    font-family: var(--font-body);
  }
  .tab.active { color: var(--wine); border-bottom-color: var(--wine); font-weight: 600; }
  .tab:hover:not(.active) { color: var(--ink-med); }

  /* ── STEP INDICATOR ── */
  .step-indicator { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .step { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--ink-ghost); }
  .step.active { color: var(--wine); }
  .step.done   { color: var(--success); }
  .step-num { 
    width: 24px; height: 24px; border-radius: 50%; 
    background: var(--stone); 
    border: 1px solid var(--stone-dark);
    display: flex; align-items: center; justify-content: center; 
    font-size: 11px; font-weight: 700;
  }
  .step.active .step-num { background: var(--wine-pale); border-color: var(--wine-mid); color: var(--wine); }
  .step.done   .step-num { background: var(--success-bg); border-color: #C0DFD0; color: var(--success); }
  .step-divider { flex: 1; height: 1px; background: var(--stone); max-width: 40px; }

  /* ── INFO BOX ── */
  .info-box { 
    background: var(--info-bg); 
    border: 1px solid #B8D0EE; 
    border-left: 3px solid var(--info);
    border-radius: var(--radius-sm); 
    padding: 12px 14px; 
    font-size: 13px; 
    color: var(--info); 
    margin-bottom: 16px; 
    display: flex; 
    align-items: flex-start; 
    gap: 8px; 
  }

  /* ── SCHEDULE CARDS ── */
  .schedule-day-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 12px; margin-top: 4px; }
  .schedule-day-card { 
    background: var(--cream); 
    border: 1px solid var(--stone); 
    border-radius: var(--radius); 
    padding: 14px 16px;
    transition: box-shadow var(--transition);
  }
  .schedule-day-card:hover { box-shadow: var(--shadow-sm); }
  .schedule-day-name { 
    font-family: var(--font-head);
    font-size: 12px; 
    font-weight: 700; 
    color: var(--wine); 
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px; 
  }
  .schedule-day-time { font-size: 13px; color: var(--ink-med); display: flex; align-items: center; gap: 6px; }

  /* ── ACTIONS ── */
  .actions-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

  /* ── EMPTY STATE ── */
  .empty-state { 
    text-align: center; 
    padding: 52px 20px; 
    color: var(--ink-ghost);
  }
  .empty-state-icon { 
    width: 52px; height: 52px;
    background: var(--stone);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px;
    color: var(--ink-whisper);
  }
  .empty-state-title { font-size: 14px; font-weight: 500; color: var(--ink-light); margin-bottom: 6px; }
  .empty-state p { font-size: 13px; }

  /* ── SPINNER ── */
  .spinner { width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid var(--stone); border-top-color: var(--wine); animation: spin 0.75s linear infinite; margin: 44px auto; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── REPORT CARDS ── */
  .report-card { background: var(--white); border: 1px solid var(--stone); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 20px; box-shadow: var(--shadow-sm); }
  .report-header { 
    padding: 16px 22px; 
    background: var(--cream);
    border-bottom: 1px solid var(--stone); 
    display: flex; align-items: center; gap: 10px;
  }
  .report-icon { color: var(--wine); }
  .report-title { font-family: var(--font-head); font-size: 14px; font-weight: 700; color: var(--ink); }
  .report-body { padding: 20px 22px; }

  /* ── TOGGLE BADGE BUTTON ── */
  button.badge { cursor: pointer; border: none; transition: all var(--transition); }
  button.badge:hover { filter: brightness(0.95); }

  /* ── DIVIDER ── */
  .divider { height: 1px; background: var(--stone); margin: 20px 0; }

  /* ── PATIENT / DOCTOR AVATAR ── */
  .avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
    flex-shrink: 0;
  }
  .avatar-wine  { background: var(--wine-pale); color: var(--wine-deep); }
  .avatar-blue  { background: var(--info-bg);   color: var(--info); }
  .avatar-green { background: var(--success-bg); color: var(--success); }

  /* ── CELL WITH AVATAR ── */
  .cell-with-avatar { display: flex; align-items: center; gap: 10px; }
  .cell-avatar-info {}
  .cell-avatar-primary { font-size: 13.5px; font-weight: 500; color: var(--ink); line-height: 1.2; }
  .cell-avatar-secondary { font-size: 11px; color: var(--ink-ghost); }

  /* ── TOAST ── */
  .toast {
    position: fixed;
    bottom: 24px; right: 24px;
    z-index: 999;
    min-width: 280px;
    max-width: 380px;
    padding: 14px 18px;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: toastIn 0.2s ease;
    border: 1px solid transparent;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .toast-success { background: #fff; border-color: #C0DFD0; color: var(--success); }
  .toast-error   { background: #fff; border-color: var(--wine-soft); color: var(--wine); }
  .toast-icon { flex-shrink: 0; }

  /* ── SECTION HEADER WITH RULE ── */
  .section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0 16px;
  }
  .section-divider-label { font-size: 11px; font-weight: 600; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; }
  .section-divider-line { flex: 1; height: 1px; background: var(--stone); }

  /* ── RESPONSIVE ── */
  @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 900px) {
    .main { margin-left: 0; }
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .btn-menu { display: flex; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 580px) {
    .stats-grid { grid-template-columns: 1fr; }
    .content { padding: 16px; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DOC_TYPES = ["CC","TI","CE","PASAPORTE","NIT"];
const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_ES = { MONDAY:"Lunes",TUESDAY:"Martes",WEDNESDAY:"Miércoles",THURSDAY:"Jueves",FRIDAY:"Viernes",SATURDAY:"Sábado",SUNDAY:"Domingo" };

// ─── HOOKS ────────────────────────────────────────────────────────────────────
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

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Modal({ title, desc, icon = "plus", onClose, onSave, saving, children, size = "" }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-icon"><Icon name={icon} size={16} /></div>
            <div>
              <div className="modal-title">{title}</div>
              {desc && <div className="modal-desc">{desc}</div>}
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="close" size={15} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {onSave && (
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={onSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DataTable({ columns, rows, loading, emptyMsg = "Sin registros", emptyIcon = "search" }) {
  if (loading) return <div className="spinner" />;
  if (!rows || !Array.isArray(rows) || rows.length === 0)
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon name={emptyIcon} size={22} /></div>
        <div className="empty-state-title">Sin resultados</div>
        <p>{emptyMsg}</p>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((c) => (
                <td key={c.key} className={c.primary ? "td-primary" : ""}>
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
  useEffect(() => { const t = setTimeout(onClose, 3800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        <Icon name={type === "success" ? "check" : "warning"} size={16} />
      </span>
      {msg}
    </div>
  );
}

function Initials({ name, variant = "wine" }) {
  const parts = (name || "?").trim().split(" ");
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) ?? "?";
  return <div className={`avatar avatar-${variant}`}>{init.toUpperCase()}</div>;
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function PatientsView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/patients"));
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/patients", form);
      else await api.patch(`/patients/${selected.id}`, form);
      toast("Paciente guardado correctamente", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error al guardar", "error"); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (r) => {
    if (togglingId) return;
    setTogglingId(r.id);
    try {
      await api.patch(`/patients/${r.id}`, { fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, documentType: r.documentType, active: !r.active });
      toast(`Paciente ${!r.active ? "activado" : "inactivado"}`, "success");
      reload();
    } catch (e) { toast(e.message || "Error al cambiar estado", "error"); }
    finally { setTogglingId(null); }
  };

  const cols = [
    { key: "fullName", label: "Paciente", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={r.fullName} variant="wine" />
        <div className="cell-avatar-info">
          <div className="cell-avatar-primary">{r.fullName}</div>
          <div className="cell-avatar-secondary">{r.email}</div>
        </div>
      </div>
    )},
    { key: "documentType", label: "Documento", render: (r) => (
      <span>
        <span className="badge badge-no-dot badge-gray" style={{ marginRight: 5 }}>{r.documentType}</span>
        <span className="td-mono">{r.documentNumber}</span>
      </span>
    )},
    { key: "phoneNumber", label: "Teléfono" },
    { key: "active", label: "Estado", render: (r) => (
      <button
        className={`badge ${r.active ? "badge-green" : "badge-red"}`}
        style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }}
        disabled={togglingId === r.id}
        onClick={() => handleToggleActive(r)}
        title="Clic para cambiar estado"
      >
        {r.active ? "Activo" : "Inactivo"}
      </button>
    )},
    { key: "actions", label: "", render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, documentType: r.documentType }); setModal("edit"); }}>
        <Icon name="edit" size={13} /> Editar
      </button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Pacientes</div>
          <div className="page-subtitle">Registro y seguimiento de pacientes activos</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}>
          <Icon name="plus" size={14} /> Nuevo paciente
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Listado de pacientes</div>
            <div className="card-subtitle">{Array.isArray(data) ? data.length : "—"} registros</div>
          </div>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay pacientes registrados" emptyIcon="patients" />
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={modal === "create" ? "Nuevo paciente" : "Editar paciente"}
          desc={modal === "create" ? "Complete los datos del nuevo paciente" : "Actualice la información del paciente"}
          icon="patients"
          onClose={() => setModal(null)} onSave={handleSave} saving={saving}
        >
          <div className="form-grid">
            <div className="form-group full"><label>Nombre completo</label><input value={form.fullName || ""} onChange={(e) => f("fullName", e.target.value)} placeholder="Ej: María García López" /></div>
            <div className="form-group">
              <label>Tipo de documento</label>
              <select value={form.documentType || ""} onChange={(e) => f("documentType", e.target.value)}>
                <option value="">Seleccione…</option>
                {DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Número de documento</label><input value={form.documentNumber || ""} onChange={(e) => f("documentNumber", e.target.value)} disabled={modal === "edit"} placeholder="12345678" /></div>
            <div className="form-group"><label>Correo electrónico</label><input type="email" value={form.email || ""} onChange={(e) => f("email", e.target.value)} placeholder="correo@ejemplo.com" /></div>
            <div className="form-group"><label>Teléfono de contacto</label><input value={form.phoneNumber || ""} onChange={(e) => f("phoneNumber", e.target.value)} placeholder="+57 300 000 0000" /></div>
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
  const [togglingId, setTogglingId] = useState(null);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/doctors", form);
      else await api.patch(`/doctors/${selected.id}`, form);
      toast("Médico guardado correctamente", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (r) => {
    if (togglingId) return;
    setTogglingId(r.id);
    try {
      await api.patch(`/doctors/${r.id}`, { specialtyId: r.specialtyId, fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, numberLicense: r.numberLicense ?? r.licenseNumber, documentNumber: r.documentNumber, documentType: r.documentType, active: !r.active });
      toast(`Médico ${!r.active ? "activado" : "inactivado"}`, "success");
      reload();
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setTogglingId(null); }
  };

  const getSpecName = (id) => (specs || []).find((s) => s.id === id)?.name ?? "—";

  const cols = [
    { key: "fullName", label: "Médico", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={r.fullName} variant="blue" />
        <div className="cell-avatar-info">
          <div className="cell-avatar-primary">{r.fullName}</div>
          <div className="cell-avatar-secondary">{r.email}</div>
        </div>
      </div>
    )},
    { key: "specialtyId", label: "Especialidad", render: (r) => <span className="badge badge-no-dot badge-purple">{getSpecName(r.specialtyId)}</span> },
    { key: "documentNumber", label: "Documento", render: (r) => r.documentNumber ? <span className="td-mono">{r.documentType} {r.documentNumber}</span> : "—" },
    { key: "licenseNumber", label: "Licencia", render: (r) => <span className="td-mono">{r.numberLicense ?? r.licenseNumber ?? "—"}</span> },
    { key: "active", label: "Estado", render: (r) => (
      <button className={`badge ${r.active ? "badge-green" : "badge-red"}`} style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }} disabled={togglingId === r.id} onClick={() => handleToggleActive(r)} title="Clic para cambiar estado">
        {r.active ? "Activo" : "Inactivo"}
      </button>
    )},
    { key: "actions", label: "", render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ specialtyId: r.specialtyId, fullName: r.fullName, email: r.email, phoneNumber: r.phoneNumber, numberLicense: r.numberLicense ?? r.licenseNumber, documentType: r.documentType, documentNumber: r.documentNumber }); setModal("edit"); }}>
        <Icon name="edit" size={13} /> Editar
      </button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Médicos</div>
          <div className="page-subtitle">Personal médico y especialistas registrados</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}>
          <Icon name="plus" size={14} /> Nuevo médico
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Listado de médicos</div>
            <div className="card-subtitle">{Array.isArray(data) ? data.length : "—"} registros</div>
          </div>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay médicos registrados" emptyIcon="doctors" />
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo médico" : "Editar médico"} desc="Información del profesional médico" icon="stethoscope" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group full"><label>Nombre completo</label><input value={form.fullName || ""} onChange={(e) => f("fullName", e.target.value)} placeholder="Dr. Juan Rodríguez" /></div>
            <div className="form-group">
              <label>Especialidad</label>
              <select value={form.specialtyId || ""} onChange={(e) => f("specialtyId", e.target.value)}>
                <option value="">Seleccione…</option>
                {(specs || []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Correo electrónico</label><input type="email" value={form.email || ""} onChange={(e) => f("email", e.target.value)} /></div>
            <div className="form-group"><label>Teléfono</label><input value={form.phoneNumber || ""} onChange={(e) => f("phoneNumber", e.target.value)} /></div>
            <div className="form-group"><label>Número de licencia</label><input value={form.numberLicense || ""} onChange={(e) => f("numberLicense", e.target.value)} /></div>
            <div className="form-group">
              <label>Tipo de documento</label>
              <select value={form.documentType || ""} onChange={(e) => f("documentType", e.target.value)} disabled={modal === "edit"}>
                <option value="">Seleccione…</option>
                {DOC_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Número de documento</label><input value={form.documentNumber || ""} onChange={(e) => f("documentNumber", e.target.value)} disabled={modal === "edit"} /></div>
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
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const fetchSlots = async (doctorId, officeId, date, appointmentTypeId) => {
    if (!doctorId || !officeId || !date || !appointmentTypeId) return;
    setLoadingSlots(true); setSlots([]); setSelectedSlot(null);
    try {
      const d = await api.get(`/availability/doctors/${doctorId}?officeId=${officeId}&date=${date}&appointmentTypeId=${appointmentTypeId}`);
      setSlots(Array.isArray(d) ? d : []);
    } catch { setSlots([]); } finally { setLoadingSlots(false); }
  };

  const handleOpenCreate = () => { setForm({}); setSlots([]); setSelectedSlot(null); setStep(1); setModal("create"); };
  const handleNextStep = () => {
    if (!form.doctorId || !form.officeId || !form.date || !form.appointmentTypeId) { toast("Completa doctor, consultorio, tipo de cita y fecha", "error"); return; }
    fetchSlots(form.doctorId, form.officeId, form.date, form.appointmentTypeId); setStep(2);
  };

  const handleSave = async () => {
    if (!selectedSlot) { toast("Selecciona un horario disponible", "error"); return; }
    setSaving(true);
    try {
      await api.post("/appointments", { ...form, startsAt: selectedSlot.startsAt, observations: form.observations || "Sin observaciones" });
      toast("Cita creada exitosamente", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error al crear cita", "error"); }
    finally { setSaving(false); }
  };

  const doAction = async (id, action, body) => {
    try {
      await api.patch(`/appointments/${id}/${action}`, body);
      const labels = { confirm:"confirmada", cancel:"cancelada", complete:"completada", "no-show":"marcada como no-show" };
      toast(`Cita ${labels[action]}`, "success"); reload();
    } catch (e) { toast(e.message || "Error", "error"); }
  };

  const getName = (list, id) => (list || []).find((x) => x.id === id)?.fullName ?? (list || []).find((x) => x.id === id)?.name ?? "—";

  const statusMap = {
    SCHEDULED:  ["Programada",  "badge-blue"],
    CONFIRMED:  ["Confirmada",  "badge-green"],
    CANCELLED:  ["Cancelada",   "badge-red"],
    COMPLETED:  ["Completada",  "badge-gray"],
    NO_SHOW:    ["No asistió",  "badge-warn"],
  };

  const cols = [
    { key: "patientId", label: "Paciente", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={getName(patients, r.patientId)} variant="wine" />
        <div className="cell-avatar-primary" style={{ fontSize: 13.5 }}>{getName(patients, r.patientId)}</div>
      </div>
    )},
    { key: "doctorId", label: "Médico", render: (r) => getName(doctors, r.doctorId) },
    { key: "date", label: "Fecha" },
    { key: "startAt", label: "Hora", render: (r) => <span className="td-mono">{r.startAt ?? r.startsAt ?? "—"}</span> },
    { key: "status", label: "Estado", render: (r) => { const [l,c] = statusMap[r.status] ?? ["—","badge-gray"]; return <span className={`badge ${c}`}>{l}</span>; } },
    { key: "actions", label: "Acciones", render: (r) => (
      <div className="actions-row">
        {r.status === "SCHEDULED" && <button className="btn btn-success btn-xs" onClick={() => doAction(r.id, "confirm")}><Icon name="check" size={11} /> Confirmar</button>}
        {(r.status === "SCHEDULED" || r.status === "CONFIRMED") && <button className="btn btn-danger btn-xs" onClick={() => setCancelId(r.id)}><Icon name="cancel" size={11} /> Cancelar</button>}
        {r.status === "CONFIRMED" && <button className="btn btn-ghost btn-xs" onClick={() => doAction(r.id, "complete")}>Completar</button>}
        {r.status === "CONFIRMED" && <button className="btn btn-warn btn-xs" onClick={() => doAction(r.id, "no-show")}><Icon name="noshow" size={11} /> No-show</button>}
      </div>
    )},
  ];

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast("Ingresa el motivo de cancelación", "error"); return; }
    await doAction(cancelId, "cancel", { cancelReason }); setCancelId(null); setCancelReason("");
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Citas médicas</div>
          <div className="page-subtitle">Agendamiento y seguimiento de consultas</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}><Icon name="plus" size={14} /> Nueva cita</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Registro de citas</div>
            <div className="card-subtitle">{Array.isArray(data) ? data.length : "—"} citas en total</div>
          </div>
        </div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay citas registradas" emptyIcon="appointments" />
      </div>

      {cancelId && (
        <Modal title="Cancelar cita" desc="Esta acción no se puede deshacer" icon="cancel" onClose={() => setCancelId(null)} onSave={handleCancel} saving={saving}>
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <Icon name="warning" size={14} /> Confirme el motivo para continuar con la cancelación.
          </div>
          <div className="form-group">
            <label>Motivo de cancelación</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Describa el motivo de la cancelación…" style={{ minHeight: 100 }} />
          </div>
        </Modal>
      )}

      {modal === "create" && (
        <Modal title="Nueva cita médica" desc="Agendamiento en dos pasos" icon="appointments" onClose={() => setModal(null)} onSave={step === 2 ? handleSave : null} saving={saving} size="modal-lg">
          <div className="step-indicator">
            <div className={`step ${step === 1 ? "active" : "done"}`}>
              <div className="step-num">{step > 1 ? <Icon name="check" size={10} /> : "1"}</div>
              <span>Datos básicos</span>
            </div>
            <div className="step-divider" />
            <div className={`step ${step === 2 ? "active" : ""}`}>
              <div className="step-num">2</div>
              <span>Horario disponible</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Paciente</label>
                  <select value={form.patientId || ""} onChange={(e) => f("patientId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Médico tratante</label>
                  <select value={form.doctorId || ""} onChange={(e) => f("doctorId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Consultorio</label>
                  <select value={form.officeId || ""} onChange={(e) => f("officeId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(offices || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo de cita</label>
                  <select value={form.appointmentTypeId || ""} onChange={(e) => f("appointmentTypeId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(apptypes || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fecha de consulta</label>
                  <input type="date" value={form.date || ""} onChange={(e) => f("date", e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 24, textAlign: "right" }}>
                <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                  Ver disponibilidad <Icon name="chevron" size={13} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="info-box">
                <Icon name="clock" size={14} />
                <span>Horarios disponibles para el <strong>{form.date}</strong></span>
              </div>
              {loadingSlots ? <div className="spinner" /> :
               !Array.isArray(slots) || slots.length === 0
                ? <div className="empty-state"><p>Sin disponibilidad para esta fecha o criterios seleccionados</p></div>
                : (
                  <div>
                    <div style={{ fontSize: 12, color: "var(--ink-ghost)", marginBottom: 12 }}>{slots.length} horarios disponibles</div>
                    <div className="avail-grid">
                      {slots.map((s, i) => {
                        const hourStr = s.startsAt ?? s;
                        const isSel = selectedSlot?.startsAt === hourStr;
                        return (
                          <div key={i} className={`avail-slot ${isSel ? "selected" : ""}`} onClick={() => setSelectedSlot(s)}>
                            <div className="avail-slot-time">{hourStr}</div>
                            <div className="avail-slot-label">{s.endsAt ? `→ ${s.endsAt}` : "Disponible"}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              }
              {selectedSlot && (
                <div className="alert alert-success" style={{ marginTop: 16 }}>
                  <Icon name="check" size={14} />
                  Horario seleccionado: <strong style={{ marginLeft: 4 }}>{selectedSlot.startsAt}{selectedSlot.endsAt ? ` – ${selectedSlot.endsAt}` : ""}</strong>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Volver</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── SPECIALTIES ──────────────────────────────────────────────────────────────
function SpecialtiesView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/specialties"));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { toast("El nombre es obligatorio", "error"); return; }
    setSaving(true);
    try {
      if (modal === "create") await api.post("/specialties", form);
      else await api.patch(`/specialties/${form.id}`, form);
      toast("Especialidad guardada", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta especialidad?")) return;
    try { await api.delete(`/specialties/${id}`); toast("Especialidad eliminada", "success"); reload(); }
    catch (e) { toast(e.message || "Error al eliminar", "error"); }
  };

  const cols = [
    { key: "name", label: "Especialidad", primary: true, render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--wine-pale)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--wine)", flexShrink: 0 }}>
          <Icon name="specialties" size={14} />
        </div>
        <span style={{ fontWeight: 500, color: "var(--ink)" }}>{r.name}</span>
      </div>
    )},
    { key: "description", label: "Descripción", render: (r) => <span style={{ color: "var(--ink-light)" }}>{r.description || "—"}</span> },
    { key: "actions", label: "Acciones", render: (r) => (
      <div className="actions-row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...r }); setModal("edit"); }}><Icon name="edit" size={12} /> Editar</button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Icon name="trash" size={12} /> Eliminar</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Especialidades</div>
          <div className="page-subtitle">Áreas médicas y especialidades disponibles</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nueva especialidad</button>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Listado de especialidades</div></div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay especialidades registradas" emptyIcon="specialties" />
      </div>
      {modal && (
        <Modal title={modal === "create" ? "Nueva especialidad" : "Editar especialidad"} icon="specialties" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid cols-1">
            <div className="form-group"><label>Nombre de la especialidad</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} placeholder="Ej: Pediatría" /></div>
            <div className="form-group"><label>Descripción</label><textarea value={form.description || ""} onChange={(e) => f("description", e.target.value)} placeholder="Descripción de la especialidad…" /></div>
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
  const [togglingId, setTogglingId] = useState(null);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === "create") await api.post("/offices", form);
      else await api.patch(`/offices/${selected.id}`, form);
      toast("Consultorio guardado", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const handleToggleActive = async (r) => {
    if (togglingId) return;
    setTogglingId(r.id);
    try {
      await api.patch(`/offices/${r.id}`, { name: r.name, location: r.location, active: !r.active });
      toast(`Consultorio ${!r.active ? "activado" : "inactivado"}`, "success"); reload();
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setTogglingId(null); }
  };

  const cols = [
    { key: "name", label: "Consultorio", primary: true, render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--info-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--info)", flexShrink: 0 }}>
          <Icon name="offices" size={14} />
        </div>
        <span style={{ fontWeight: 500, color: "var(--ink)" }}>{r.name}</span>
      </div>
    )},
    { key: "location", label: "Ubicación" },
    { key: "active", label: "Estado", render: (r) => (
      <button className={`badge ${r.active ? "badge-green" : "badge-red"}`} style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }} disabled={togglingId === r.id} onClick={() => handleToggleActive(r)} title="Clic para cambiar estado">
        {r.active ? "Activo" : "Inactivo"}
      </button>
    )},
    { key: "actions", label: "", render: (r) => (
      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(r); setForm({ name: r.name, location: r.location, active: r.active }); setModal("edit"); }}>
        <Icon name="edit" size={13} /> Editar
      </button>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Consultorios</div>
          <div className="page-subtitle">Espacios físicos de atención médica</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo consultorio</button>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Listado de consultorios</div></div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay consultorios registrados" emptyIcon="offices" />
      </div>
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo consultorio" : "Editar consultorio"} icon="offices" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Nombre del consultorio</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} placeholder="Ej: Consultorio 101" /></div>
            <div className="form-group"><label>Ubicación / Piso</label><input value={form.location || ""} onChange={(e) => f("location", e.target.value)} placeholder="Ej: Piso 3, Ala Norte" /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── APPOINTMENT TYPES ────────────────────────────────────────────────────────
function AppTypesView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/appointment-types"));
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim()) { toast("El nombre es obligatorio", "error"); return; }
    if (!form.durationMinutes || form.durationMinutes <= 0) { toast("La duración debe ser mayor a 0", "error"); return; }
    setSaving(true);
    try {
      if (modal === "create") await api.post("/appointment-types", form);
      else await api.patch(`/appointment-types/${form.id}`, form);
      toast("Tipo de cita guardado", "success"); reload(); setModal(null);
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este tipo de cita?")) return;
    try { await api.delete(`/appointment-types/${id}`); toast("Tipo de cita eliminado", "success"); reload(); }
    catch (e) { toast(e.message || "Error", "error"); }
  };

  const cols = [
    { key: "name", label: "Tipo de cita", primary: true },
    { key: "durationMinutes", label: "Duración", render: (r) => (
      <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--ink-med)" }}>
        <Icon name="clock" size={13} /> {r.durationMinutes} min
      </span>
    )},
    { key: "description", label: "Descripción", render: (r) => <span style={{ color: "var(--ink-light)" }}>{r.description || "—"}</span> },
    { key: "actions", label: "Acciones", render: (r) => (
      <div className="actions-row">
        <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ ...r }); setModal("edit"); }}><Icon name="edit" size={12} /> Editar</button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Icon name="trash" size={12} /> Eliminar</button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Tipos de cita</div>
          <div className="page-subtitle">Modalidades y duraciones de consulta</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo tipo</button>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Listado de tipos de cita</div></div>
        <DataTable columns={cols} rows={data} loading={loading} emptyMsg="No hay tipos de cita registrados" emptyIcon="apptypes" />
      </div>
      {modal && (
        <Modal title={modal === "create" ? "Nuevo tipo de cita" : "Editar tipo de cita"} icon="apptypes" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group"><label>Nombre</label><input value={form.name || ""} onChange={(e) => f("name", e.target.value)} placeholder="Ej: Consulta General" /></div>
            <div className="form-group"><label>Duración (minutos)</label><input type="number" value={form.durationMinutes || ""} onChange={(e) => f("durationMinutes", parseInt(e.target.value) || "")} placeholder="Ej: 20" /></div>
            <div className="form-group full"><label>Descripción</label><textarea value={form.description || ""} onChange={(e) => f("description", e.target.value)} placeholder="Descripción del tipo de consulta…" /></div>
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
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
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
    if (!form.dayOfWeek || !form.startAt || !form.endAt) return toast("Completa todos los campos", "error");
    setSaving(true);
    try {
      if (modal === "edit") await api.patch(`/doctors/${doctorId}/schedules/${selected.id}`, form);
      else await api.post(`/doctors/${doctorId}/schedules`, { ...form, doctorId });
      toast("Horario guardado", "success"); loadSchedules(doctorId); setModal(null); setSelected(null); setForm({});
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este horario?")) return;
    try { await fetch(`${BASE_URL}/doctors/${doctorId}/schedules/${id}`, { method: "DELETE" }); toast("Horario eliminado", "success"); loadSchedules(doctorId); }
    catch { toast("Error al eliminar", "error"); }
  };

  const selectedDoctor = (doctors || []).find((d) => d.id === doctorId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Operación</div>
          <div className="page-title">Horarios médicos</div>
          <div className="page-subtitle">Configure la disponibilidad semanal de cada médico</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Seleccionar médico</div></div>
        <div className="card-body">
          <div className="form-grid" style={{ maxWidth: 380 }}>
            <div className="form-group full">
              <label>Médico</label>
              <select value={doctorId} onChange={(e) => { setDoctorId(e.target.value); loadSchedules(e.target.value); }}>
                <option value="">Seleccione un médico…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
          </div>
          {selectedDoctor && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <Initials name={selectedDoctor.fullName} variant="blue" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{selectedDoctor.fullName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-ghost)" }}>Médico seleccionado</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {doctorId && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Horarios de la semana</div>
            <button className="btn btn-primary" onClick={() => { setForm({}); setSelected(null); setModal("create"); }}><Icon name="plus" size={14} /> Agregar horario</button>
          </div>
          <div className="card-body">
            {loading && <div className="spinner" />}
            {!loading && schedules?.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><Icon name="clock" size={22} /></div>
                <div className="empty-state-title">Sin horarios configurados</div>
                <p>Este médico no tiene horarios para esta semana.</p>
                <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => { setForm({}); setSelected(null); setModal("create"); }}><Icon name="plus" size={14} /> Agregar primer horario</button>
              </div>
            )}
            {!loading && schedules?.length > 0 && (
              <div className="schedule-day-grid">
                {schedules.map((s, i) => (
                  <div className="schedule-day-card" key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div className="schedule-day-name">{DAY_ES[s.dayOfWeek] ?? s.dayOfWeek}</div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-icon" onClick={() => { setSelected(s); setForm({ dayOfWeek: s.dayOfWeek, startAt: s.startsAt, endAt: s.endsAt }); setModal("edit"); }}><Icon name="edit" size={13} /></button>
                        <button className="btn-icon" style={{ color: "var(--wine)" }} onClick={() => handleDelete(s.id)}><Icon name="trash" size={13} /></button>
                      </div>
                    </div>
                    <div className="schedule-day-time"><Icon name="clock" size={13} /> {s.startsAt} → {s.endsAt}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modal && (
        <Modal title={modal === "edit" ? "Editar horario" : "Agregar horario"} icon="schedules" onClose={() => { setModal(null); setSelected(null); setForm({}); }} onSave={handleSave} saving={saving}>
          <div className="form-grid">
            <div className="form-group full">
              <label>Día de la semana</label>
              <select value={form.dayOfWeek || ""} onChange={(e) => f("dayOfWeek", e.target.value)}>
                <option value="">Seleccione…</option>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_ES[d]}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Hora de inicio</label><input type="time" value={form.startAt || ""} onChange={(e) => f("startAt", e.target.value)} /></div>
            <div className="form-group"><label>Hora de fin</label><input type="time" value={form.endAt || ""} onChange={(e) => f("endAt", e.target.value)} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── AVAILABILITY ─────────────────────────────────────────────────────────────
function AvailabilityView() {
  const { data: doctors } = useData(() => api.get("/doctors"));
  const { data: offices } = useData(() => api.get("/offices"));
  const { data: apptypes } = useData(() => api.get("/appointment-types"));
  const [doctorId, setDoctorId] = useState("");
  const [officeId, setOfficeId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [appointmentTypeId, setAppointmentTypeId] = useState("");
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!doctorId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ date: fecha });
      if (officeId) params.append("officeId", officeId);
      if (appointmentTypeId) params.append("appointmentTypeId", appointmentTypeId);
      setSlots(await api.get(`/availability/doctors/${doctorId}?${params.toString()}`));
    } catch { setSlots([]); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Operación</div>
          <div className="page-title">Disponibilidad</div>
          <div className="page-subtitle">Consulte los horarios libres de un médico</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Parámetros de búsqueda</div></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Médico</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Seleccione…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Consultorio (opcional)</label>
              <select value={officeId} onChange={(e) => setOfficeId(e.target.value)}>
                <option value="">Todos los consultorios</option>
                {(offices || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Tipo de cita (opcional)</label>
              <select value={appointmentTypeId} onChange={(e) => setAppointmentTypeId(e.target.value)}>
                <option value="">Jornada completa</option>
                {(apptypes || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={search} disabled={!doctorId}>
              <Icon name="search" size={14} /> Consultar disponibilidad
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="spinner" />}
      {slots && !loading && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Slots disponibles</div>
              <div className="card-subtitle">{fecha} · {Array.isArray(slots) ? slots.length : 0} horarios</div>
            </div>
          </div>
          <div className="card-body">
            {!Array.isArray(slots) || slots.length === 0
              ? <div className="empty-state"><p>Sin disponibilidad para la fecha y criterios seleccionados</p></div>
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
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-eyebrow">Análisis</div>
          <div className="page-title">Reportes clínicos</div>
          <div className="page-subtitle">Métricas de rendimiento y operación</div>
        </div>
      </div>

      <div className="tab-list">
        {[["occupancy","Ocupación consultorios"],["productivity","Productividad médicos"],["noshow","No-shows"]].map(([id, label]) => (
          <button key={id} className={`tab ${activeTab === id ? "active" : ""}`} onClick={() => setActiveTab(id)}>{label}</button>
        ))}
      </div>

      {activeTab === "occupancy" && (
        <div className="report-card">
          <div className="report-header">
            <span className="report-icon"><Icon name="offices" size={15} /></span>
            <span className="report-title">Ocupación por consultorio</span>
          </div>
          <div className="report-body">
            <DataTable loading={l1} rows={Array.isArray(occupancy) ? occupancy : []} columns={[
              { key: "name", label: "Consultorio", primary: true },
              { key: "totalAppointments", label: "Total citas", render: (r) => <span className="badge badge-blue badge-no-dot">{r.totalAppointments}</span> }
            ]} />
          </div>
        </div>
      )}
      {activeTab === "productivity" && (
        <div className="report-card">
          <div className="report-header">
            <span className="report-icon"><Icon name="doctors" size={15} /></span>
            <span className="report-title">Productividad médicos</span>
          </div>
          <div className="report-body">
            <DataTable loading={l2} rows={Array.isArray(productivity) ? productivity : []} columns={[
              { key: "fullName", label: "Médico", primary: true },
              { key: "completedAppointments", label: "Citas completadas", render: (r) => <span className="badge badge-green badge-no-dot">{r.completedAppointments ?? 0}</span> }
            ]} />
          </div>
        </div>
      )}
      {activeTab === "noshow" && (
        <div className="report-card">
          <div className="report-header">
            <span className="report-icon"><Icon name="noshow" size={15} /></span>
            <span className="report-title">Pacientes con mayor no-show</span>
          </div>
          <div className="report-body">
            <DataTable loading={l3} rows={Array.isArray(noshow) ? noshow : []} columns={[
              { key: "fullName", label: "Paciente", primary: true },
              { key: "noShowCount", label: "No-shows", render: (r) => <span className="badge badge-red badge-no-dot">{r.noShowCount ?? 0}</span> }
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
  const scheduledCount = (appointments || []).filter((a) => a.status === "SCHEDULED").length;
  const completedCount = (appointments || []).filter((a) => a.status === "COMPLETED").length;

  const stats = [
    { label: "Pacientes registrados", value: (patients || []).length, delta: "en el sistema", icon: "patients", color: "wine" },
    { label: "Médicos activos", value: (doctors || []).length, delta: "disponibles", icon: "stethoscope", color: "blue" },
    { label: "Citas confirmadas", value: confirmedCount, delta: `${scheduledCount} pendientes de confirmar`, icon: "appointments", color: "green" },
    { label: "Citas completadas", value: completedCount, delta: "consultas finalizadas", icon: "check", color: "amber" },
  ];

  const statusMap = {
    SCHEDULED: ["Programada","badge-blue"],
    CONFIRMED: ["Confirmada","badge-green"],
    CANCELLED: ["Cancelada","badge-red"],
    COMPLETED: ["Completada","badge-gray"],
    NO_SHOW:   ["No asistió","badge-warn"],
  };

  const getName = (list, id) => (list || []).find((x) => x.id === id)?.fullName ?? "—";

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <div className="page-header-left">
          <div className="page-eyebrow">Panel principal</div>
          <div className="page-title">Resumen clínico</div>
          <div className="page-subtitle">Vista general del estado del sistema</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--ink-ghost)" }}>
          <Icon name="clock" size={13} />
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div className={`stat-card ${s.color}`} key={s.label}>
            <div className={`stat-icon-wrap ${s.color}`}><Icon name={s.icon} size={17} /></div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-delta">{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Citas recientes</div>
            <div className="card-subtitle">Últimas 8 citas registradas</div>
          </div>
        </div>
        <DataTable
          rows={(appointments || []).slice(-8).reverse()}
          loading={false}
          columns={[
            { key: "patientId", label: "Paciente", primary: true, render: (r) => (
              <div className="cell-with-avatar">
                <Initials name={getName(patients, r.patientId)} variant="wine" />
                <span className="cell-avatar-primary">{getName(patients, r.patientId)}</span>
              </div>
            )},
            { key: "doctorId", label: "Médico", render: (r) => getName(doctors, r.doctorId) },
            { key: "date", label: "Fecha" },
            { key: "startAt", label: "Hora", render: (r) => <span className="td-mono">{r.startAt ?? r.startsAt ?? "—"}</span> },
            { key: "status", label: "Estado", render: (r) => { const [l,c] = statusMap[r.status] ?? ["—","badge-gray"]; return <span className={`badge ${c}`}>{l}</span>; } },
          ]}
          emptyMsg="Aún no hay citas registradas"
          emptyIcon="appointments"
        />
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
const VIEWS = {
  dashboard:    { label: "Dashboard",       icon: "dashboard",     component: DashboardView,     section: "general" },
  patients:     { label: "Pacientes",       icon: "patients",      component: PatientsView,      section: "gestion" },
  doctors:      { label: "Médicos",         icon: "stethoscope",   component: DoctorsView,       section: "gestion" },
  appointments: { label: "Citas",           icon: "appointments",  component: AppointmentsView,  section: "gestion" },
  specialties:  { label: "Especialidades",  icon: "specialties",   component: SpecialtiesView,   section: "catalogo" },
  offices:      { label: "Consultorios",    icon: "offices",       component: OfficesView,       section: "catalogo" },
  apptypes:     { label: "Tipos de cita",   icon: "apptypes",      component: AppTypesView,      section: "catalogo" },
  schedules:    { label: "Horarios",        icon: "schedules",     component: SchedulesView,     section: "operacion" },
  availability: { label: "Disponibilidad",  icon: "availability",  component: AvailabilityView,  section: "operacion" },
  reports:      { label: "Reportes",        icon: "reports",       component: ReportsView,       section: "reportes" },
};

const SECTIONS = {
  general:   "General",
  gestion:   "Gestión clínica",
  catalogo:  "Catálogo",
  operacion: "Operación",
  reportes:  "Análisis",
};

export default function MedicalApp() {
  const [view, setView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => setToast({ msg, type });
  const ActiveView = VIEWS[view]?.component;
  const currentView = VIEWS[view];
  const currentSection = SECTIONS[currentView?.section] ?? "";
  const today = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">🏥</div>
              <div>
                <div className="logo-name">MediCare</div>
                <div className="logo-sub">Sistema clínico</div>
              </div>
            </div>
            <div className="logo-badge">v2.0</div>
          </div>

          <nav className="sidebar-nav">
            {Object.entries(SECTIONS).map(([sec, label]) => (
              <div className="nav-section" key={sec}>
                <div className="nav-section-label">{label}</div>
                {Object.entries(VIEWS).filter(([, v]) => v.section === sec).map(([key, v]) => (
                  <button
                    key={key}
                    className={`nav-item ${view === key ? "active" : ""}`}
                    onClick={() => { setView(key); setSidebarOpen(false); }}
                  >
                    <Icon name={v.icon} size={16} />
                    {v.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-avatar">AD</div>
            <div className="sidebar-footer-info">
              <div className="sidebar-footer-name">Administrador</div>
              <div className="sidebar-footer-role">Sistema clínico</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <header className="topbar">
            <button className="btn-menu" onClick={() => setSidebarOpen((o) => !o)}>
              <Icon name="menu" size={20} />
            </button>
            <div className="topbar-breadcrumb">
              <span className="topbar-section">{currentSection}</span>
              <span className="topbar-sep">›</span>
              <span className="topbar-title">{currentView?.label}</span>
            </div>
            <div className="topbar-right">
              <div className="topbar-pulse">
                <div className="topbar-pulse-dot" />
                Sistema activo
              </div>
              <div className="topbar-date">{today}</div>
            </div>
          </header>

          <div className="content">
            {ActiveView && <ActiveView toast={showToast} />}
          </div>
        </main>

        {/* OVERLAY MOBILE */}
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(28,20,16,0.4)", zIndex: 99 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* TOAST */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}