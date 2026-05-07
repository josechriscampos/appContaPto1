// frontend/src/pages/IncomeStatement.jsx
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton"; // ← nuevo

const toNumber = (value) => parseFloat(String(value)) || 0;

const formatCurrency = (amount, currency) => {
  const number = Math.abs(toNumber(amount));
  const formatted = new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(number);
  return amount < 0 ? `(${formatted})` : formatted;
};

function IncomeStatement() {
  const { activeRecord, currency } = useRecords();
  const { accounts: chartOfAccounts } = useChartOfAccounts();
  const navigate = useNavigate();

  if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
    return (
      <div className="container">
        <h2>Estado de Resultados</h2>
        <p>No hay datos para mostrar.</p>
      </div>
    );
  }

  const resultAccounts = chartOfAccounts
    .filter((account) => ["4", "5", "6"].includes(account.code.charAt(0)))
    .map((account) => {
      const relevantEntries = activeRecord.entries.filter((e) => e.code === account.code);
      if (relevantEntries.length === 0) return null;
      const totalDebits  = relevantEntries.reduce((sum, e) => sum + toNumber(e.debit), 0);
      const totalCredits = relevantEntries.reduce((sum, e) => sum + toNumber(e.credit), 0);
      const balance = account.code.startsWith("4") ? totalCredits - totalDebits : totalDebits - totalCredits;
      return { code: account.code, name: account.name, balance, type: account.code.charAt(0) };
    })
    .filter(Boolean);

  const incomeAccounts  = resultAccounts.filter((acc) => acc.type === "4");
  const cogsAccounts    = resultAccounts.filter((acc) => acc.type === "6");
  const expenseAccounts = resultAccounts.filter((acc) => acc.type === "5");

  const totalIncome   = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCogs     = cogsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const grossProfit   = totalIncome - totalCogs;
  const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const netIncome     = grossProfit - totalExpenses;

  const periodLabel = activeRecord.date
    ? `Para el período terminado el ${new Date(activeRecord.date).toLocaleDateString(
        "es-CR", { year: "numeric", month: "long", day: "numeric" }
      )}`
    : "";

  return (
    <div className="container container--narrow">
      <ReportHeader record={activeRecord} title="Estado de Resultados" periodLabel={periodLabel} />

      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Código</th>
              <th style={{ width: "45%" }}>Descripción</th>
              <th style={{ width: "20%", textAlign: "right" }}>Parcial</th>
              <th style={{ width: "20%", textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="report-section-header"><td colSpan="4">Ingresos Operativos</td></tr>
            {incomeAccounts.map((acc) => (
              <tr className="report-row" key={acc.code}>
                <td>{acc.code}</td><td>{acc.name}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(acc.balance, currency)}</td>
                <td></td>
              </tr>
            ))}
            <tr className="report-subtotal">
              <td colSpan="2">Ingresos Netos</td><td></td>
              <td style={{ textAlign: "right" }}>{formatCurrency(totalIncome, currency)}</td>
            </tr>

            <tr className="report-section-header"><td colSpan="4">Costo de Ventas</td></tr>
            {cogsAccounts.map((acc) => (
              <tr className="report-row" key={acc.code}>
                <td>{acc.code}</td><td>{acc.name}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(-acc.balance, currency)}</td>
                <td></td>
              </tr>
            ))}
            <tr className="report-grand-total">
              <td colSpan="2">Utilidad Bruta</td><td></td>
              <td style={{ textAlign: "right" }}>{formatCurrency(grossProfit, currency)}</td>
            </tr>

            <tr className="report-section-header"><td colSpan="4">Gastos Operativos</td></tr>
            {expenseAccounts.map((acc) => (
              <tr className="report-row" key={acc.code}>
                <td>{acc.code}</td><td>{acc.name}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(acc.balance, currency)}</td>
                <td></td>
              </tr>
            ))}
            <tr className="report-subtotal">
              <td colSpan="2">Total Gastos Operativos</td><td></td>
              <td style={{ textAlign: "right" }}>{formatCurrency(-totalExpenses, currency)}</td>
            </tr>

            <tr className="report-final-total">
              <td colSpan="2">Utilidad Neta del Período</td><td></td>
              <td style={{ textAlign: "right" }}>{formatCurrency(netIncome, currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="report-nav">
        <button className="secondary" onClick={() => navigate("/balance")}>← Balanza</button>
        <PrintButton /> {/* ← reemplaza el botón anterior */}
        <button onClick={() => navigate("/situacion-financiera")}>Situación Financiera →</button>
      </div>
    </div>
  );
}

export default IncomeStatement;