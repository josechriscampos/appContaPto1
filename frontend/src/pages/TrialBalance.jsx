// frontend/src/pages/TrialBalance.jsx
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton"; // ← nuevo

const formatCurrency = (amount, currency) => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(amount);
};

const toNumber = (value) => parseFloat(String(value)) || 0;

function TrialBalance() {
  const { activeRecord, currency } = useRecords();
  const { accounts: chartOfAccounts } = useChartOfAccounts();
  const navigate = useNavigate();

  if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
    return (
      <div className="container">
        <h2>Balanza de Comprobación</h2>
        <p>No hay datos para mostrar.</p>
      </div>
    );
  }

  const balanceData = chartOfAccounts
    .map((account) => {
      const relevantEntries = activeRecord.entries.filter((e) => e.code === account.code);
      if (relevantEntries.length === 0) return null;
      const totalDebits  = relevantEntries.reduce((sum, e) => sum + toNumber(e.debit), 0);
      const totalCredits = relevantEntries.reduce((sum, e) => sum + toNumber(e.credit), 0);
      const accountType  = account.code.charAt(0);
      let finalDebit = 0, finalCredit = 0;
      if (["2", "3", "4"].includes(accountType)) {
        const balance = totalCredits - totalDebits;
        if (balance > 0) finalCredit = balance;
        else finalDebit = Math.abs(balance);
      } else {
        const balance = totalDebits - totalCredits;
        if (balance > 0) finalDebit = balance;
        else finalCredit = Math.abs(balance);
      }
      return { code: account.code, name: account.name, debit: finalDebit, credit: finalCredit };
    })
    .filter(Boolean);

  const totalDebits  = balanceData.reduce((sum, item) => sum + item.debit, 0);
  const totalCredits = balanceData.reduce((sum, item) => sum + item.credit, 0);
  const isBalanced   = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="container container--narrow">
      <ReportHeader
        record={activeRecord}
        title="Balanza de Comprobación"
        periodLabel={
          activeRecord.date
            ? `Al ${new Date(activeRecord.date).toLocaleDateString("es-CR", {
                year: "numeric", month: "long", day: "numeric",
              })}`
            : ""
        }
      />

      <div className="table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Código</th>
              <th style={{ width: "45%" }}>Nombre de Cuenta</th>
              <th style={{ width: "20%", textAlign: "right" }}>Debe</th>
              <th style={{ width: "20%", textAlign: "right" }}>Haber</th>
            </tr>
          </thead>
          <tbody>
            {balanceData.map((account) => (
              <tr key={account.code}>
                <td>{account.code}</td>
                <td>{account.name}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(account.debit, currency)}</td>
                <td style={{ textAlign: "right" }}>{formatCurrency(account.credit, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="table-totals">
              <td colSpan="2"><strong>TOTALES</strong></td>
              <td style={{ textAlign: "right" }}><strong>{formatCurrency(totalDebits, currency)}</strong></td>
              <td style={{ textAlign: "right" }}><strong>{formatCurrency(totalCredits, currency)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="balance-status">
        {isBalanced ? (
          <p className="balance-ok">✅ ¡El balance es correcto!</p>
        ) : (
          <p className="balance-error">
            ❌ Diferencia: {formatCurrency(Math.abs(totalDebits - totalCredits), currency)}
          </p>
        )}
      </div>

      <div className="report-nav">
        <button className="secondary" onClick={() => navigate("/cuentas-t")}>← Cuentas T</button>
        <PrintButton /> {/* ← reemplaza el botón anterior */}
        <button onClick={() => navigate("/estado-resultados")}>Estado de Resultados →</button>
      </div>
    </div>
  );
}

export default TrialBalance;