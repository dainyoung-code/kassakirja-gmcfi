import { useState, useEffect, useCallback, useMemo } from "react";

const MONTHS = [
  "Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu",
  "Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"
];

const CATEGORIES_INCOME = ["Jäsenmaksut","Lahjoitukset","Kolehti","Avustukset","Tapahtumatuotot","Muut tulot"];
const CATEGORIES_EXPENSE = ["Vuokra","Sähkö/vesi","Vakuutukset","Tarvikkeet","Matkakulut","Pankkikulut","Viestintä","Muut menot"];
const ALL_CATEGORIES = [...CATEGORIES_INCOME, ...CATEGORIES_EXPENSE];
const PAYMENT_METHODS = ["Pankkitili","Käteinen","MobilePay","Kortti","Muu"];

const INITIAL_DATA = {
  0: [
    { id: 1, date: "2026-01-04", receipt: 1, category: "Kolehti", description: "Sunnuntain Jumalanpalvelus", name: "", income: 138.20, expense: 0, payment: "Käteinen" },
    { id: 2, date: "2026-01-04", receipt: 2, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 140, expense: 0, payment: "Käteinen" },
    { id: 3, date: "2026-01-04", receipt: 3, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 70, expense: 0, payment: "Käteinen" },
    { id: 4, date: "2026-01-11", receipt: 4, category: "Kolehti", description: "Sunnuntain Jumalanpalvelus", name: "", income: 31.90, expense: 0, payment: "Käteinen" },
    { id: 5, date: "2026-01-11", receipt: 5, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "Sor Siu", income: 150, expense: 0, payment: "Käteinen" },
  ],
  1: [
    { id: 1, date: "2026-02-15", receipt: 1, category: "Kolehti", description: "Sunnuntain Jumalanpalvelus", name: "", income: 386.45, expense: 0, payment: "Käteinen" },
    { id: 2, date: "2026-02-15", receipt: 2, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 90, expense: 0, payment: "" },
    { id: 3, date: "2026-02-15", receipt: 3, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 150, expense: 0, payment: "" },
    { id: 4, date: "2026-02-15", receipt: 4, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 100, expense: 0, payment: "" },
    { id: 5, date: "2026-02-15", receipt: 5, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 92, expense: 0, payment: "" },
    { id: 6, date: "2026-02-15", receipt: 6, category: "Lahjoitukset", description: "Sunnuntain Jumalanpalvelus", name: "", income: 100, expense: 0, payment: "" },
  ],
};

for (let i = 2; i < 12; i++) {
  if (!INITIAL_DATA[i]) INITIAL_DATA[i] = [];
}

const DEFAULT_OPENING_BALANCE = 40;
const STORAGE_KEY = "kassakirja-data";
const FIREBASE_DB = "https://gmcfi-kassakirja-default-rtdb.europe-west1.firebasedatabase.app";
const LOGO_SRC = "data:image/jpeg;base64,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";

function fmt(v) {
  if (v === 0 || v === undefined || v === null) return "–";
  return v.toLocaleString("fi-FI", { style: "currency", currency: "EUR" });
}

function fmtAbs(v) {
  return v.toLocaleString("fi-FI", { style: "currency", currency: "EUR" });
}

function dateStr(d) {
  if (!d) return "";
  const parts = d.split("-");
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

// Icons
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V3a1 1 0 011-1h2a1 1 0 011 1v1M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-8 8H3v-3z"/></svg>;
const IconCheck = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l4 4 6-7"/></svg>;
const IconX = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8"/></svg>;
const IconChart = () => <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="10" width="3" height="8" rx="0.5"/><rect x="8" y="6" width="3" height="12" rx="0.5"/><rect x="14" y="2" width="3" height="16" rx="0.5"/></svg>;
const IconList = () => <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="5" y1="5" x2="17" y2="5"/><line x1="5" y1="10" x2="17" y2="10"/><line x1="5" y1="15" x2="17" y2="15"/><circle cx="2" cy="5" r="0.8" fill="currentColor"/><circle cx="2" cy="10" r="0.8" fill="currentColor"/><circle cx="2" cy="15" r="0.8" fill="currentColor"/></svg>;
const IconDown = () => <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4l3 3 3-3"/></svg>;
const IconSave = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 14H3a1 1 0 01-1-1V3a1 1 0 011-1h7l4 4v7a1 1 0 01-1 1z"/><path d="M11 14V9H5v5M5 2v3h5"/></svg>;
const IconPdf = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4l-3-3z"/><path d="M10 1v3h3"/><path d="M5.5 9.5h5M5.5 11.5h3" strokeWidth="1.2"/></svg>;
const IconPrint = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5V1h8v4M4 11H2V6h12v5h-2"/><rect x="4" y="9" width="8" height="5" rx="0.5"/><circle cx="11" cy="7.5" r="0.6" fill="currentColor"/></svg>;
const IconShare = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="12" cy="12" r="2"/><line x1="5.8" y1="7.1" x2="10.2" y2="4.9"/><line x1="5.8" y1="8.9" x2="10.2" y2="11.1"/></svg>;

// Default users - stored in localStorage after first load
const DEFAULT_USERS = [
  { id: 1, name: "Admin", pin: "1992", role: "admin" },
  { id: 2, name: "Rahastonhoitaja", pin: "5678", role: "editor" },
  { id: 3, name: "Katselija", pin: "0000", role: "viewer" },
];
const USERS_KEY = "kassakirja-users";

function LoginScreen({ onLogin, logoSrc }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "null") || DEFAULT_USERS;
    // Also try Firebase for latest users
    try {
      const res = await fetch(FIREBASE_DB + "/users.json");
      const fbUsers = await res.json();
      if (fbUsers && Array.isArray(fbUsers) && fbUsers.length > 0) {
        const user = fbUsers.find(u => u.pin === pin);
        if (user) { onLogin(user); localStorage.setItem(USERS_KEY, JSON.stringify(fbUsers)); return; }
      }
    } catch(e) { /* offline, use local */ }
    const user = users.find(u => u.pin === pin);
    if (user) {
      onLogin(user);
    } else {
      setError("Väärä PIN-koodi");
      setShake(true);
      setTimeout(() => { setShake(false); setError(""); }, 1500);
      setPin("");
    }
  }

  function handleDigit(d) {
    if (pin.length < 6) setPin(pin + d);
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(145deg, #0c1220 0%, #1a1f35 50%, #0f1628 100%)",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-8px); } 40%,80% { transform: translateX(8px); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pin-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.25); transition: all 0.15s; }
        .pin-dot-filled { background: #4f8cff; border-color: #4f8cff; box-shadow: 0 0 8px rgba(79,140,255,0.4); }
        .num-btn {
          width: 64px; height: 64px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04); color: #e0e4ef; font-size: 22px; font-weight: 600;
          cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
          font-family: 'DM Mono', monospace;
        }
        .num-btn:hover { background: rgba(79,140,255,0.15); border-color: rgba(79,140,255,0.3); }
        .num-btn:active { transform: scale(0.93); background: rgba(79,140,255,0.25); }
      `}</style>
      <div style={{
        animation: shake ? "shake 0.4s" : "fadeIn 0.5s ease-out",
        textAlign: "center", padding: 40,
      }}>
        <img src={logoSrc} alt="GMCFI" style={{
          width: 72, height: 72, borderRadius: "50%", marginBottom: 16,
          boxShadow: "0 4px 24px rgba(107,39,55,0.5), 0 0 0 3px rgba(107,39,55,0.3)",
        }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f2fa", marginBottom: 4 }}>GMCFI Kassakirja</h1>
        <p style={{ fontSize: 13, color: "#6b7394", marginBottom: 28 }}>Syötä PIN-koodi kirjautuaksesi</p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
            {[0,1,2,3].map(i => (
              <div key={i} className={`pin-dot ${i < pin.length ? "pin-dot-filled" : ""}`} />
            ))}
          </div>

          {error && <div style={{ color: "#ff6b6b", fontSize: 13, marginBottom: 16, fontWeight: 500 }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12, justifyContent: "center", marginBottom: 12 }}>
            {[1,2,3,4,5,6,7,8,9].map(d => (
              <button key={d} type="button" className="num-btn" onClick={() => handleDigit(String(d))}>{d}</button>
            ))}
            <button type="button" className="num-btn" style={{ visibility: "hidden" }} />
            <button type="button" className="num-btn" onClick={() => handleDigit("0")}>0</button>
            <button type="button" className="num-btn" onClick={() => setPin(pin.slice(0, -1))} style={{ fontSize: 16 }}>⌫</button>
          </div>

          <button type="submit" disabled={pin.length < 4} style={{
            marginTop: 12, padding: "10px 36px", borderRadius: 10, border: "none",
            background: pin.length >= 4 ? "linear-gradient(135deg, #4f8cff, #3366dd)" : "rgba(255,255,255,0.06)",
            color: pin.length >= 4 ? "white" : "#4a5270", fontSize: 14, fontWeight: 600, cursor: pin.length >= 4 ? "pointer" : "default",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            boxShadow: pin.length >= 4 ? "0 4px 16px rgba(79,140,255,0.3)" : "none",
          }}>Kirjaudu</button>
        </form>

        <p style={{ fontSize: 11, color: "#3e4560", marginTop: 24 }}>Oletus PIN: 1992 (Admin) · 5678 (Rahastonhoitaja)</p>
      </div>
    </div>
  );
}

export default function KassakirjaApp() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem("kassakirja-session");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [year, setYear] = useState(2026);
  const [transactions, setTransactions] = useState(INITIAL_DATA);
  const [activeMonth, setActiveMonth] = useState(0);
  const [view, setView] = useState("summary");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState({ date: "", receipt: "", category: "", description: "", name: "", income: "", expense: "", payment: "" });
  const [saved, setSaved] = useState(false);
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(DEFAULT_OPENING_BALANCE);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");

  function handleLogin(user) {
    setCurrentUser(user);
    localStorage.setItem("kassakirja-session", JSON.stringify(user));
  }
  function handleLogout() {
    setCurrentUser(null);
    localStorage.removeItem("kassakirja-session");
    setShowUserMenu(false);
  }

  const storageKey = STORAGE_KEY + "-" + year;
  const firebasePath = `${FIREBASE_DB}/kassakirja/${year}.json`;
  const balancePath = `${FIREBASE_DB}/settings/${year}/openingBalance.json`;

  // Load openingBalance from Firebase
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(balancePath);
        const val = await res.json();
        if (val !== null && typeof val === "number") setOpeningBalance(val);
        else {
          const local = localStorage.getItem("kassakirja-balance-" + year);
          if (local) setOpeningBalance(parseFloat(local));
        }
      } catch(e) {
        const local = localStorage.getItem("kassakirja-balance-" + year);
        if (local) setOpeningBalance(parseFloat(local));
      }
    })();
  }, [year, balancePath]);

  // Load from Firebase (with localStorage fallback)
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      try {
        const res = await fetch(firebasePath);
        const data = await res.json();
        if (!cancelled && data && typeof data === "object") {
          // Ensure all 12 months exist
          for (let i = 0; i < 12; i++) { if (!data[i]) data[i] = []; }
          setTransactions(data);
          localStorage.setItem(storageKey, JSON.stringify(data));
          return;
        }
      } catch (e) { /* Firebase offline, use localStorage */ }
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && !cancelled) {
          setTransactions(JSON.parse(stored));
        } else if (!cancelled) {
          if (year === 2026) { setTransactions(INITIAL_DATA); }
          else { const empty = {}; for (let i = 0; i < 12; i++) empty[i] = []; setTransactions(empty); }
        }
      } catch (e) {
        if (!cancelled) {
          if (year === 2026) setTransactions(INITIAL_DATA);
          else { const empty = {}; for (let i = 0; i < 12; i++) empty[i] = []; setTransactions(empty); }
        }
      }
    }
    loadData();
    // Poll Firebase every 8 seconds for real-time sync
    const interval = setInterval(async () => {
      try {
        const res = await fetch(firebasePath);
        const data = await res.json();
        if (data && typeof data === "object") {
          for (let i = 0; i < 12; i++) { if (!data[i]) data[i] = []; }
          setTransactions(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) return data;
            return prev;
          });
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
      } catch (e) { /* silent */ }
    }, 8000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [year, storageKey, firebasePath]);

  const saveData = useCallback(async (data) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      // Save to Firebase
      await fetch(firebasePath, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) { /* silent - data saved locally at least */ }
  }, [storageKey, firebasePath]);

  // Compute monthly summaries
  const monthlySummary = useMemo(() => {
    let balance = openingBalance;
    return MONTHS.map((name, i) => {
      const rows = transactions[i] || [];
      const income = rows.reduce((s, r) => s + (parseFloat(r.income) || 0), 0);
      const expense = rows.reduce((s, r) => s + (parseFloat(r.expense) || 0), 0);
      const opening = balance;
      balance = opening + income - expense;
      return { name, opening, income, expense, closing: balance, count: rows.length };
    });
  }, [transactions, openingBalance]);

  const totalIncome = monthlySummary.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlySummary.reduce((s, m) => s + m.expense, 0);
  const currentBalance = monthlySummary[11]?.closing || openingBalance;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = {};
    Object.values(transactions).flat().forEach(r => {
      const cat = r.category || "Muu";
      if (!map[cat]) map[cat] = { income: 0, expense: 0 };
      map[cat].income += parseFloat(r.income) || 0;
      map[cat].expense += parseFloat(r.expense) || 0;
    });
    return map;
  }, [transactions]);

  // If not logged in, show login screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} logoSrc={LOGO_SRC} />;
  }

  const canEdit = currentUser.role === "admin" || currentUser.role === "editor";
  const isAdmin = currentUser.role === "admin";

  function saveBalance(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    setOpeningBalance(num);
    setEditingBalance(false);
    localStorage.setItem("kassakirja-balance-" + year, String(num));
    try { fetch(balancePath, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(num) }); } catch(e) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function addTransaction() {
    const rows = transactions[activeMonth] || [];
    const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const nextReceipt = rows.length > 0 ? Math.max(...rows.map(r => r.receipt || 0)) + 1 : 1;
    const entry = {
      id: nextId,
      date: newRow.date,
      receipt: parseInt(newRow.receipt) || nextReceipt,
      category: newRow.category,
      description: newRow.description,
      name: newRow.name,
      income: parseFloat(newRow.income) || 0,
      expense: parseFloat(newRow.expense) || 0,
      payment: newRow.payment,
    };
    const updated = { ...transactions, [activeMonth]: [...rows, entry] };
    setTransactions(updated);
    saveData(updated);
    setNewRow({ date: "", receipt: "", category: "", description: "", name: "", income: "", expense: "", payment: "" });
    setShowAddForm(false);
  }

  function deleteTransaction(id) {
    const rows = (transactions[activeMonth] || []).filter(r => r.id !== id);
    const updated = { ...transactions, [activeMonth]: rows };
    setTransactions(updated);
    saveData(updated);
  }

  function startEdit(row) {
    setEditingId(row.id);
    setEditRow({ ...row });
  }

  function saveEdit() {
    const rows = (transactions[activeMonth] || []).map(r =>
      r.id === editingId ? { ...editRow, income: parseFloat(editRow.income) || 0, expense: parseFloat(editRow.expense) || 0 } : r
    );
    const updated = { ...transactions, [activeMonth]: rows };
    setTransactions(updated);
    saveData(updated);
    setEditingId(null);
    setEditRow(null);
  }

  const currentRows = transactions[activeMonth] || [];
  const summary = monthlySummary[activeMonth];

  // Bar chart max
  const maxVal = Math.max(...monthlySummary.map(m => Math.max(m.income, m.expense, 1)));

  // --- PDF HTML generator ---
  function buildPdfHtml(mode) {
    const eur = (v) => {
      if (v === 0 || v === undefined || v === null) return "-";
      return "€ " + v.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const eurA = (v) => "€ " + v.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const css = `
      @page { size: A4; margin: 15mm 18mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #222; line-height: 1.3; }

      .page { position: relative; }

      /* Header - matches Excel layout */
      .doc-header { margin-bottom: 6px; text-align: center; }
      .doc-header .logo-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 4px; }
      .doc-header .logo-row img { width: 44px; height: 44px; border-radius: 50%; }
      .doc-header h1 { font-size: 14pt; font-weight: 700; color: #222; margin-bottom: 1px; }
      .doc-header .addr { font-size: 9pt; color: #555; text-align: left; }
      .doc-header .subtitle { font-size: 11pt; font-weight: 700; color: #222; text-align: left; margin-top: 2px; }

      /* Summary box - right aligned like Excel */
      .summary-box { display: flex; justify-content: flex-end; margin: 8px 0 14px; }
      .summary-box table { border-collapse: collapse; }
      .summary-box td { padding: 2px 8px; font-size: 9.5pt; border: 1px solid #c0c0c0; }
      .summary-box td.label { text-align: right; font-weight: 400; color: #333; background: #f2f2f2; }
      .summary-box td.val { text-align: right; font-weight: 400; min-width: 80px; }
      .summary-box tr:last-child td.val { font-weight: 700; }

      /* Main data table - dark red header like Excel */
      .data-table { width: 100%; border-collapse: collapse; margin: 0 0 0; font-size: 9pt; }
      .data-table th {
        background: #6B2737; color: #fff;
        padding: 5px 7px; text-align: left; font-weight: 600; font-size: 8.5pt;
        border: 1px solid #5a1f2e;
      }
      .data-table th.right { text-align: right; }
      .data-table th.center { text-align: center; }
      .data-table td {
        padding: 4px 7px; border: 1px solid #d4d4d4; font-size: 9pt; vertical-align: top;
      }
      .data-table td.right { text-align: right; }
      .data-table td.center { text-align: center; }
      .data-table tr:nth-child(even) td { background: #faf8f8; }

      /* Yhteensä row */
      .data-table tr.total-row td {
        font-weight: 700; border-top: 2px solid #6B2737; background: #fff !important;
        padding-top: 6px;
      }

      /* Footer */
      .doc-footer { margin-top: 20px; font-size: 8pt; color: #999; text-align: center; }

      /* Summary view specific */
      .year-summary-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
      .year-summary-table th {
        background: #6B2737; color: #fff;
        padding: 5px 8px; text-align: left; font-weight: 600; font-size: 9pt;
        border: 1px solid #5a1f2e;
      }
      .year-summary-table th.right { text-align: right; }
      .year-summary-table th.center { text-align: center; }
      .year-summary-table td {
        padding: 4px 8px; border: 1px solid #d4d4d4; font-size: 9.5pt;
      }
      .year-summary-table td.right { text-align: right; }
      .year-summary-table td.center { text-align: center; }
      .year-summary-table tr:nth-child(even) td { background: #faf8f8; }
      .year-summary-table tr.total-row td { font-weight: 700; border-top: 2px solid #6B2737; background: #f5f0f0 !important; }

      .sig-area { margin-top: 50px; display: flex; gap: 80px; }
      .sig-line { flex: 1; border-top: 1px solid #333; padding-top: 4px; font-size: 9pt; color: #555; }

      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .page { page-break-after: auto; }
      }
    `;

    let body = "";

    if (mode === "summary") {
      body = `
        <div class="page">
          <div class="doc-header">
            <div class="logo-row"><img src="${LOGO_SRC}" /><h1>Grace Montagnard Alliance Church Finland</h1></div>
            <div class="addr">Kulmakatu 8, 92100 Raahe</div>
            <div class="subtitle">Kassakirja ${year} – Vuosiyhteenveto</div>
          </div>

          <div class="summary-box">
            <table>
              <tr><td class="label">Alkusaldo (€)</td><td class="val">${eurA(openingBalance)}</td></tr>
              <tr><td class="label">Tulot yht. (€)</td><td class="val">${eurA(totalIncome)}</td></tr>
              <tr><td class="label">Menot yht. (€)</td><td class="val">${eur(totalExpense)}</td></tr>
              <tr><td class="label">Loppusaldo (€)</td><td class="val">${eurA(currentBalance)}</td></tr>
            </table>
          </div>

          <table class="year-summary-table">
            <thead><tr>
              <th>Kuukausi</th><th class="right">Alkusaldo (€)</th><th class="right">Tulot (€)</th><th class="right">Menot (€)</th><th class="right">Loppusaldo (€)</th><th class="center">Kirjauksia</th>
            </tr></thead>
            <tbody>
              ${monthlySummary.map(m => `<tr>
                <td>${m.name}</td>
                <td class="right">${eurA(m.opening)}</td>
                <td class="right">${eur(m.income)}</td>
                <td class="right">${eur(m.expense)}</td>
                <td class="right" style="font-weight:600">${eurA(m.closing)}</td>
                <td class="center">${m.count || "-"}</td>
              </tr>`).join("")}
              <tr class="total-row">
                <td style="text-align:right"><strong>Yhteensä</strong></td>
                <td class="right">${eurA(openingBalance)}</td>
                <td class="right">${eurA(totalIncome)}</td>
                <td class="right">${eurA(totalExpense)}</td>
                <td class="right">${eurA(currentBalance)}</td>
                <td class="center">${Object.values(transactions).flat().length}</td>
              </tr>
            </tbody>
          </table>

          <div class="sig-area">
            <div class="sig-line">Päivämäärä ja paikka</div>
            <div class="sig-line">Rahastonhoitaja</div>
            <div class="sig-line">Puheenjohtaja</div>
          </div>
          <div class="doc-footer">Grace Montagnard Alliance Church Finland – Kassakirja ${year}</div>
        </div>
      `;
    } else {
      const rows = transactions[activeMonth] || [];
      const ms = monthlySummary[activeMonth];
      let runBal = ms.opening;

      body = `
        <div class="page">
          <div class="doc-header">
            <div class="logo-row"><img src="${LOGO_SRC}" /><h1>Grace Montagnard Alliance Church Finland</h1></div>
            <div class="addr">Kulmakatu 8, 92100 Raahe</div>
            <div class="subtitle">Kassakirja ${MONTHS[activeMonth]} ${year}</div>
          </div>

          <div class="summary-box">
            <table>
              <tr><td class="label">Alkusaldo (€)</td><td class="val">${eurA(ms.opening)}</td></tr>
              <tr><td class="label">Tulot yht. (€)</td><td class="val">${eurA(ms.income)}</td></tr>
              <tr><td class="label">Menot yht. (€)</td><td class="val">${eur(ms.expense)}</td></tr>
              <tr><td class="label">Loppusaldo (€)</td><td class="val"><strong>${eurA(ms.closing)}</strong></td></tr>
            </table>
          </div>

          <table class="data-table">
            <thead><tr>
              <th style="width:75px">Päivämäärä</th>
              <th style="width:42px" class="center">Tosite</th>
              <th style="width:80px">Kategoria</th>
              <th>Selite</th>
              <th style="width:80px">Nimet</th>
              <th style="width:72px" class="right">Tulot (€)</th>
              <th style="width:72px" class="right">Menot (€)</th>
              <th style="width:72px" class="right">Saldo (€)</th>
              <th style="width:78px">Maksutapa</th>
            </tr></thead>
            <tbody>
              ${rows.length === 0 ? '<tr><td colspan="9" style="text-align:center;padding:24px;color:#999;">Ei kirjauksia</td></tr>' : rows.map(r => {
                runBal += (parseFloat(r.income) || 0) - (parseFloat(r.expense) || 0);
                const ds = r.date ? r.date.split("-").reverse().join(".") : "";
                return `<tr>
                  <td>${ds}</td>
                  <td class="center">${r.receipt || ""}</td>
                  <td>${r.category || ""}</td>
                  <td>${r.description || ""}</td>
                  <td>${r.name || ""}</td>
                  <td class="right">${eur(parseFloat(r.income) || 0)}</td>
                  <td class="right">${eur(parseFloat(r.expense) || 0)}</td>
                  <td class="right">${eurA(runBal)}</td>
                  <td>${r.payment || ""}</td>
                </tr>`;
              }).join("")}
              <tr class="total-row">
                <td colspan="4"></td>
                <td style="text-align:right"><strong>Yhteensä</strong></td>
                <td class="right">${eurA(ms.income)}</td>
                <td class="right">${eur(ms.expense)}</td>
                <td class="right">${eurA(ms.closing)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div class="sig-area">
            <div class="sig-line">Päivämäärä ja paikka</div>
            <div class="sig-line">Rahastonhoitaja</div>
          </div>
          <div class="doc-footer">Grace Montagnard Alliance Church Finland – ${MONTHS[activeMonth]} ${year}</div>
        </div>
      `;
    }

    return '<!DOCTYPE html><html lang="fi"><head><meta charset="UTF-8"><title>Kassakirja' + (mode === "month" ? " – " + MONTHS[activeMonth] : "") + ' ' + year + '</title><style>' + css + '</style></head><body>' + body + '</body></html>';
  }

  function handlePrint(mode) {
    const html = buildPdfHtml(mode);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 400);
    }
  }

  function handleDownloadPdf(mode) {
    const html = buildPdfHtml(mode);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "summary" ? `Kassakirja_${year}_Yhteenveto.html` : `Kassakirja_${year}_${MONTHS[activeMonth]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleShare(mode) {
    const title = mode === "summary" ? `Kassakirja ${year} – Yhteenveto` : `Kassakirja ${year} – ${MONTHS[activeMonth]}`;
    const html = buildPdfHtml(mode);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const file = new File([blob], mode === "summary" ? `Kassakirja_${year}_Yhteenveto.html` : `Kassakirja_${year}_${MONTHS[activeMonth]}.html`, { type: "text/html" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ title, files: [file] });
        return;
      } catch (e) { /* user cancelled or error, fall through */ }
    }
    // Fallback: download
    handleDownloadPdf(mode);
  }

  // User management component (admin only)
  function UserManager() {
    const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem(USERS_KEY) || "null") || DEFAULT_USERS);
    useEffect(() => {
      fetch(FIREBASE_DB + "/users.json").then(r => r.json()).then(data => {
        if (data && Array.isArray(data) && data.length > 0) { setUsers(data); localStorage.setItem(USERS_KEY, JSON.stringify(data)); }
      }).catch(() => {});
    }, []);
    const [newName, setNewName] = useState("");
    const [newPin, setNewPin] = useState("");
    const [newRole, setNewRole] = useState("viewer");

    function saveUsers(u) {
      localStorage.setItem(USERS_KEY, JSON.stringify(u));
      setUsers(u);
      try { fetch(FIREBASE_DB + "/users.json", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u) }); } catch(e) {}
    }
    function addUser() {
      if (!newName || !newPin || newPin.length < 4) return;
      const id = Math.max(...users.map(u => u.id), 0) + 1;
      saveUsers([...users, { id, name: newName, pin: newPin, role: newRole }]);
      setNewName(""); setNewPin(""); setNewRole("viewer");
    }
    function removeUser(id) { if (users.length > 1) saveUsers(users.filter(u => u.id !== id)); }

    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
          <thead><tr>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: 11, color: "#6b7394", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>NIMI</th>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: 11, color: "#6b7394", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>PIN</th>
            <th style={{ textAlign: "left", padding: "6px 10px", fontSize: 11, color: "#6b7394", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>ROOLI</th>
            <th style={{ width: 40 }} />
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: "8px 10px", fontSize: 13, color: "#e0e4ef", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{u.name}</td>
                <td style={{ padding: "8px 10px", fontSize: 13, color: "#8b95b8", fontFamily: "'DM Mono', monospace", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>{u.pin}</td>
                <td style={{ padding: "8px 10px", fontSize: 12, borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: u.role === "admin" ? "rgba(79,140,255,0.12)" : u.role === "editor" ? "rgba(93,218,138,0.1)" : "rgba(255,255,255,0.06)",
                    color: u.role === "admin" ? "#4f8cff" : u.role === "editor" ? "#5dda8a" : "#8b95b8"
                  }}>{u.role === "admin" ? "Ylläpitäjä" : u.role === "editor" ? "Muokkaaja" : "Katselija"}</span>
                </td>
                <td style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  {u.id !== currentUser.id && <button className="btn btn-danger" style={{ padding: "4px 6px" }} onClick={() => removeUser(u.id)}><IconTrash /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3 }}>NIMI</label>
            <input className="input-field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Uusi käyttäjä" />
          </div>
          <div style={{ width: 100 }}>
            <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3 }}>PIN</label>
            <input className="input-field" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="1234" maxLength={6} />
          </div>
          <div style={{ width: 140 }}>
            <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3 }}>ROOLI</label>
            <select className="input-field" value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="admin">Ylläpitäjä</option>
              <option value="editor">Muokkaaja</option>
              <option value="viewer">Katselija</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ padding: "7px 14px" }} onClick={addUser} disabled={!newName || !newPin || newPin.length < 4}><IconPlus /> Lisää</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: "linear-gradient(145deg, #0c1220 0%, #1a1f35 50%, #0f1628 100%)",
      color: "#e0e4ef",
      minHeight: "100vh",
      padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 400px; } }
        .fade-in { animation: fadeIn 0.35s ease-out both; }
        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          backdrop-filter: blur(12px);
        }
        .btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px; border: none;
          font-size: 13px; font-weight: 500; cursor: pointer;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f8cff, #3366dd);
          color: white; box-shadow: 0 2px 12px rgba(79,140,255,0.3);
        }
        .btn-primary:hover { box-shadow: 0 4px 20px rgba(79,140,255,0.45); transform: translateY(-1px); }
        .btn-ghost {
          background: rgba(255,255,255,0.06); color: #aab4d0; border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); color: #e0e4ef; }
        .btn-danger { background: rgba(255,80,80,0.12); color: #ff6b6b; border: 1px solid rgba(255,80,80,0.15); }
        .btn-danger:hover { background: rgba(255,80,80,0.2); }
        .btn-success { background: rgba(80,200,120,0.15); color: #5dda8a; border: 1px solid rgba(80,200,120,0.2); }
        .btn-pdf { background: rgba(220,160,50,0.12); color: #e8b84a; border: 1px solid rgba(220,160,50,0.18); }
        .btn-pdf:hover { background: rgba(220,160,50,0.2); color: #f0c860; }
        .input-field {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: #e0e4ef; padding: 7px 10px; border-radius: 6px; font-size: 13px;
          transition: border-color 0.2s; width: 100%;
        }
        .input-field:focus { outline: none; border-color: #4f8cff; box-shadow: 0 0 0 2px rgba(79,140,255,0.15); }
        .month-tab {
          padding: 6px 14px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 12.5px; font-weight: 500; transition: all 0.2s;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }
        .month-tab-active { background: linear-gradient(135deg, #4f8cff, #3366dd); color: white; box-shadow: 0 2px 8px rgba(79,140,255,0.3); }
        .month-tab-inactive { background: rgba(255,255,255,0.04); color: #7a84a0; }
        .month-tab-inactive:hover { background: rgba(255,255,255,0.08); color: #aab4d0; }
        .tag { padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 500; }
        .saved-badge {
          position: fixed; top: 20px; right: 20px; z-index: 100;
          background: rgba(80,200,120,0.2); color: #5dda8a;
          border: 1px solid rgba(80,200,120,0.3);
          padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
          animation: fadeIn 0.3s ease-out;
          display: flex; align-items: center; gap: 6px;
        }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7394; font-weight: 600; padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.03); vertical-align: middle; }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .income-val { color: #5dda8a; font-family: 'DM Mono', monospace; font-size: 13px; }
        .expense-val { color: #ff6b6b; font-family: 'DM Mono', monospace; font-size: 13px; }
        .balance-val { color: #e0e4ef; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
        .mono { font-family: 'DM Mono', monospace; font-size: 13px; }
      `}</style>

      {saved && <div className="saved-badge"><IconSave /> Tallennettu</div>}

      {/* HEADER */}
      <div style={{ padding: "28px 32px 0", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={LOGO_SRC} alt="GMCFI" style={{
              width: 56, height: 56, borderRadius: "50%",
              boxShadow: "0 2px 16px rgba(107,39,55,0.4), 0 0 0 2px rgba(107,39,55,0.3)",
              flexShrink: 0,
            }} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{
                  fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase",
                  color: "#d4a46a",
                  background: "linear-gradient(90deg, #d4a46a, #f0d4a0)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>GMCFI</span>
                <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#4f8cff" }}>Kassakirja</span>
                  <button onClick={() => setYear(y => y - 1)} style={{
                    background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "#6b7394", fontSize: 14, lineHeight: 1, borderRadius: 4,
                    display: "flex", alignItems: "center",
                  }} title="Edellinen vuosi">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1L3 5l4 4"/></svg>
                  </button>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#4f8cff", minWidth: 38, textAlign: "center", cursor: "default" }}>{year}</span>
                  <button onClick={() => setYear(y => y + 1)} style={{
                    background: "none", border: "none", cursor: "pointer", padding: "2px 6px", color: "#6b7394", fontSize: 14, lineHeight: 1, borderRadius: 4,
                    display: "flex", alignItems: "center",
                  }} title="Seuraava vuosi">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 1l4 4-4 4"/></svg>
                  </button>
                </div>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f0f2fa", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                Grace Montagnard Alliance Church
              </h1>
              <div style={{ fontSize: 13, color: "#6b7394", marginTop: 3 }}>Kulmakatu 8, 92100 Raahe</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button className={`btn ${view === "summary" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("summary")}><IconChart /> Yhteenveto</button>
            <button className={`btn ${view === "month" ? "btn-primary" : "btn-ghost"}`} onClick={() => setView("month")}><IconList /> Kuukausi</button>

            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* PDF / Print / Share dropdown */}
            <div style={{ position: "relative" }}>
              <button className="btn btn-ghost" onClick={() => setShowPdfMenu(!showPdfMenu)} style={{ gap: 5 }}>
                <IconPdf /> PDF / Tulosta <IconDown />
              </button>
              {showPdfMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setShowPdfMenu(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
                    background: "#1e2440", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: 6, minWidth: 230,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                    animation: "fadeIn 0.2s ease"
                  }}>
                    <div style={{ padding: "6px 10px", fontSize: 10, color: "#5a6384", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {view === "summary" ? "Vuosiyhteenveto" : MONTHS[activeMonth] + " " + year}
                    </div>

                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, marginBottom: 2 }}
                      onClick={() => { handlePrint(view === "summary" ? "summary" : "month"); setShowPdfMenu(false); }}>
                      <IconPrint /> Tulosta / Tallenna PDF
                    </button>

                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, marginBottom: 2 }}
                      onClick={() => { handleDownloadPdf(view === "summary" ? "summary" : "month"); setShowPdfMenu(false); }}>
                      <IconPdf /> Lataa tiedostona
                    </button>

                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, marginBottom: 2 }}
                      onClick={() => { handleShare(view === "summary" ? "summary" : "month"); setShowPdfMenu(false); }}>
                      <IconShare /> Jaa...
                    </button>

                    <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                    <div style={{ padding: "6px 10px", fontSize: 10, color: "#5a6384", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      Koko vuosi
                    </div>

                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, marginBottom: 2 }}
                      onClick={() => { handlePrint("summary"); setShowPdfMenu(false); }}>
                      <IconPrint /> Tulosta yhteenveto
                    </button>

                    {view === "month" && (
                      <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6 }}
                        onClick={() => { handleShare("summary"); setShowPdfMenu(false); }}>
                        <IconShare /> Jaa yhteenveto...
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* User menu */}
            <div style={{ position: "relative" }}>
              <button className="btn btn-ghost" onClick={() => setShowUserMenu(!showUserMenu)} style={{ gap: 5, padding: "8px 12px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5"/></svg>
                {currentUser.name} <IconDown />
              </button>
              {showUserMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setShowUserMenu(false)} />
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
                    background: "#1e2440", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10, padding: 6, minWidth: 200,
                    boxShadow: "0 12px 40px rgba(0,0,0,0.5)", animation: "fadeIn 0.2s ease"
                  }}>
                    <div style={{ padding: "8px 12px", fontSize: 12, color: "#8b95b8", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 4 }}>
                      <div style={{ color: "#e0e4ef", fontWeight: 600, fontSize: 13 }}>{currentUser.name}</div>
                      <div style={{ marginTop: 2 }}>{currentUser.role === "admin" ? "Ylläpitäjä" : currentUser.role === "editor" ? "Muokkaaja" : "Katselija"}</div>
                    </div>
                    {isAdmin && (
                      <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, marginBottom: 2 }}
                        onClick={() => { setShowUserMgmt(!showUserMgmt); setShowUserMenu(false); }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2.5"/><path d="M1 14c0-2.5 2-4.5 5-4.5"/><circle cx="12" cy="5" r="2.5"/><path d="M12 9v4M10 11h4"/></svg>
                        Hallinnoi käyttäjiä
                      </button>
                    )}
                    <button className="btn btn-ghost" style={{ width: "100%", justifyContent: "flex-start", borderRadius: 6, color: "#ff6b6b" }}
                      onClick={handleLogout}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"/></svg>
                      Kirjaudu ulos
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT (admin only) */}
      {showUserMgmt && isAdmin && (
        <div style={{ padding: "0 32px 16px", maxWidth: 1200, margin: "0 auto" }}>
          <div className="card" style={{ padding: "20px 24px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#c8cee0" }}>Käyttäjien hallinta</div>
              <button className="btn btn-ghost" style={{ padding: "5px 10px" }} onClick={() => setShowUserMgmt(false)}><IconX /></button>
            </div>
            <UserManager />
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div style={{ padding: "20px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }} className="fade-in">
          {/* Alkusaldo - editable */}
          <div className="card" style={{ padding: "18px 20px", cursor: canEdit ? "pointer" : "default" }}
            onClick={() => { if (canEdit && !editingBalance) { setEditingBalance(true); setBalanceInput(String(openingBalance)); } }}>
            <div style={{ fontSize: 11, color: "#6b7394", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Alkusaldo {canEdit && !editingBalance && <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#6b7394" strokeWidth="1.5"><path d="M11 2l3 3-8 8H3v-3z"/></svg>}
            </div>
            {editingBalance ? (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="number" step="0.01" className="input-field" style={{ width: 120, fontSize: 18, fontFamily: "'DM Mono', monospace", padding: "4px 8px" }}
                  value={balanceInput} onChange={e => setBalanceInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") saveBalance(balanceInput); if (e.key === "Escape") setEditingBalance(false); }}
                  autoFocus onClick={e => e.stopPropagation()} />
                <button className="btn btn-success" style={{ padding: "4px 8px" }} onClick={e => { e.stopPropagation(); saveBalance(balanceInput); }}><IconCheck /></button>
                <button className="btn btn-ghost" style={{ padding: "4px 8px" }} onClick={e => { e.stopPropagation(); setEditingBalance(false); }}><IconX /></button>
              </div>
            ) : (
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#8b95b8" }}>{fmtAbs(openingBalance)}</div>
            )}
          </div>
          {[
            { label: "Tulot yhteensä", value: fmtAbs(totalIncome), color: "#5dda8a" },
            { label: "Menot yhteensä", value: fmtAbs(totalExpense), color: "#ff6b6b" },
            { label: "Saldo nyt", value: fmtAbs(currentBalance), color: "#4f8cff" },
          ].map((c, i) => (
            <div key={i} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 11, color: "#6b7394", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px 40px" }}>

        {/* === SUMMARY VIEW === */}
        {view === "summary" && (
          <div className="fade-in">
            {/* Monthly bar chart */}
            <div className="card" style={{ padding: "24px 28px", marginBottom: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: "#c8cee0" }}>Kuukausittainen yhteenveto</div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 180 }}>
                {monthlySummary.map((m, i) => {
                  const hInc = maxVal > 0 ? (m.income / maxVal) * 140 : 0;
                  const hExp = maxVal > 0 ? (m.expense / maxVal) * 140 : 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
                      onClick={() => { setActiveMonth(i); setView("month"); }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 150 }}>
                        <div style={{
                          width: 14, height: Math.max(hInc, 2), borderRadius: "4px 4px 0 0",
                          background: m.income > 0 ? "linear-gradient(180deg, #5dda8a, #3aad62)" : "rgba(255,255,255,0.05)",
                          transition: "height 0.5s ease"
                        }} title={`Tulot: ${fmtAbs(m.income)}`} />
                        <div style={{
                          width: 14, height: Math.max(hExp, 2), borderRadius: "4px 4px 0 0",
                          background: m.expense > 0 ? "linear-gradient(180deg, #ff6b6b, #cc4444)" : "rgba(255,255,255,0.05)",
                          transition: "height 0.5s ease"
                        }} title={`Menot: ${fmtAbs(m.expense)}`} />
                      </div>
                      <div style={{ fontSize: 10, color: "#6b7394", fontWeight: 500 }}>{m.name.substring(0, 3)}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 14, justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7a84a0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#5dda8a" }} /> Tulot
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7a84a0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: "#ff6b6b" }} /> Menot
                </div>
              </div>
            </div>

            {/* Summary table */}
            <div className="card" style={{ overflow: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Kuukausi</th>
                    <th style={{ textAlign: "right" }}>Alkusaldo</th>
                    <th style={{ textAlign: "right" }}>Tulot</th>
                    <th style={{ textAlign: "right" }}>Menot</th>
                    <th style={{ textAlign: "right" }}>Loppusaldo</th>
                    <th style={{ textAlign: "center" }}>Kirjauksia</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map((m, i) => (
                    <tr key={i} style={{ cursor: "pointer" }} onClick={() => { setActiveMonth(i); setView("month"); }}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td style={{ textAlign: "right" }} className="mono">{fmt(m.opening)}</td>
                      <td style={{ textAlign: "right" }} className="income-val">{fmt(m.income)}</td>
                      <td style={{ textAlign: "right" }} className="expense-val">{fmt(m.expense)}</td>
                      <td style={{ textAlign: "right" }} className="balance-val">{fmtAbs(m.closing)}</td>
                      <td style={{ textAlign: "center" }}>
                        {m.count > 0 ? <span className="tag" style={{ background: "rgba(79,140,255,0.12)", color: "#4f8cff" }}>{m.count}</span> : <span style={{ color: "#3e4560" }}>–</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ fontWeight: 700 }}>Yhteensä</td>
                    <td style={{ textAlign: "right" }} className="mono">{fmtAbs(openingBalance)}</td>
                    <td style={{ textAlign: "right" }} className="income-val" style={{ textAlign: "right", color: "#5dda8a", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtAbs(totalIncome)}</td>
                    <td style={{ textAlign: "right" }} className="expense-val" style={{ textAlign: "right", color: "#ff6b6b", fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtAbs(totalExpense)}</td>
                    <td style={{ textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#4f8cff" }}>{fmtAbs(currentBalance)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Category breakdown */}
            <div className="card" style={{ padding: "24px 28px", marginTop: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: "#c8cee0" }}>Kategoriat</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {Object.entries(categoryBreakdown).filter(([,v]) => v.income > 0 || v.expense > 0).map(([cat, v]) => (
                  <div key={cat} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: "#aab4d0" }}>{cat}</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      {v.income > 0 && <span className="income-val">{fmtAbs(v.income)}</span>}
                      {v.expense > 0 && <span className="expense-val">{fmtAbs(v.expense)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === MONTH VIEW === */}
        {view === "month" && (
          <div className="fade-in">
            {/* Month tabs */}
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 16, marginBottom: 4 }}>
              {MONTHS.map((m, i) => (
                <button key={i}
                  className={`month-tab ${activeMonth === i ? "month-tab-active" : "month-tab-inactive"}`}
                  onClick={() => { setActiveMonth(i); setEditingId(null); setShowAddForm(false); }}>
                  {m.substring(0, 3)}
                </button>
              ))}
            </div>

            {/* Month summary header */}
            <div className="card" style={{ padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: "#f0f2fa" }}>{MONTHS[activeMonth]} {year}</h2>
                <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                  <div><span style={{ color: "#6b7394" }}>Alkusaldo: </span><span className="mono">{fmtAbs(summary.opening)}</span></div>
                  <div><span style={{ color: "#6b7394" }}>Tulot: </span><span className="income-val">{fmtAbs(summary.income)}</span></div>
                  <div><span style={{ color: "#6b7394" }}>Menot: </span><span className="expense-val">{fmtAbs(summary.expense)}</span></div>
                  <div><span style={{ color: "#6b7394" }}>Loppusaldo: </span><span style={{ color: "#4f8cff", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmtAbs(summary.closing)}</span></div>
                </div>
              </div>
            </div>

            {/* Transactions table */}
            <div className="card" style={{ overflow: "auto" }}>
              <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 13, color: "#6b7394" }}>{currentRows.length} kirjausta</span>
                {canEdit && <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}>
                  <IconPlus /> Lisää kirjaus
                </button>}
              </div>

              {/* Add form */}
              {showAddForm && (
                <div style={{ padding: "16px 20px", background: "rgba(79,140,255,0.04)", borderBottom: "1px solid rgba(79,140,255,0.1)", animation: "slideDown 0.3s ease" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 70px 140px 1fr 120px 110px 110px 120px", gap: 8, alignItems: "end" }}>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Päivämäärä</label>
                      <input type="date" className="input-field" value={newRow.date} onChange={e => setNewRow({ ...newRow, date: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Tosite</label>
                      <input type="number" className="input-field" value={newRow.receipt} onChange={e => setNewRow({ ...newRow, receipt: e.target.value })} placeholder="#" />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Kategoria</label>
                      <select className="input-field" value={newRow.category} onChange={e => setNewRow({ ...newRow, category: e.target.value })}>
                        <option value="">Valitse...</option>
                        <optgroup label="Tulot">{CATEGORIES_INCOME.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
                        <optgroup label="Menot">{CATEGORIES_EXPENSE.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Selite</label>
                      <input className="input-field" value={newRow.description} onChange={e => setNewRow({ ...newRow, description: e.target.value })} placeholder="Kuvaus..." />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Nimi</label>
                      <input className="input-field" value={newRow.name} onChange={e => setNewRow({ ...newRow, name: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Tulo €</label>
                      <input type="number" step="0.01" className="input-field" value={newRow.income} onChange={e => setNewRow({ ...newRow, income: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Meno €</label>
                      <input type="number" step="0.01" className="input-field" value={newRow.expense} onChange={e => setNewRow({ ...newRow, expense: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#6b7394", display: "block", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Maksutapa</label>
                      <select className="input-field" value={newRow.payment} onChange={e => setNewRow({ ...newRow, payment: e.target.value })}>
                        <option value="">Valitse...</option>
                        {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}><IconX /> Peruuta</button>
                    <button className="btn btn-primary" onClick={addTransaction} disabled={!newRow.date || !newRow.category}><IconCheck /> Tallenna</button>
                  </div>
                </div>
              )}

              <table>
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>Päivä</th>
                    <th style={{ width: 50 }}>Tos.</th>
                    <th style={{ width: 120 }}>Kategoria</th>
                    <th>Selite</th>
                    <th style={{ width: 100 }}>Nimi</th>
                    <th style={{ width: 100, textAlign: "right" }}>Tulo</th>
                    <th style={{ width: 100, textAlign: "right" }}>Meno</th>
                    <th style={{ width: 110, textAlign: "right" }}>Saldo</th>
                    <th style={{ width: 100 }}>Maksutapa</th>
                    <th style={{ width: 70 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length === 0 && (
                    <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#4a5270" }}>Ei kirjauksia tässä kuussa</td></tr>
                  )}
                  {currentRows.map((row, idx) => {
                    // Running balance
                    let bal = summary.opening;
                    for (let j = 0; j <= idx; j++) {
                      bal += (parseFloat(currentRows[j].income) || 0) - (parseFloat(currentRows[j].expense) || 0);
                    }
                    const isEditing = editingId === row.id;
                    if (isEditing) {
                      return (
                        <tr key={row.id} style={{ background: "rgba(79,140,255,0.04)" }}>
                          <td><input type="date" className="input-field" value={editRow.date} onChange={e => setEditRow({ ...editRow, date: e.target.value })} /></td>
                          <td><input type="number" className="input-field" style={{ width: 50 }} value={editRow.receipt} onChange={e => setEditRow({ ...editRow, receipt: e.target.value })} /></td>
                          <td>
                            <select className="input-field" value={editRow.category} onChange={e => setEditRow({ ...editRow, category: e.target.value })}>
                              <option value="">–</option>
                              {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </td>
                          <td><input className="input-field" value={editRow.description} onChange={e => setEditRow({ ...editRow, description: e.target.value })} /></td>
                          <td><input className="input-field" value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} /></td>
                          <td><input type="number" step="0.01" className="input-field" style={{ textAlign: "right" }} value={editRow.income} onChange={e => setEditRow({ ...editRow, income: e.target.value })} /></td>
                          <td><input type="number" step="0.01" className="input-field" style={{ textAlign: "right" }} value={editRow.expense} onChange={e => setEditRow({ ...editRow, expense: e.target.value })} /></td>
                          <td className="balance-val" style={{ textAlign: "right" }}>{fmtAbs(bal)}</td>
                          <td>
                            <select className="input-field" value={editRow.payment} onChange={e => setEditRow({ ...editRow, payment: e.target.value })}>
                              <option value="">–</option>
                              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="btn btn-success" style={{ padding: "5px 8px" }} onClick={saveEdit}><IconCheck /></button>
                              <button className="btn btn-ghost" style={{ padding: "5px 8px" }} onClick={() => { setEditingId(null); setEditRow(null); }}><IconX /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    const isIncome = CATEGORIES_INCOME.includes(row.category);
                    return (
                      <tr key={row.id}>
                        <td style={{ color: "#8b95b8", fontSize: 12 }}>{dateStr(row.date)}</td>
                        <td style={{ color: "#6b7394", fontSize: 12, textAlign: "center" }}>{row.receipt}</td>
                        <td>
                          <span className="tag" style={{
                            background: isIncome ? "rgba(93,218,138,0.1)" : "rgba(255,107,107,0.1)",
                            color: isIncome ? "#5dda8a" : "#ff6b6b"
                          }}>{row.category}</span>
                        </td>
                        <td style={{ color: "#c8cee0" }}>{row.description}</td>
                        <td style={{ color: "#8b95b8" }}>{row.name}</td>
                        <td className="income-val" style={{ textAlign: "right" }}>{fmt(row.income)}</td>
                        <td className="expense-val" style={{ textAlign: "right" }}>{fmt(row.expense)}</td>
                        <td className="balance-val" style={{ textAlign: "right" }}>{fmtAbs(bal)}</td>
                        <td style={{ fontSize: 12, color: "#6b7394" }}>{row.payment}</td>
                        <td>
                          {canEdit && <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => startEdit(row)}><IconEdit /></button>
                            <button className="btn btn-danger" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => deleteTransaction(row.id)}><IconTrash /></button>
                          </div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {currentRows.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: "2px solid rgba(255,255,255,0.08)" }}>
                      <td colSpan={5} style={{ fontWeight: 600, textAlign: "right" }}>Yhteensä</td>
                      <td className="income-val" style={{ textAlign: "right", fontWeight: 700 }}>{fmtAbs(summary.income)}</td>
                      <td className="expense-val" style={{ textAlign: "right", fontWeight: 700 }}>{fmtAbs(summary.expense)}</td>
                      <td className="balance-val" style={{ textAlign: "right", fontWeight: 700 }}>{fmtAbs(summary.closing)}</td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
