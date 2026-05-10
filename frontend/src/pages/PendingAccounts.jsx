// frontend/src/pages/PendingAccounts.jsx
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton";

const toNumber = (value) => parseFloat(String(value)) || 0;

const formatCurrency = (amount, currency) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(Math.abs(amount));

const PENDING_GROUPS = [
  {
    id: "por-pagar",
    label: "📤 Pendientes de Pago",
    description: "Lo que la empresa debe y aún no ha cancelado",
    prefixes: ["2.1.2.1", "2.1.1", "2.2"],
    nature: "credit",
    alert: "danger",
  },
  {
    id: "por-cobrar",
    label: "📥 Pendientes de Cobro",
    description: "Lo que le deben a la empresa y aún no se ha cobrado",
    prefixes: ["1.1.2"],
    nature: "debit",
    alert: "warning",
  },
  {
    id: "impuestos",
    label: "🧾 Impuestos Pendientes",
    description: "IVA y otros impuestos por declarar o pagar",
    prefixes: ["2.1.2.2", "2.1.2.3", "2.1.2.4"],
    nature: "credit",
    alert: "info",
  },
  {
    id: "gastos-acum",
    label: "⏳ Gastos Acumulados",
    description: "Gastos devengados que aún no se han pagado",
    prefixes: ["2.1.4"],
    nature: "credit",
    alert: "warning",
  },
];

function PendingAccounts() {
  const { activeRecord, currency } = useRecords();
  const { accounts: chartOfAccounts } = useChartOfAccounts();
  const navigate = useNavigate();

  if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
    return (
      <div className="container container--narrow">
        <h2>Cuentas Pendientes</h2>
        <p>No hay datos para mostrar. Selecciona un registro con asientos guardados.</p>
      </div>
    );
  }

  const getBalance = (accountCode, nature) => {
    const entries = activeRecord.entries.filter((e) => e.code === accountCode);
    if (entries.length === 0) return 0;
    const totalDebit  = entries.reduce((s, e) => s + toNumber(e.debit), 0);
    const totalCredit = entries.reduce((s, e) => s + toNumber(e.credit), 0);
    return nature === "credit" ? totalCredit - totalDebit : totalDebit - totalCredit;
  };

  const buildGroupItems = (prefixes, nature) =>
    chartOfAccounts
      .filter((acc) => acc.levelType === "Detalle" && prefixes.some((p) => acc.code.startsWith(p)))
      .map((acc) => ({ code: acc.code, name: acc.name, balance: getBalance(acc.code, nature) }))
      .filter((item) => item.balance > 0.01);

  const totalPending = PENDING_GROUPS.reduce((total, group) => {
    const items = buildGroupItems(group.prefixes, group.nature);
    return total + items.reduce((s, i) => s + i.balance, 0);
  }, 0);

  const hasPendings = totalPending > 0.01;

  const periodLabel = activeRecord.date
    ? `Al ${new Date(activeRecord.date).toLocaleDateString("es-CR", {
        year: "numeric", month: "long", day: "numeric",
      })}`
    : "Saldos sin cancelar al cierre del período";

  return (
    <div className="container container--narrow">
      <ReportHeader record={activeRecord} title="Cuentas Pendientes" periodLabel={periodLabel} />

      <div className={`pending-summary ${hasPendings ? "pending-summary--alert" : "pending-summary--ok"}`}>
        {hasPendings ? (
          <>
            <span className="pending-summary__icon">⚠️</span>
            <div>
              <strong>Hay cuentas con saldo pendiente</strong>
              <p>Total pendiente: {formatCurrency(totalPending, currency)}</p>
            </div>
          </>
        ) : (
          <>
            <span className="pending-summary__icon">✅</span>
            <div>
              <strong>No hay cuentas pendientes</strong>
              <p>Todas las cuentas están al día.</p>
            </div>
          </>
        )}
      </div>

      {PENDING_GROUPS.map((group) => {
        const items = buildGroupItems(group.prefixes, group.nature);
        if (items.length === 0) return null;
        const groupTotal = items.reduce((s, i) => s + i.balance, 0);
        return (
          <div key={group.id} className={`pending-card pending-card--${group.alert}`}>
            <div className="pending-card__header">
              <div>
                <h3 className="pending-card__title">{group.label}</h3>
                <p className="pending-card__desc">{group.description}</p>
              </div>
              <div className="pending-card__total">{formatCurrency(groupTotal, currency)}</div>
            </div>
            <table className="pending-table">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Código</th>
                  <th style={{ width: "55%" }}>Cuenta</th>
                  <th style={{ width: "30%", textAlign: "right" }}>Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.code}>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatCurrency(item.balance, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {!hasPendings && (
        <div className="pending-empty">
          <p>Todas las cuentas tienen saldo cero. No hay pendientes.</p>
        </div>
      )}

      <div className="report-nav">
        <button className="secondary" onClick={() => navigate("/situacion-financiera")}>
          ← Situación Financiera
        </button>
        <PrintButton />
        <button onClick={() => navigate("/dashboard")}>Ir al Dashboard →</button> {/* ✅ */}
      </div>
    </div>
  );
}

export default PendingAccounts;