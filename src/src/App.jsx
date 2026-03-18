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

const OPENING_BALANCE = 40;
const STORAGE_KEY = "kassakirja-data";
const LOGO_SRC = "data:image/png;base64,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";

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

export default function KassakirjaApp() {
  const [year, setYear] = useState(2026);
  const [transactions, setTransactions] = useState(INITIAL_DATA);
  const [activeMonth, setActiveMonth] = useState(0);
  const [view, setView] = useState("summary");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRow, setNewRow] = useState({ date: "", receipt: "", category: "", description: "", name: "", income: "", expense: "", payment: "" });
  const [saved, setSaved] = useState(false);

  const storageKey = STORAGE_KEY + "-" + year;

  // Load from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setTransactions(JSON.parse(stored));
      } else if (year === 2026) {
        setTransactions(INITIAL_DATA);
      } else {
        const empty = {};
        for (let i = 0; i < 12; i++) empty[i] = [];
        setTransactions(empty);
      }
    } catch (e) {
      if (year === 2026) {
        setTransactions(INITIAL_DATA);
      } else {
        const empty = {};
        for (let i = 0; i < 12; i++) empty[i] = [];
        setTransactions(empty);
      }
    }
  }, [year, storageKey]);

  const saveData = useCallback((data) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) { /* silent */ }
  }, [storageKey]);

  // Compute monthly summaries
  const monthlySummary = useMemo(() => {
    let balance = OPENING_BALANCE;
    return MONTHS.map((name, i) => {
      const rows = transactions[i] || [];
      const income = rows.reduce((s, r) => s + (parseFloat(r.income) || 0), 0);
      const expense = rows.reduce((s, r) => s + (parseFloat(r.expense) || 0), 0);
      const opening = balance;
      balance = opening + income - expense;
      return { name, opening, income, expense, closing: balance, count: rows.length };
    });
  }, [transactions]);

  const totalIncome = monthlySummary.reduce((s, m) => s + m.income, 0);
  const totalExpense = monthlySummary.reduce((s, m) => s + m.expense, 0);
  const currentBalance = monthlySummary[11]?.closing || OPENING_BALANCE;

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
              <tr><td class="label">Alkusaldo (€)</td><td class="val">${eurA(OPENING_BALANCE)}</td></tr>
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
                <td class="right">${eurA(OPENING_BALANCE)}</td>
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

  const [showPdfMenu, setShowPdfMenu] = useState(false);

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
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div style={{ padding: "20px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }} className="fade-in">
          {[
            { label: "Alkusaldo", value: fmtAbs(OPENING_BALANCE), color: "#8b95b8" },
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
                    <td style={{ textAlign: "right" }} className="mono">{fmtAbs(OPENING_BALANCE)}</td>
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
                <button className="btn btn-primary" onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}>
                  <IconPlus /> Lisää kirjaus
                </button>
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
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-ghost" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => startEdit(row)}><IconEdit /></button>
                            <button className="btn btn-danger" style={{ padding: "5px 8px", fontSize: 11 }} onClick={() => deleteTransaction(row.id)}><IconTrash /></button>
                          </div>
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
