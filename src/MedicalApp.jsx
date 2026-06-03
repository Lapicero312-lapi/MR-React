import { useState, useEffect, useCallback, useMemo } from "react";

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
    id:           (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>),
    phone:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.63a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>),
    mail:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>),
    calendar:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>),
    info:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
    hash:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>),
    location:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>),
    user:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),
    note:         (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>),
    tag:          (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>),
    license:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><path d="M9 15l2 2 4-4"/></svg>),
    birth:        (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 7V3"/><path d="M9 3h6"/></svg>),
    monitor:      (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>),
    trending:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>),
    activity:     (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>),
    filter:       (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>),
    x:            (<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  };
  return icons[name] || null;
};

// ─── DESIGN SYSTEM ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal:        #0F766E;
    --teal-deep:   #0C5F58;
    --teal-light:  #14877E;
    --teal-pale:   #E6F4F3;
    --teal-soft:   #C8E9E6;
    --teal-mid:    #5FB3AD;

    --navy:        #0F2942;
    --navy-med:    #1A3A55;
    --navy-light:  #254D6E;

    --cream:       #FAFCFC;
    --white:       #FFFFFF;
    --off:         #F3F7F7;
    --stone:       #E2ECEC;
    --stone-dark:  #C5D8D8;

    --ink:         #111E2A;
    --ink-med:     #2D4052;
    --ink-light:   #5A7080;
    --ink-ghost:   #8BA4B0;
    --ink-whisper: #B8CCCC;

    --success:     #0F766E;
    --success-bg:  #E6F4F3;
    --warn:        #92600A;
    --warn-bg:     #FEF3E2;
    --info:        #1D5FA6;
    --info-bg:     #EBF3FC;
    --danger:      #B91C1C;
    --danger-bg:   #FEF2F2;
    --danger-soft: #FECACA;

    --sidebar-w:   252px;
    --topbar-h:    60px;
    --radius:      10px;
    --radius-sm:   7px;
    --radius-lg:   14px;
    --shadow-sm:   0 1px 3px rgba(15,40,60,0.07), 0 1px 2px rgba(15,40,60,0.04);
    --shadow-md:   0 4px 12px rgba(15,40,60,0.09), 0 2px 4px rgba(15,40,60,0.05);
    --shadow-lg:   0 12px 32px rgba(15,40,60,0.13), 0 4px 8px rgba(15,40,60,0.06);
    --transition:  0.15s ease;
    --font-head:   'DM Serif Display', Georgia, serif;
    --font-body:   'DM Sans', system-ui, sans-serif;
  }

  html { font-size: 15px; }
  body {
    font-family: var(--font-body);
    background: var(--off);
    color: var(--ink);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  .app-shell { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--navy);
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
    height: 200px;
    background: linear-gradient(160deg, rgba(15,118,110,0.18) 0%, transparent 100%);
    pointer-events: none;
  }
  .sidebar.hidden { transform: translateX(-100%); }

  .sidebar-logo {
    padding: 22px 18px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .logo-mark { display: flex; align-items: center; gap: 11px; }
  .logo-icon {
    width: 38px; height: 38px;
    background: linear-gradient(135deg, var(--teal) 0%, var(--teal-light) 100%);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(15,118,110,0.4);
  }
  .logo-name {
    font-family: var(--font-head);
    font-size: 16px;
    font-weight: 400;
    color: #fff;
    letter-spacing: 0.2px;
    line-height: 1.1;
  }
  .logo-name span { color: var(--teal-mid); }
  .logo-sub {
    font-size: 9.5px;
    font-weight: 400;
    color: rgba(255,255,255,0.35);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 3px;
  }
  .logo-badge {
    font-size: 9px; font-weight: 600;
    background: rgba(15,118,110,0.3);
    color: var(--teal-mid);
    padding: 3px 8px;
    border-radius: 20px;
    letter-spacing: 0.5px;
    border: 1px solid rgba(15,118,110,0.4);
    flex-shrink: 0;
  }

  .sidebar-nav { flex: 1; padding: 14px 10px; overflow-y: auto; }
  .sidebar-nav::-webkit-scrollbar { width: 0; }

  .nav-section { margin-bottom: 2px; }
  .nav-section-label {
    font-size: 9px; font-weight: 600; letter-spacing: 2.2px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.22);
    padding: 12px 10px 5px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 9px;
    padding: 8px 11px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    color: rgba(255,255,255,0.5);
    font-size: 13px; font-weight: 400;
    transition: all var(--transition);
    border: none; background: none; width: 100%; text-align: left;
    position: relative;
  }
  .nav-item svg { opacity: 0.65; flex-shrink: 0; transition: opacity var(--transition); }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.82); }
  .nav-item:hover svg { opacity: 0.85; }
  .nav-item.active {
    background: rgba(15,118,110,0.25);
    color: #fff;
    font-weight: 500;
    border: 1px solid rgba(15,118,110,0.35);
  }
  .nav-item.active svg { opacity: 1; color: var(--teal-mid); }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 16px;
    background: var(--teal-mid);
    border-radius: 0 2px 2px 0;
  }

  .sidebar-footer {
    padding: 14px 16px;
    border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 10px;
    flex-shrink: 0;
  }
  .sidebar-footer-avatar {
    width: 30px; height: 30px;
    background: rgba(15,118,110,0.35);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--teal-mid); font-weight: 700;
    border: 1px solid rgba(15,118,110,0.5);
    flex-shrink: 0;
  }
  .sidebar-footer-info { flex: 1; min-width: 0; }
  .sidebar-footer-name {
    font-size: 12px; color: rgba(255,255,255,0.65);
    font-weight: 500;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sidebar-footer-role { font-size: 10px; color: rgba(255,255,255,0.28); }

  /* ── MAIN ── */
  .main { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; min-height: 100vh; }

  .topbar {
    height: var(--topbar-h);
    background: var(--white);
    border-bottom: 1px solid var(--stone);
    display: flex; align-items: center;
    padding: 0 24px; gap: 14px;
    position: sticky; top: 0; z-index: 50;
    box-shadow: var(--shadow-sm);
  }
  .topbar-breadcrumb { display: flex; align-items: center; gap: 7px; flex: 1; }
  .topbar-section { font-size: 12px; color: var(--ink-ghost); font-weight: 400; }
  .topbar-sep { color: var(--ink-whisper); font-size: 12px; }
  .topbar-title {
    font-family: var(--font-head);
    font-size: 15px; color: var(--ink);
    letter-spacing: -0.1px;
  }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .topbar-pulse { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--teal); font-weight: 500; }
  .topbar-pulse-dot {
    width: 7px; height: 7px;
    background: var(--teal);
    border-radius: 50%;
    animation: blink 2s ease infinite;
  }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .topbar-date { font-size: 12px; color: var(--ink-ghost); }
  .btn-menu {
    display: none; background: none; border: none;
    color: var(--ink-light); cursor: pointer;
    padding: 6px; border-radius: var(--radius-sm);
  }

  .content { padding: 26px; flex: 1; }

  /* ── PAGE HEADER ── */
  .page-header {
    margin-bottom: 22px;
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px;
  }
  .page-eyebrow {
    font-size: 10px; font-weight: 600;
    letter-spacing: 2.2px; text-transform: uppercase;
    color: var(--teal); margin-bottom: 4px;
  }
  .page-title {
    font-family: var(--font-head);
    font-size: 22px; color: var(--ink);
    letter-spacing: -0.3px; line-height: 1.2;
  }
  .page-subtitle { font-size: 12.5px; color: var(--ink-ghost); margin-top: 3px; font-weight: 400; }

  /* ── CARDS ── */
  .card {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--stone);
    background: var(--white);
  }
  .card-title { font-family: var(--font-head); font-size: 14px; color: var(--ink); letter-spacing: -0.1px; }
  .card-subtitle { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .card-body { padding: 20px; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 17px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 13px; font-weight: 500;
    cursor: pointer; border: none;
    transition: all var(--transition);
    letter-spacing: 0.1px; line-height: 1;
  }
  .btn-primary {
    background: var(--teal); color: #fff;
    box-shadow: 0 2px 6px rgba(15,118,110,0.3);
  }
  .btn-primary:hover {
    background: var(--teal-light);
    box-shadow: 0 4px 14px rgba(15,118,110,0.4);
    transform: translateY(-1px);
  }
  .btn-ghost {
    background: transparent; color: var(--ink-med);
    border: 1px solid var(--stone-dark);
  }
  .btn-ghost:hover { background: var(--off); color: var(--ink); }
  .btn-danger {
    background: var(--danger-bg); color: var(--danger);
    border: 1px solid var(--danger-soft);
  }
  .btn-danger:hover { background: #fee2e2; }
  .btn-success {
    background: var(--success-bg); color: var(--success);
    border: 1px solid var(--teal-soft);
  }
  .btn-success:hover { background: var(--teal-soft); }
  .btn-warn {
    background: var(--warn-bg); color: var(--warn);
    border: 1px solid #F6D88A;
  }
  .btn-warn:hover { background: #fde9b0; }
  .btn-outline {
    background: transparent; color: var(--teal);
    border: 1px solid var(--teal-mid);
  }
  .btn-outline:hover { background: var(--teal-pale); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-xs { padding: 4px 9px; font-size: 11px; border-radius: 5px; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  /* ── FORM ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .form-grid.cols-1 { grid-template-columns: 1fr; }
  .form-grid.cols-3 { grid-template-columns: 1fr 1fr 1fr; }
  .form-group { display: flex; flex-direction: column; gap: 5px; }
  .form-group.full { grid-column: 1 / -1; }

  label {
    font-size: 11px; font-weight: 600;
    color: var(--ink-light);
    letter-spacing: 0.8px; text-transform: uppercase;
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
    width: 100%; outline: none;
  }
  input:hover, select:hover { border-color: var(--teal-mid); }
  input:focus, select:focus, textarea:focus {
    border-color: var(--teal);
    background: var(--white);
    box-shadow: 0 0 0 3px rgba(15,118,110,0.1);
  }
  input::placeholder, textarea::placeholder { color: var(--ink-whisper); }
  select option { background: var(--white); }
  textarea { resize: vertical; min-height: 80px; }
  input:disabled, select:disabled { opacity: 0.55; cursor: not-allowed; background: var(--stone); }

  /* ── TABLES ── */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  thead { background: var(--cream); }
  th {
    text-align: left; padding: 10px 16px;
    color: var(--ink-light);
    font-size: 10px; font-weight: 600; letter-spacing: 1.2px;
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
  .td-primary { color: var(--ink); font-weight: 500; }
  .td-mono { font-family: 'SF Mono', 'Consolas', monospace; font-size: 12.5px; }

  tr.clickable-row { cursor: pointer; transition: background var(--transition); }
  tr.clickable-row:hover td { background: var(--teal-pale); }
  tr.clickable-row:hover .cell-avatar-primary { color: var(--teal-deep); }
  tr.clickable-row:hover .cell-avatar-secondary { color: var(--ink-light); }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .badge::before {
    content: ''; width: 5px; height: 5px;
    border-radius: 50%; background: currentColor; flex-shrink: 0;
  }
  .badge-green   { background: var(--success-bg); color: var(--teal-deep); }
  .badge-red     { background: var(--danger-bg);  color: var(--danger); }
  .badge-blue    { background: var(--info-bg);    color: var(--info); }
  .badge-warn    { background: var(--warn-bg);    color: var(--warn); }
  .badge-gray    { background: var(--stone);      color: var(--ink-light); }
  .badge-purple  { background: #F2EBF9;           color: #6B35A8; }
  .badge-teal    { background: var(--teal-pale);  color: var(--teal-deep); }
  .badge-no-dot::before { display: none; }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15,41,66,0.5);
    backdrop-filter: blur(3px);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .modal {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: var(--shadow-lg);
    animation: modalIn 0.18s ease;
  }
  .modal-lg { max-width: 720px; }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to { opacity: 1; transform: none; }
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 22px 16px;
    border-bottom: 1px solid var(--stone);
    background: var(--cream);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
  .modal-header-left { display: flex; align-items: center; gap: 11px; }
  .modal-icon {
    width: 34px; height: 34px;
    background: var(--teal-pale);
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    color: var(--teal); flex-shrink: 0;
  }
  .modal-title { font-family: var(--font-head); font-size: 15px; color: var(--ink); letter-spacing: -0.1px; }
  .modal-desc { font-size: 12px; color: var(--ink-ghost); margin-top: 2px; }
  .modal-body { padding: 22px; }
  .modal-footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 14px 22px;
    border-top: 1px solid var(--stone);
    background: var(--cream);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
  .btn-icon {
    background: none; border: none; cursor: pointer;
    color: var(--ink-ghost);
    padding: 6px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition);
  }
  .btn-icon:hover { background: var(--stone); color: var(--ink-med); }

  /* ── DETAIL DRAWER ── */
  .drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(15,41,66,0.4);
    backdrop-filter: blur(2px);
    z-index: 300;
    display: flex; align-items: stretch; justify-content: flex-end;
  }
  .drawer {
    background: var(--white);
    width: 420px; max-width: 100vw;
    height: 100vh; overflow-y: auto;
    box-shadow: -8px 0 40px rgba(15,41,66,0.15);
    animation: drawerIn 0.22s ease;
    display: flex; flex-direction: column;
  }
  @keyframes drawerIn {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: none; }
  }
  .drawer-hero {
    padding: 26px 22px 22px;
    background: linear-gradient(135deg, var(--navy) 0%, var(--navy-med) 100%);
    color: white;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }
  .drawer-hero::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 120px; height: 120px;
    background: rgba(15,118,110,0.12);
    border-radius: 50%;
  }
  .drawer-hero::after {
    content: '';
    position: absolute;
    bottom: -20px; left: 40px;
    width: 80px; height: 80px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
  }
  .drawer-close {
    position: absolute; top: 14px; right: 14px;
    background: rgba(255,255,255,0.1);
    border: none; cursor: pointer;
    color: rgba(255,255,255,0.75);
    padding: 6px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    transition: all var(--transition); z-index: 2;
  }
  .drawer-close:hover { background: rgba(255,255,255,0.2); color: white; }
  .drawer-avatar-lg {
    width: 60px; height: 60px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-head); font-size: 20px;
    margin-bottom: 12px; position: relative; z-index: 2;
  }
  .drawer-avatar-teal  { background: rgba(15,118,110,0.3); color: var(--teal-mid); border: 2px solid rgba(15,118,110,0.5); }
  .drawer-avatar-blue  { background: rgba(29,95,166,0.3);  color: #90C0F0;         border: 2px solid rgba(29,95,166,0.5); }
  .drawer-name { font-family: var(--font-head); font-size: 17px; color: white; position: relative; z-index: 2; margin-bottom: 3px; }
  .drawer-sub  { font-size: 12px; color: rgba(255,255,255,0.5); position: relative; z-index: 2; }
  .drawer-hero-badge {
    display: inline-flex; align-items: center; gap: 4px;
    margin-top: 10px; padding: 4px 11px;
    border-radius: 20px; font-size: 11px; font-weight: 600;
    position: relative; z-index: 2;
  }
  .drawer-hero-badge.active    { background: rgba(15,118,110,0.28); color: #6FD9CF; border: 1px solid rgba(15,118,110,0.45); }
  .drawer-hero-badge.inactive  { background: rgba(185,28,28,0.25);  color: #FCA5A5; border: 1px solid rgba(185,28,28,0.4); }
  .drawer-hero-badge.scheduled { background: rgba(29,95,166,0.28);  color: #93C5FD; border: 1px solid rgba(29,95,166,0.45); }
  .drawer-hero-badge.confirmed { background: rgba(15,118,110,0.28); color: #6FD9CF; border: 1px solid rgba(15,118,110,0.45); }
  .drawer-hero-badge.cancelled { background: rgba(185,28,28,0.3);   color: #FCA5A5; border: 1px solid rgba(185,28,28,0.5); }
  .drawer-hero-badge.completed { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.2); }
  .drawer-hero-badge.noshow    { background: rgba(146,96,10,0.28);  color: #FCD34D; border: 1px solid rgba(146,96,10,0.45); }
  .drawer-body { padding: 22px; flex: 1; }

  .detail-section { margin-bottom: 22px; }
  .detail-section-title {
    font-size: 9.5px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: var(--ink-ghost);
    margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
  }
  .detail-section-title::after { content: ''; flex: 1; height: 1px; background: var(--stone); }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
  .detail-grid.cols-1 { grid-template-columns: 1fr; }
  .detail-item {
    background: var(--cream);
    border: 1px solid var(--stone);
    border-radius: var(--radius-sm);
    padding: 11px 13px;
    transition: box-shadow var(--transition);
  }
  .detail-item:hover { box-shadow: var(--shadow-sm); }
  .detail-item.full { grid-column: 1 / -1; }
  .detail-item-label {
    font-size: 9.5px; font-weight: 600; letter-spacing: 0.8px;
    text-transform: uppercase; color: var(--ink-ghost);
    margin-bottom: 5px;
    display: flex; align-items: center; gap: 5px;
  }
  .detail-item-label svg { opacity: 0.6; }
  .detail-item-value { font-size: 13px; color: var(--ink); font-weight: 500; word-break: break-all; }
  .detail-item-value.mono { font-family: 'SF Mono', 'Consolas', monospace; font-size: 11.5px; }
  .detail-item-value.muted { color: var(--ink-ghost); font-weight: 400; font-style: italic; }

  .drawer-related {
    background: var(--off); border: 1px solid var(--stone);
    border-radius: var(--radius); padding: 14px;
    margin-bottom: 12px;
  }
  .drawer-related-title { font-size: 11px; font-weight: 600; color: var(--ink-light); margin-bottom: 9px; display: flex; align-items: center; gap: 6px; }
  .drawer-related-row { display: flex; align-items: center; gap: 10px; }
  .drawer-related-info { flex: 1; }
  .drawer-related-name { font-size: 13px; font-weight: 600; color: var(--ink); }
  .drawer-related-detail { font-size: 11px; color: var(--ink-ghost); margin-top: 2px; }
  .drawer-id-pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: var(--stone); border-radius: 20px;
    padding: 2px 9px;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 10px; color: var(--ink-light);
  }

  /* ── STATS GRID ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px; margin-bottom: 22px;
  }
  .stat-card {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    padding: 18px 20px;
    box-shadow: var(--shadow-sm);
    position: relative; overflow: hidden;
  }
  .stat-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 4px; height: 100%;
  }
  .stat-card.teal::after  { background: var(--teal); }
  .stat-card.green::after { background: var(--success); }
  .stat-card.blue::after  { background: var(--info); }
  .stat-card.amber::after { background: var(--warn); }
  .stat-icon-wrap {
    width: 36px; height: 36px;
    border-radius: var(--radius-sm);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
  }
  .stat-icon-wrap.teal  { background: var(--teal-pale);  color: var(--teal); }
  .stat-icon-wrap.green { background: var(--success-bg); color: var(--teal); }
  .stat-icon-wrap.blue  { background: var(--info-bg);    color: var(--info); }
  .stat-icon-wrap.amber { background: var(--warn-bg);    color: var(--warn); }
  .stat-value {
    font-family: var(--font-head);
    font-size: 26px; color: var(--ink);
    line-height: 1; letter-spacing: -0.5px;
    margin-bottom: 5px;
  }
  .stat-label { font-size: 12px; font-weight: 500; color: var(--ink-light); }
  .stat-delta { font-size: 11px; color: var(--ink-ghost); margin-top: 3px; }

  /* ── ALERTS ── */
  .alert {
    padding: 11px 14px; border-radius: var(--radius-sm);
    font-size: 13px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
    border-left: 3px solid transparent;
  }
  .alert-success { background: var(--success-bg); border-left-color: var(--teal);   color: var(--teal-deep); }
  .alert-error   { background: var(--danger-bg);  border-left-color: var(--danger);  color: var(--danger); }
  .alert-info    { background: var(--info-bg);    border-left-color: var(--info);    color: var(--info); }

  /* ── AVAILABILITY SLOTS ── */
  .avail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 8px; margin-top: 12px;
  }
  .avail-slot {
    background: var(--success-bg);
    border: 1px solid var(--teal-soft);
    border-radius: var(--radius-sm);
    padding: 10px; font-size: 12px;
    color: var(--teal-deep); text-align: center;
    cursor: pointer; transition: all var(--transition);
  }
  .avail-slot:hover { background: var(--teal-soft); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
  .avail-slot.selected {
    background: var(--teal); border-color: var(--teal);
    color: #fff; box-shadow: 0 4px 10px rgba(15,118,110,0.35);
  }
  .avail-slot-time { font-weight: 700; font-size: 14px; }
  .avail-slot-label { opacity: 0.7; font-size: 10.5px; margin-top: 2px; }

  /* ── TABS ── */
  .tab-list {
    display: flex; gap: 2px;
    border-bottom: 1px solid var(--stone);
    margin-bottom: 22px;
  }
  .tab {
    padding: 9px 16px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; background: none;
    color: var(--ink-ghost);
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all var(--transition); font-family: var(--font-body);
  }
  .tab.active { color: var(--teal); border-bottom-color: var(--teal); font-weight: 600; }
  .tab:hover:not(.active) { color: var(--ink-med); }

  /* ── STEP INDICATOR ── */
  .step-indicator {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 22px;
  }
  .step { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 500; color: var(--ink-ghost); }
  .step.active { color: var(--teal); }
  .step.done   { color: var(--teal-deep); }
  .step-num {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--stone); border: 1px solid var(--stone-dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
  }
  .step.active .step-num { background: var(--teal-pale); border-color: var(--teal-mid); color: var(--teal); }
  .step.done   .step-num { background: var(--success-bg); border-color: var(--teal-soft); color: var(--teal-deep); }
  .step-divider { flex: 1; height: 1px; background: var(--stone); max-width: 40px; }

  .info-box {
    background: var(--info-bg);
    border: 1px solid #BFDBFE; border-left: 3px solid var(--info);
    border-radius: var(--radius-sm);
    padding: 11px 13px; font-size: 13px; color: var(--info);
    margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
  }

  /* ── SCHEDULE CARDS ── */
  .schedule-day-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 11px; margin-top: 4px;
  }
  .schedule-day-card {
    background: var(--cream); border: 1px solid var(--stone);
    border-radius: var(--radius);
    padding: 13px 15px;
    transition: box-shadow var(--transition);
  }
  .schedule-day-card:hover { box-shadow: var(--shadow-sm); }
  .schedule-day-name {
    font-family: var(--font-head);
    font-size: 12px; color: var(--teal);
    text-transform: uppercase; letter-spacing: 1px;
    margin-bottom: 8px;
  }
  .schedule-day-time { font-size: 13px; color: var(--ink-med); display: flex; align-items: center; gap: 6px; }

  .actions-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }

  .empty-state { text-align: center; padding: 50px 20px; color: var(--ink-ghost); }
  .empty-state-icon {
    width: 50px; height: 50px; background: var(--stone); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; color: var(--ink-whisper);
  }
  .empty-state-title { font-size: 14px; font-weight: 500; color: var(--ink-light); margin-bottom: 6px; }
  .empty-state p { font-size: 13px; }

  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2.5px solid var(--stone); border-top-color: var(--teal);
    animation: spin 0.75s linear infinite;
    margin: 44px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .report-card {
    background: var(--white); border: 1px solid var(--stone);
    border-radius: var(--radius-lg); overflow: hidden;
    margin-bottom: 18px; box-shadow: var(--shadow-sm);
  }
  .report-header {
    padding: 14px 20px; background: var(--cream);
    border-bottom: 1px solid var(--stone);
    display: flex; align-items: center; gap: 10px;
  }
  .report-icon { color: var(--teal); }
  .report-title { font-family: var(--font-head); font-size: 14px; color: var(--ink); }
  .report-body { padding: 18px 20px; }

  button.badge { cursor: pointer; border: none; transition: all var(--transition); }
  button.badge:hover { filter: brightness(0.94); }

  .divider { height: 1px; background: var(--stone); margin: 18px 0; }

  /* ── AVATARS ── */
  .avatar {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0;
    font-family: var(--font-head);
  }
  .avatar-teal  { background: var(--teal-pale); color: var(--teal-deep); }
  .avatar-blue  { background: var(--info-bg);   color: var(--info); }
  .avatar-green { background: var(--success-bg); color: var(--teal-deep); }

  .cell-with-avatar { display: flex; align-items: center; gap: 10px; }
  .cell-avatar-stack { display: flex; flex-direction: column; gap: 1px; line-height: 1; }
  .cell-avatar-primary  { font-size: 13.5px; font-weight: 500; color: var(--ink); }
  .cell-avatar-secondary { font-size: 11px; color: var(--ink-ghost); margin-top: 2px; }

  .toast {
    position: fixed; bottom: 22px; right: 22px; z-index: 999;
    min-width: 280px; max-width: 380px;
    padding: 13px 17px; border-radius: var(--radius);
    display: flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 500;
    box-shadow: var(--shadow-lg);
    animation: toastIn 0.2s ease;
    border: 1px solid transparent;
  }
  @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  .toast-success { background: #fff; border-color: var(--teal-soft); color: var(--teal-deep); }
  .toast-error   { background: #fff; border-color: var(--danger-soft); color: var(--danger); }
  .toast-icon { flex-shrink: 0; }

  .section-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0 14px; }
  .section-divider-label { font-size: 10.5px; font-weight: 600; color: var(--ink-ghost); text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; }
  .section-divider-line { flex: 1; height: 1px; background: var(--stone); }

  /* ── FILTER BAR ── */
  .filter-bar {
    display: flex; gap: 10px; flex-wrap: wrap; align-items: flex-end;
    padding: 14px 20px;
    border-bottom: 1px solid var(--stone);
    background: var(--cream);
  }
  .filter-bar .form-group { margin: 0; }
  .filter-search-wrap { position: relative; flex: 1; min-width: 220px; }
  .filter-search-wrap input { padding-left: 36px; }
  .filter-search-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    color: var(--ink-whisper); pointer-events: none;
    display: flex; align-items: center;
  }
  .filter-tag {
    display: inline-flex; align-items: center; gap: 5px;
    background: var(--teal-pale); color: var(--teal-deep);
    border: 1px solid var(--teal-soft);
    border-radius: 20px; padding: 3px 10px 3px 10px;
    font-size: 11px; font-weight: 600;
  }
  .filter-tag-close {
    background: none; border: none; cursor: pointer;
    color: var(--teal); padding: 0; display: flex;
    align-items: center; opacity: 0.7;
  }
  .filter-tag-close:hover { opacity: 1; }
  .filter-result-count {
    font-size: 11px; color: var(--ink-ghost);
    display: flex; align-items: center; gap: 5px;
    white-space: nowrap; align-self: flex-end; padding-bottom: 2px;
  }

  /* ── CHARTS ── */
  .charts-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 22px;
  }
  .chart-card {
    background: var(--white);
    border: 1px solid var(--stone);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
  }
  .chart-title {
    font-family: var(--font-head);
    font-size: 13px; color: var(--ink);
    margin-bottom: 4px;
  }
  .chart-subtitle { font-size: 11px; color: var(--ink-ghost); margin-bottom: 18px; }
  .chart-legend { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 14px; }
  .chart-legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-light); }
  .chart-legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }
  .bar-chart-wrap { display: flex; align-items: flex-end; gap: 6px; height: 140px; }
  .bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
  .bar-val { font-size: 10px; font-weight: 600; color: var(--ink-light); }
  .bar-inner { width: 100%; border-radius: 4px 4px 0 0; transition: all 0.4s ease; min-height: 4px; }
  .bar-label { font-size: 10px; color: var(--ink-ghost); white-space: nowrap; }
  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .status-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .status-bar-label { font-size: 11px; color: var(--ink-light); width: 90px; flex-shrink: 0; }
  .status-bar-track { flex: 1; height: 8px; background: var(--stone); border-radius: 4px; overflow: hidden; }
  .status-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }
  .status-bar-count { font-size: 11px; font-weight: 600; color: var(--ink); min-width: 24px; text-align: right; }

  @media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr; } }
  @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 900px) {
    .main { margin-left: 0; }
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .btn-menu { display: flex; }
    .form-grid { grid-template-columns: 1fr; }
    .form-grid.cols-3 { grid-template-columns: 1fr 1fr; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .drawer { width: 100vw; }
    .detail-grid { grid-template-columns: 1fr; }
    .filter-bar { flex-direction: column; }
    .charts-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 580px) {
    .stats-grid { grid-template-columns: 1fr; }
    .content { padding: 14px; }
  }
`;

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DOC_TYPES = ["CC","TI","CE","PASAPORTE","NIT"];
const DAYS = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"];
const DAY_ES = { MONDAY:"Lunes",TUESDAY:"Martes",WEDNESDAY:"Miércoles",THURSDAY:"Jueves",FRIDAY:"Viernes",SATURDAY:"Sábado",SUNDAY:"Domingo" };
const DAY_SHORT = { MONDAY:"Lun",TUESDAY:"Mar",WEDNESDAY:"Mié",THURSDAY:"Jue",FRIDAY:"Vie",SATURDAY:"Sáb",SUNDAY:"Dom" };

const norm = (s) => (s ?? "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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

// ─── FILTER BAR ───────────────────────────────────────────────────────────────
function FilterBar({ search, onSearch, placeholder = "Buscar…", filters = [], total, filtered: filteredCount }) {
  const hasFilters = search || filters.some(f => f.value && f.value !== "all");
  return (
    <div className="filter-bar">
      <div className="filter-search-wrap">
        <div className="filter-search-icon"><Icon name="search" size={15} /></div>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {filters.map((flt) => (
        <div className="form-group" key={flt.key} style={{ minWidth: 160, gap: 5 }}>
          <label>{flt.label}</label>
          <select value={flt.value} onChange={(e) => flt.onChange(e.target.value)}>
            {flt.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      ))}
      {hasFilters && (
        <div className="filter-result-count">
          <Icon name="filter" size={11} />
          {filteredCount} de {total}
        </div>
      )}
    </div>
  );
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

function DataTable({ columns, rows, loading, emptyMsg = "Sin registros", emptyIcon = "search", onRowClick }) {
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
            <tr
              key={row.id ?? i}
              className={onRowClick ? "clickable-row" : ""}
              onClick={onRowClick ? (e) => { if (e.target.closest("button")) return; onRowClick(row); } : undefined}
            >
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
      <span className="toast-icon"><Icon name={type === "success" ? "check" : "warning"} size={16} /></span>
      {msg}
    </div>
  );
}

function Initials({ name, variant = "teal", size = "sm" }) {
  const parts = (name || "?").trim().split(" ");
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0]?.slice(0, 2) ?? "?";
  if (size === "lg") {
    return <div className={`drawer-avatar-lg drawer-avatar-${variant}`}>{init.toUpperCase()}</div>;
  }
  return <div className={`avatar avatar-${variant}`}>{init.toUpperCase()}</div>;
}

function DetailItem({ label, value, icon, mono, full, muted }) {
  return (
    <div className={`detail-item ${full ? "full" : ""}`}>
      <div className="detail-item-label">
        {icon && <Icon name={icon} size={11} />}
        {label}
      </div>
      <div className={`detail-item-value ${mono ? "mono" : ""} ${muted && !value ? "muted" : ""}`}>
        {value || (muted ? "Sin información" : "—")}
      </div>
    </div>
  );
}

// ─── CHARTS ───────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  SCHEDULED: "#1D5FA6",
  CONFIRMED: "#0F766E",
  COMPLETED: "#5A7080",
  CANCELLED: "#B91C1C",
  NO_SHOW:   "#92600A",
};
const STATUS_LABELS = {
  SCHEDULED: "Programada",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW:   "No asistió",
};

function BarChart({ data, colorFn, labelKey, valueKey }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="bar-chart-wrap">
      {data.map((d, i) => {
        const val = d[valueKey] || 0;
        const height = Math.max((val / max) * 120, val > 0 ? 6 : 0);
        return (
          <div className="bar-group" key={i}>
            <div className="bar-val">{val > 0 ? val : ""}</div>
            <div style={{ width: "100%", display: "flex", alignItems: "flex-end", flex: 1, justifyContent: "center" }}>
              <div
                className="bar-inner"
                style={{ height, background: colorFn ? colorFn(d, i) : "var(--teal)", width: "100%", maxWidth: 40 }}
                title={`${d[labelKey]}: ${val}`}
              />
            </div>
            <div className="bar-label">{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatusDistChart({ appointments }) {
  const counts = useMemo(() => {
    const c = {};
    (appointments || []).forEach(a => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [appointments]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const statuses = ["CONFIRMED","SCHEDULED","COMPLETED","CANCELLED","NO_SHOW"];
  return (
    <div>
      {statuses.map(s => {
        const count = counts[s] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div className="status-bar-row" key={s}>
            <div className="status-bar-label">{STATUS_LABELS[s]}</div>
            <div className="status-bar-track">
              <div className="status-bar-fill" style={{ width: `${pct}%`, background: STATUS_COLORS[s] }} />
            </div>
            <div className="status-bar-count">{count}</div>
          </div>
        );
      })}
    </div>
  );
}

function WeeklyChart({ appointments }) {
  const data = useMemo(() => {
    const counts = {};
    DAYS.forEach(d => { counts[d] = 0; });
    (appointments || []).forEach(a => {
      if (!a.date) return;
      const dow = new Date(a.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
      if (counts[dow] !== undefined) counts[dow]++;
    });
    return DAYS.map(d => ({ day: DAY_SHORT[d], count: counts[d] }));
  }, [appointments]);
  const tealGrad = (_, i) => {
    const opacity = 0.45 + (i / DAYS.length) * 0.55;
    return `rgba(15,118,110,${opacity})`;
  };
  return <BarChart data={data} colorFn={tealGrad} labelKey="day" valueKey="count" />;
}

function DoctorProductivityChart({ appointments, doctors }) {
  const data = useMemo(() => {
    const counts = {};
    (appointments || []).filter(a => a.status === "COMPLETED").forEach(a => {
      counts[a.doctorId] = (counts[a.doctorId] || 0) + 1;
    });
    return (doctors || [])
      .map(d => ({ name: d.fullName?.split(" ")[0] ?? "—", count: counts[d.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [appointments, doctors]);
  return <BarChart data={data} colorFn={(_, i) => i === 0 ? "var(--teal)" : `rgba(15,118,110,${0.35 + (1 - i / 7) * 0.45})`} labelKey="name" valueKey="count" />;
}

function DonutChart({ appointments }) {
  const counts = useMemo(() => {
    const c = {};
    (appointments || []).forEach(a => { c[a.status] = (c[a.status] || 0) + 1; });
    return c;
  }, [appointments]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const statuses = Object.keys(STATUS_COLORS);
  const R = 50, cx = 70, cy = 70, strokeW = 18;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const segments = statuses.map(s => {
    const count = counts[s] || 0;
    const pct = count / total;
    const dash = pct * circumference;
    const seg = { s, count, pct, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <div className="donut-wrap" style={{ flexWrap: "wrap" }}>
      <svg width={140} height={140} style={{ flexShrink: 0 }}>
        {segments.map(({ s, dash, offset: off }) => (
          <circle
            key={s}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={STATUS_COLORS[s]}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={circumference / 4 - off}
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontFamily="var(--font-head)" fill="var(--ink)" fontWeight="400">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--ink-ghost)" fontFamily="var(--font-body)">total</text>
      </svg>
      <div className="chart-legend" style={{ flexDirection: "column", gap: 7 }}>
        {segments.filter(s => s.count > 0).map(({ s, count, pct }) => (
          <div className="chart-legend-item" key={s}>
            <div className="chart-legend-dot" style={{ background: STATUS_COLORS[s] }} />
            <span>{STATUS_LABELS[s]}</span>
            <span style={{ marginLeft: "auto", fontWeight: 600, color: "var(--ink)", paddingLeft: 8 }}>{count}</span>
            <span style={{ color: "var(--ink-whisper)", fontSize: 10, paddingLeft: 4 }}>{Math.round(pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PATIENT DETAIL DRAWER ────────────────────────────────────────────────────
function PatientDrawer({ patient, onClose }) {
  if (!patient) return null;
  return (
    <div className="drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-hero">
          <button className="drawer-close" onClick={onClose}><Icon name="close" size={15} /></button>
          <Initials name={patient.fullName} variant="teal" size="lg" />
          <div className="drawer-name">{patient.fullName}</div>
          <div className="drawer-sub">{patient.email}</div>
          <div className={`drawer-hero-badge ${patient.active ? "active" : "inactive"}`}>
            {patient.active ? "Paciente activo" : "Paciente inactivo"}
          </div>
        </div>
        <div className="drawer-body">
          <div className="detail-section">
            <div className="detail-section-title">Información personal</div>
            <div className="detail-grid">
              <DetailItem label="Nombre completo" value={patient.fullName} icon="user" full />
              <DetailItem label="Tipo de documento" value={patient.documentType} icon="id" />
              <DetailItem label="Número de documento" value={patient.documentNumber} icon="hash" mono />
              <DetailItem label="Fecha de nacimiento" value={patient.birthDay || patient.birthDate} icon="birth" muted />
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Contacto</div>
            <div className="detail-grid">
              <DetailItem label="Correo electrónico" value={patient.email} icon="mail" full />
              <DetailItem label="Teléfono" value={patient.phoneNumber} icon="phone" />
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Sistema</div>
            <div className="detail-grid">
              <DetailItem label="ID del paciente" value={patient.id} icon="hash" mono full />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DOCTOR DETAIL DRAWER ─────────────────────────────────────────────────────
function DoctorDrawer({ doctor, specialties, onClose }) {
  if (!doctor) return null;
  const specName = (specialties || []).find((s) => s.id === doctor.specialtyId)?.name ?? "—";
  const specDesc = (specialties || []).find((s) => s.id === doctor.specialtyId)?.description;
  return (
    <div className="drawer-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div className="drawer-hero">
          <button className="drawer-close" onClick={onClose}><Icon name="close" size={15} /></button>
          <Initials name={doctor.fullName} variant="blue" size="lg" />
          <div className="drawer-name">{doctor.fullName}</div>
          <div className="drawer-sub">{doctor.email}</div>
          <div className={`drawer-hero-badge ${doctor.active ? "active" : "inactive"}`}>
            {doctor.active ? "Médico activo" : "Médico inactivo"}
          </div>
        </div>
        <div className="drawer-body">
          <div className="detail-section">
            <div className="detail-section-title">Especialidad</div>
            <div className="drawer-related">
              <div className="drawer-related-row">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: "#F2EBF9", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B35A8", flexShrink: 0 }}>
                  <Icon name="specialties" size={17} />
                </div>
                <div className="drawer-related-info">
                  <div className="drawer-related-name">{specName}</div>
                  {specDesc && <div className="drawer-related-detail">{specDesc}</div>}
                  <div style={{ marginTop: 4 }}><span className="drawer-id-pill"><Icon name="hash" size={9} /> {doctor.specialtyId}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Información profesional</div>
            <div className="detail-grid">
              <DetailItem label="Nombre completo" value={doctor.fullName} icon="user" full />
              <DetailItem label="Número de licencia" value={doctor.numberLicense ?? doctor.licenseNumber} icon="license" mono />
              <DetailItem label="Tipo de documento" value={doctor.documentType} icon="id" />
              <DetailItem label="Número de documento" value={doctor.documentNumber} icon="hash" mono />
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Contacto</div>
            <div className="detail-grid">
              <DetailItem label="Correo electrónico" value={doctor.email} icon="mail" full />
              <DetailItem label="Teléfono" value={doctor.phoneNumber} icon="phone" />
            </div>
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Sistema</div>
            <div className="detail-grid">
              <DetailItem label="ID del médico" value={doctor.id} icon="hash" mono full />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APPOINTMENT DETAIL DRAWER ────────────────────────────────────────────────
function AppointmentDrawer({ appointment, patients, doctors, offices, apptypes, onClose }) {
  if (!appointment) return null;
  const patient = (patients || []).find((p) => p.id === appointment.patientId);
  const doctor  = (doctors  || []).find((d) => d.id === appointment.doctorId);
  const office  = (offices  || []).find((o) => o.id === appointment.officeId);
  const apptype = (apptypes || []).find((t) => t.id === appointment.appointmentTypeId);
  const statusConfig = {
    SCHEDULED: { label: "Programada",  cls: "scheduled" },
    CONFIRMED: { label: "Confirmada",  cls: "confirmed" },
    CANCELLED: { label: "Cancelada",   cls: "cancelled" },
    COMPLETED: { label: "Completada",  cls: "completed" },
    NO_SHOW:   { label: "No asistió",  cls: "noshow" },
  };
  const sc = statusConfig[appointment.status] ?? { label: appointment.status, cls: "scheduled" };
  return (
    <div className="drawer-overlay" onClick={(e) => e.target === e.currentElement && onClose()}>
      <div className="drawer">
        <div className="drawer-hero">
          <button className="drawer-close" onClick={onClose}><Icon name="close" size={15} /></button>
          <div style={{ width: 52, height: 52, borderRadius: 13, background: "rgba(15,118,110,0.2)", border: "2px solid rgba(15,118,110,0.4)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, position: "relative", zIndex: 2, color: "var(--teal-mid)" }}>
            <Icon name="appointments" size={24} />
          </div>
          <div className="drawer-name">Cita médica</div>
          <div className="drawer-sub">{appointment.date} · {appointment.startAt ?? appointment.startsAt ?? "—"}</div>
          <div className={`drawer-hero-badge ${sc.cls}`}>{sc.label}</div>
        </div>
        <div className="drawer-body">
          <div className="detail-section">
            <div className="detail-section-title">Paciente</div>
            {patient ? (
              <div className="drawer-related">
                <div className="drawer-related-row">
                  <Initials name={patient.fullName} variant="teal" />
                  <div className="drawer-related-info">
                    <div className="drawer-related-name">{patient.fullName}</div>
                    <div className="drawer-related-detail">{patient.email} · {patient.phoneNumber ?? "—"}</div>
                    <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="drawer-id-pill"><Icon name="id" size={9} /> {patient.documentType} {patient.documentNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <DetailItem label="ID del paciente" value={appointment.patientId} icon="hash" mono full />
            )}
          </div>
          <div className="detail-section">
            <div className="detail-section-title">Médico tratante</div>
            {doctor ? (
              <div className="drawer-related">
                <div className="drawer-related-row">
                  <Initials name={doctor.fullName} variant="blue" />
                  <div className="drawer-related-info">
                    <div className="drawer-related-name">{doctor.fullName}</div>
                    <div className="drawer-related-detail">{doctor.email} · Lic. {doctor.numberLicense ?? doctor.licenseNumber ?? "—"}</div>
                  </div>
                </div>
              </div>
            ) : (
              <DetailItem label="ID del médico" value={appointment.doctorId} icon="hash" mono full />
            )}
          </div>
          {office && (
            <div className="detail-section">
              <div className="detail-section-title">Consultorio</div>
              <div className="drawer-related">
                <div className="drawer-related-row">
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--info-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--info)", flexShrink: 0 }}>
                    <Icon name="offices" size={17} />
                  </div>
                  <div className="drawer-related-info">
                    <div className="drawer-related-name">{office.name}</div>
                    <div className="drawer-related-detail">{office.location ?? "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="detail-section">
            <div className="detail-section-title">Fecha y hora</div>
            <div className="detail-grid">
              <DetailItem label="Fecha" value={appointment.date} icon="calendar" />
              <DetailItem label="Hora inicio" value={appointment.startAt ?? appointment.startsAt} icon="clock" mono />
              <DetailItem label="Hora fin" value={appointment.endAt ?? appointment.endsAt} icon="clock" mono muted />
              {apptype && <DetailItem label="Tipo de cita" value={`${apptype.name} (${apptype.durationMinutes} min)`} icon="apptypes" />}
            </div>
          </div>
          {appointment.observations && (
            <div className="detail-section">
              <div className="detail-section-title">Observaciones</div>
              <div className="detail-grid cols-1">
                <DetailItem label="Notas" value={appointment.observations} icon="note" full muted />
              </div>
            </div>
          )}
          {appointment.status === "CANCELLED" && appointment.cancelReason && (
            <div className="detail-section">
              <div className="detail-section-title">Motivo de cancelación</div>
              <div className="detail-grid cols-1">
                <div className="detail-item full" style={{ borderColor: "#FCA5A5", background: "var(--danger-bg)" }}>
                  <div className="detail-item-label" style={{ color: "var(--danger)" }}><Icon name="warning" size={11} /> Razón</div>
                  <div className="detail-item-value">{appointment.cancelReason}</div>
                </div>
              </div>
            </div>
          )}
          <div className="detail-section">
            <div className="detail-section-title">Sistema</div>
            <div className="detail-grid cols-1">
              <DetailItem label="ID de la cita" value={appointment.id} icon="hash" mono full />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
function PatientsView({ toast }) {
  const { data, loading, reload } = useData(() => api.get("/patients"));
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [drawerPatient, setDrawerPatient] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter((r) => {
    const q = norm(search);
    const matchSearch = !q || norm(r.fullName).includes(q) || norm(r.email).includes(q) || norm(r.documentNumber).includes(q) || norm(r.phoneNumber).includes(q);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.active : !r.active);
    return matchSearch && matchStatus;
  }), [allData, search, statusFilter]);

  const cols = [
    { key: "fullName", label: "Paciente", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={r.fullName} variant="teal" />
        <div className="cell-avatar-stack">
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
      <button className={`badge ${r.active ? "badge-green" : "badge-red"}`}
        style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }}
        disabled={togglingId === r.id} onClick={() => handleToggleActive(r)} title="Clic para cambiar estado">
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
        <div>
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Pacientes</div>
          <div className="page-subtitle">Haz clic en una fila para ver el detalle completo</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}>
          <Icon name="plus" size={14} /> Nuevo paciente
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Listado de pacientes</div>
            <div className="card-subtitle">{filtered.length} de {allData.length} registros</div>
          </div>
        </div>
        <FilterBar
          search={search} onSearch={setSearch}
          placeholder="Nombre, correo, documento o teléfono…"
          total={allData.length} filtered={filtered.length}
          filters={[{
            key: "status", label: "Estado", value: statusFilter, onChange: setStatusFilter,
            options: [{ value: "all", label: "Todos los estados" }, { value: "active", label: "Activos" }, { value: "inactive", label: "Inactivos" }],
          }]}
        />
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay pacientes que coincidan" emptyIcon="patients" onRowClick={(r) => setDrawerPatient(r)} />
      </div>
      {drawerPatient && <PatientDrawer patient={drawerPatient} onClose={() => setDrawerPatient(null)} />}
      {(modal === "create" || modal === "edit") && (
        <Modal title={modal === "create" ? "Nuevo paciente" : "Editar paciente"} desc={modal === "create" ? "Complete los datos del nuevo paciente" : "Actualice la información"} icon="patients" onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
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
  const [drawerDoctor, setDrawerDoctor] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [search, setSearch] = useState("");
  const [specFilter, setSpecFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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
      toast(`Médico ${!r.active ? "activado" : "inactivado"}`, "success"); reload();
    } catch (e) { toast(e.message || "Error", "error"); }
    finally { setTogglingId(null); }
  };

  const getSpecName = (id) => (specs || []).find((s) => s.id === id)?.name ?? "—";
  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter((r) => {
    const q = norm(search);
    const matchSearch = !q || norm(r.fullName).includes(q) || norm(r.email).includes(q) || norm(r.documentNumber).includes(q) || norm(r.numberLicense ?? r.licenseNumber).includes(q);
    const matchSpec = specFilter === "all" || r.specialtyId === specFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.active : !r.active);
    return matchSearch && matchSpec && matchStatus;
  }), [allData, search, specFilter, statusFilter]);

  const cols = [
    { key: "fullName", label: "Médico", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={r.fullName} variant="blue" />
        <div className="cell-avatar-stack">
          <div className="cell-avatar-primary">{r.fullName}</div>
          <div className="cell-avatar-secondary">{r.email}</div>
        </div>
      </div>
    )},
    { key: "specialtyId", label: "Especialidad", render: (r) => <span className="badge badge-no-dot badge-purple">{getSpecName(r.specialtyId)}</span> },
    { key: "documentNumber", label: "Documento", render: (r) => r.documentNumber ? <span className="td-mono">{r.documentType} {r.documentNumber}</span> : "—" },
    { key: "licenseNumber", label: "Licencia", render: (r) => <span className="td-mono">{r.numberLicense ?? r.licenseNumber ?? "—"}</span> },
    { key: "active", label: "Estado", render: (r) => (
      <button className={`badge ${r.active ? "badge-green" : "badge-red"}`}
        style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }}
        disabled={togglingId === r.id} onClick={() => handleToggleActive(r)} title="Clic para cambiar estado">
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
        <div>
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Médicos</div>
          <div className="page-subtitle">Haz clic en una fila para ver el detalle completo</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}>
          <Icon name="plus" size={14} /> Nuevo médico
        </button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Listado de médicos</div>
            <div className="card-subtitle">{filtered.length} de {allData.length} registros</div>
          </div>
        </div>
        <FilterBar
          search={search} onSearch={setSearch}
          placeholder="Nombre, correo, documento o licencia…"
          total={allData.length} filtered={filtered.length}
          filters={[
            {
              key: "spec", label: "Especialidad", value: specFilter, onChange: setSpecFilter,
              options: [{ value: "all", label: "Todas las especialidades" }, ...(specs || []).map(s => ({ value: s.id, label: s.name }))],
            },
            {
              key: "status", label: "Estado", value: statusFilter, onChange: setStatusFilter,
              options: [{ value: "all", label: "Todos los estados" }, { value: "active", label: "Activos" }, { value: "inactive", label: "Inactivos" }],
            },
          ]}
        />
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay médicos que coincidan" emptyIcon="doctors" onRowClick={(r) => setDrawerDoctor(r)} />
      </div>
      {drawerDoctor && <DoctorDrawer doctor={drawerDoctor} specialties={specs} onClose={() => setDrawerDoctor(null)} />}
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
  const [drawerAppt, setDrawerAppt] = useState(null);
  // ── filtros ──
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("all");
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
      if (drawerAppt && drawerAppt.id === id) setDrawerAppt(null);
    } catch (e) { toast(e.message || "Error", "error"); }
  };

  const getName = (list, id) => (list || []).find((x) => x.id === id)?.fullName ?? (list || []).find((x) => x.id === id)?.name ?? "—";

  const statusMap = {
    SCHEDULED: ["Programada","badge-blue"],
    CONFIRMED: ["Confirmada","badge-green"],
    CANCELLED: ["Cancelada","badge-red"],
    COMPLETED: ["Completada","badge-gray"],
    NO_SHOW:   ["No asistió","badge-warn"],
  };

  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter((r) => {
    const q = norm(search);
    const patName = norm(getName(patients, r.patientId));
    const docName = norm(getName(doctors, r.doctorId));
    const matchSearch = !q || patName.includes(q) || docName.includes(q) || norm(r.date).includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchDate = !dateFilter || r.date === dateFilter;
    const matchDoctor = doctorFilter === "all" || r.doctorId === doctorFilter;
    return matchSearch && matchStatus && matchDate && matchDoctor;
  }), [allData, search, statusFilter, dateFilter, doctorFilter, patients, doctors]);

  const cols = [
    { key: "patientId", label: "Paciente", primary: true, render: (r) => (
      <div className="cell-with-avatar">
        <Initials name={getName(patients, r.patientId)} variant="teal" />
        <div className="cell-avatar-stack">
          <div className="cell-avatar-primary">{getName(patients, r.patientId)}</div>
        </div>
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
        <div>
          <div className="page-eyebrow">Gestión</div>
          <div className="page-title">Citas médicas</div>
          <div className="page-subtitle">Haz clic en una fila para ver todos los detalles</div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}><Icon name="plus" size={14} /> Nueva cita</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Registro de citas</div>
            <div className="card-subtitle">{filtered.length} de {allData.length} citas</div>
          </div>
        </div>
        <FilterBar
          search={search} onSearch={setSearch}
          placeholder="Paciente, médico o fecha…"
          total={allData.length} filtered={filtered.length}
          filters={[
            {
              key: "status", label: "Estado", value: statusFilter, onChange: setStatusFilter,
              options: [
                { value: "all", label: "Todos los estados" },
                { value: "SCHEDULED", label: "Programada" },
                { value: "CONFIRMED", label: "Confirmada" },
                { value: "COMPLETED", label: "Completada" },
                { value: "CANCELLED", label: "Cancelada" },
                { value: "NO_SHOW", label: "No asistió" },
              ],
            },
            {
              key: "doctor", label: "Médico", value: doctorFilter, onChange: setDoctorFilter,
              options: [{ value: "all", label: "Todos los médicos" }, ...(doctors || []).map(d => ({ value: d.id, label: d.fullName }))],
            },
          ]}
        >
          <div className="form-group" style={{ minWidth: 160, gap: 5 }}>
            <label>Fecha exacta</label>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={{ paddingLeft: 12 }} />
          </div>
          {dateFilter && (
            <button className="btn btn-ghost btn-sm" style={{ alignSelf: "flex-end" }} onClick={() => setDateFilter("")}>
              <Icon name="x" size={12} /> Limpiar fecha
            </button>
          )}
        </FilterBar>
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay citas que coincidan" emptyIcon="appointments" onRowClick={(r) => setDrawerAppt(r)} />
      </div>

      {drawerAppt && <AppointmentDrawer appointment={drawerAppt} patients={patients} doctors={doctors} offices={offices} apptypes={apptypes} onClose={() => setDrawerAppt(null)} />}

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
                <div className="form-group"><label>Paciente</label>
                  <select value={form.patientId || ""} onChange={(e) => f("patientId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(patients || []).map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Médico tratante</label>
                  <select value={form.doctorId || ""} onChange={(e) => f("doctorId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Consultorio</label>
                  <select value={form.officeId || ""} onChange={(e) => f("officeId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(offices || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Tipo de cita</label>
                  <select value={form.appointmentTypeId || ""} onChange={(e) => f("appointmentTypeId", e.target.value)}>
                    <option value="">Seleccione…</option>
                    {(apptypes || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Fecha de consulta</label>
                  <input type="date" value={form.date || ""} onChange={(e) => f("date", e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 22, textAlign: "right" }}>
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
                    <div style={{ fontSize: 12, color: "var(--ink-ghost)", marginBottom: 10 }}>{slots.length} horarios disponibles</div>
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
              <div style={{ marginTop: 18 }}>
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
  const [search, setSearch] = useState("");
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

  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter(r => {
    const q = norm(search);
    return !q || norm(r.name).includes(q) || norm(r.description).includes(q);
  }), [allData, search]);

  const cols = [
    { key: "name", label: "Especialidad", primary: true, render: (r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--teal-pale)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--teal)", flexShrink: 0 }}>
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
        <div>
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Especialidades</div>
          <div className="page-subtitle">Áreas médicas y especialidades disponibles</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nueva especialidad</button>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Listado de especialidades</div>
        </div>
        <FilterBar search={search} onSearch={setSearch} placeholder="Buscar especialidad…" total={allData.length} filtered={filtered.length} filters={[]} />
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay especialidades que coincidan" emptyIcon="specialties" />
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter(r => {
    const q = norm(search);
    const matchSearch = !q || norm(r.name).includes(q) || norm(r.location).includes(q);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? r.active : !r.active);
    return matchSearch && matchStatus;
  }), [allData, search, statusFilter]);

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
      <button className={`badge ${r.active ? "badge-green" : "badge-red"}`}
        style={{ cursor: togglingId === r.id ? "not-allowed" : "pointer", opacity: togglingId === r.id ? 0.6 : 1 }}
        disabled={togglingId === r.id} onClick={() => handleToggleActive(r)} title="Clic para cambiar estado">
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
        <div>
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Consultorios</div>
          <div className="page-subtitle">Espacios físicos de atención médica</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo consultorio</button>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Listado de consultorios</div></div>
        <FilterBar
          search={search} onSearch={setSearch}
          placeholder="Nombre o ubicación…"
          total={allData.length} filtered={filtered.length}
          filters={[{
            key: "status", label: "Estado", value: statusFilter, onChange: setStatusFilter,
            options: [{ value: "all", label: "Todos" }, { value: "active", label: "Activos" }, { value: "inactive", label: "Inactivos" }],
          }]}
        />
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay consultorios que coincidan" emptyIcon="offices" />
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
  const [search, setSearch] = useState("");
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

  const allData = Array.isArray(data) ? data : [];
  const filtered = useMemo(() => allData.filter(r => {
    const q = norm(search);
    return !q || norm(r.name).includes(q) || norm(r.description).includes(q);
  }), [allData, search]);

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
        <div>
          <div className="page-eyebrow">Catálogo</div>
          <div className="page-title">Tipos de cita</div>
          <div className="page-subtitle">Modalidades y duraciones de consulta</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({}); setModal("create"); }}><Icon name="plus" size={14} /> Nuevo tipo</button>
      </div>
      <div className="card">
        <div className="card-header"><div className="card-title">Listado de tipos de cita</div></div>
        <FilterBar search={search} onSearch={setSearch} placeholder="Nombre o descripción…" total={allData.length} filtered={filtered.length} filters={[]} />
        <DataTable columns={cols} rows={filtered} loading={loading} emptyMsg="No hay tipos de cita que coincidan" emptyIcon="apptypes" />
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
        <div>
          <div className="page-eyebrow">Operación</div>
          <div className="page-title">Horarios médicos</div>
          <div className="page-subtitle">Configure la disponibilidad semanal de cada médico</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
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
            <div style={{ marginTop: 11, display: "flex", alignItems: "center", gap: 10 }}>
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
                        <button className="btn-icon" style={{ color: "var(--danger)" }} onClick={() => handleDelete(s.id)}><Icon name="trash" size={13} /></button>
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
        <div>
          <div className="page-eyebrow">Operación</div>
          <div className="page-title">Disponibilidad</div>
          <div className="page-subtitle">Consulte los horarios libres de un médico</div>
        </div>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header"><div className="card-title">Parámetros de búsqueda</div></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group"><label>Médico</label>
              <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                <option value="">Seleccione…</option>
                {(doctors || []).map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Consultorio (opcional)</label>
              <select value={officeId} onChange={(e) => setOfficeId(e.target.value)}>
                <option value="">Todos los consultorios</option>
                {(offices || []).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
            <div className="form-group"><label>Tipo de cita (opcional)</label>
              <select value={appointmentTypeId} onChange={(e) => setAppointmentTypeId(e.target.value)}>
                <option value="">Jornada completa</option>
                {(apptypes || []).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.durationMinutes} min)</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
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
        <div>
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
          <div className="report-header"><span className="report-icon"><Icon name="offices" size={15} /></span><span className="report-title">Ocupación por consultorio</span></div>
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
          <div className="report-header"><span className="report-icon"><Icon name="doctors" size={15} /></span><span className="report-title">Productividad médicos</span></div>
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
          <div className="report-header"><span className="report-icon"><Icon name="noshow" size={15} /></span><span className="report-title">Pacientes con mayor no-show</span></div>
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
  const { data: apptypes } = useData(() => api.get("/appointment-types"));
  const [drawerAppt, setDrawerAppt] = useState(null);

  const appts = Array.isArray(appointments) ? appointments : [];
  const confirmedCount = appts.filter((a) => a.status === "CONFIRMED").length;
  const scheduledCount = appts.filter((a) => a.status === "SCHEDULED").length;
  const completedCount = appts.filter((a) => a.status === "COMPLETED").length;
  const noShowCount    = appts.filter((a) => a.status === "NO_SHOW").length;
  const cancelCount    = appts.filter((a) => a.status === "CANCELLED").length;

  const stats = [
    { label: "Pacientes registrados", value: (patients || []).length,        delta: `${(patients || []).filter(p => p.active).length} activos`,   icon: "patients",     color: "teal" },
    { label: "Médicos activos",        value: (doctors || []).filter(d => d.active).length, delta: `de ${(doctors||[]).length} totales`,          icon: "stethoscope",  color: "blue" },
    { label: "Citas confirmadas",      value: confirmedCount,                delta: `${scheduledCount} pendientes de confirmar`,                   icon: "appointments", color: "green" },
    { label: "Citas completadas",      value: completedCount,                delta: `${noShowCount} no-shows · ${cancelCount} canceladas`,         icon: "check",        color: "amber" },
  ];

  const statusMap = {
    SCHEDULED: ["Programada","badge-blue"],
    CONFIRMED: ["Confirmada","badge-green"],
    CANCELLED: ["Cancelada","badge-red"],
    COMPLETED: ["Completada","badge-gray"],
    NO_SHOW:   ["No asistió","badge-warn"],
  };

  const getName = (list, id) => (list || []).find((x) => x.id === id)?.fullName ?? "—";

  const recentAppts = [...appts].sort((a, b) => {
    const da = new Date(a.date + "T" + (a.startAt ?? a.startsAt ?? "00:00"));
    const db = new Date(b.date + "T" + (b.startAt ?? b.startsAt ?? "00:00"));
    return db - da;
  }).slice(0, 8);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 22 }}>
        <div>
          <div className="page-eyebrow">Panel principal</div>
          <div className="page-title">Resumen clínico</div>
          <div className="page-subtitle">Vista general del estado del sistema</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--ink-ghost)" }}>
          <Icon name="clock" size={13} />
          {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* ── KPI STATS ── */}
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

      {/* ── CHARTS ROW ── */}
      <div className="charts-grid">
        {/* Citas por día de la semana */}
        <div className="chart-card">
          <div className="chart-title">Citas por día de la semana</div>
          <div className="chart-subtitle">Distribución histórica de todas las citas</div>
          <WeeklyChart appointments={appts} />
          <div className="chart-legend">
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: "var(--teal)" }} />
              Número de citas
            </div>
          </div>
        </div>

        {/* Distribución por estado */}
        <div className="chart-card">
          <div className="chart-title">Distribución por estado</div>
          <div className="chart-subtitle">{appts.length} citas en total</div>
          <DonutChart appointments={appts} />
        </div>
      </div>

      {/* ── SEGUNDA FILA DE GRÁFICAS ── */}
      <div className="charts-grid" style={{ marginBottom: 22 }}>
        {/* Productividad por médico (completadas) */}
        <div className="chart-card">
          <div className="chart-title">Citas completadas por médico</div>
          <div className="chart-subtitle">Top médicos según citas finalizadas</div>
          <DoctorProductivityChart appointments={appts} doctors={doctors} />
        </div>

        {/* Distribución de estados (barras horizontales) */}
        <div className="chart-card">
          <div className="chart-title">Resumen de estados</div>
          <div className="chart-subtitle">Cantidad de citas por estado</div>
          <div style={{ marginTop: 8 }}>
            <StatusDistChart appointments={appts} />
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--stone)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Consultorios", value: (offices||[]).length, color: "var(--info)" },
              { label: "Tipos de cita", value: (apptypes||[]).length, color: "#6B35A8" },
              { label: "Especialidades", value: [...new Set((doctors||[]).map(d => d.specialtyId))].length, color: "var(--teal)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--ink-light)" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLA RECIENTE ── */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Citas más recientes</div>
            <div className="card-subtitle">Últimas 8 citas · haz clic para ver detalles</div>
          </div>
        </div>
        <DataTable
          rows={recentAppts}
          loading={false}
          onRowClick={(r) => setDrawerAppt(r)}
          columns={[
            { key: "patientId", label: "Paciente", primary: true, render: (r) => (
              <div className="cell-with-avatar">
                <Initials name={getName(patients, r.patientId)} variant="teal" />
                <div className="cell-avatar-stack">
                  <div className="cell-avatar-primary">{getName(patients, r.patientId)}</div>
                </div>
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

      {drawerAppt && (
        <AppointmentDrawer
          appointment={drawerAppt}
          patients={patients}
          doctors={doctors}
          offices={offices}
          apptypes={apptypes}
          onClose={() => setDrawerAppt(null)}
        />
      )}
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
        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">
                <Icon name="monitor" size={20} />
              </div>
              <div>
                <div className="logo-name">PC <span>Health</span></div>
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
                  <button key={key} className={`nav-item ${view === key ? "active" : ""}`} onClick={() => { setView(key); setSidebarOpen(false); }}>
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

        {/* ── MAIN ── */}
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

        {sidebarOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(15,41,66,0.45)", zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
        )}

        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}