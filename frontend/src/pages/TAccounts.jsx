// frontend/src/pages/TAccounts.jsx
import { useRecords } from "../context/useRecords";
import { useNavigate } from "react-router-dom";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton"; // ← nuevo

const formatCurrency = (amount, currency) => {
  const number = parseFloat(String(amount)) || 0;
  return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(number);
};

const TAccountCard = ({ accountName, debits = [], credits = [], currency }) => {
  const totalDebits  = debits.reduce((sum, val) => sum + val, 0);
  const totalCredits = credits.reduce((sum, val) => sum + val, 0);
  const finalBalance = totalDebits - totalCredits;
  const finalDebit   = finalBalance > 0 ? finalBalance : 0;
  const finalCredit  = finalBalance < 0 ? Math.abs(finalBalance) : 0;

  return (
    <div className="t-account-custom">
      <div className="t-account-custom-header">
        <input value={accountName} readOnly />
      </div>
      <div className="t-account-custom-body">
        <div className="debit-col">
          <div className="amounts-list">
            {debits.map((amount, index) => (
              <input key={index} type="text" value={formatCurrency(amount, currency)} readOnly />
            ))}
          </div>
        </div>
        <div className="credit-col">
          <div className="amounts-list">
            {credits.map((amount, index) => (
              <input key={index} type="text" value={formatCurrency(amount, currency)} readOnly />
            ))}
          </div>
        </div>
      </div>
      <div className="t-account-custom-footer">
        <div className="total-debit">
          <input className="final-balance-input" type="text" value={formatCurrency(totalDebits, currency)} readOnly />
        </div>
        <div className="total-credit">
          <input className="final-balance-input" type="text" value={formatCurrency(totalCredits, currency)} readOnly />
        </div>
      </div>
      <div className="t-account-final-balance">
        {finalDebit  > 0 && <div className="balance-debit">{formatCurrency(finalDebit, currency)}</div>}
        {finalCredit > 0 && <div className="balance-credit">{formatCurrency(finalCredit, currency)}</div>}
      </div>
    </div>
  );
};

function TAccounts() {
  const { activeRecord, currency } = useRecords();
  const { accounts: chartOfAccounts } = useChartOfAccounts();
  const navigate = useNavigate();

  if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
    return (
      <div className="container">
        <h2>Cuentas T</h2>
        <p>No hay asientos guardados para este registro.</p>
        <button type="button" onClick={() => navigate("/asientos")}>
          Volver a Asientos
        </button>
      </div>
    );
  }

  const accountNameMap = new Map(
    chartOfAccounts.map((account) => [account.code, account.name])
  );

  const accountsMap = activeRecord.entries.reduce((acc, line) => {
    const accountCode = line.code;
    if (typeof accountCode === "string" && accountCode.trim() !== "") {
      if (!acc[accountCode]) acc[accountCode] = { debits: [], credits: [] };
      const debit  = parseFloat(String(line.debit))  || 0;
      const credit = parseFloat(String(line.credit)) || 0;
      if (debit  > 0) acc[accountCode].debits.push(debit);
      if (credit > 0) acc[accountCode].credits.push(credit);
    }
    return acc;
  }, {});

  const periodLabel = activeRecord.date
    ? `Al ${new Date(activeRecord.date).toLocaleDateString("es-CR", {
        year: "numeric", month: "long", day: "numeric",
      })}`
    : "";

  return (
    <div className="container">
      <ReportHeader
        record={activeRecord}
        title="Cuentas T"
        periodLabel={periodLabel}
      />

      <div className="t-accounts-scroll-wrapper">
        <div className="t-accounts-grid">
          {Object.entries(accountsMap).map(([code, data]) => (
            <TAccountCard
              key={code}
              accountName={`${code} - ${accountNameMap.get(code) || "Cuenta no encontrada"}`}
              debits={data.debits}
              credits={data.credits}
              currency={currency}
            />
          ))}
        </div>
      </div>

      <div className="report-nav">
        <button className="secondary" onClick={() => navigate("/asientos")}>← Asientos</button>
        <PrintButton /> {/* ← reemplaza el botón anterior */}
        <button onClick={() => navigate("/balance")}>Continuar a Balanza →</button>
      </div>
    </div>
  );
}

export default TAccounts;