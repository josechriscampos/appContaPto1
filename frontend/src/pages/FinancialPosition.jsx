// frontend/src/pages/FinancialPosition.jsx
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton"; // ← nuevo

const toNumber = (value) => parseFloat(String(value)) || 0;

const formatCurrency = (amount, currency) => {
  if (!amount || amount === 0) return "";
  return new Intl.NumberFormat("es-CR", { style: "currency", currency }).format(amount);
};

function FinancialPosition() {
  const { activeRecord, currency } = useRecords();
  const { accounts: chartOfAccounts } = useChartOfAccounts();
  const navigate = useNavigate();

  if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
    return (
      <div className="container container--narrow">
        <h2>Estado de Situación Financiera</h2>
        <p>No hay datos para mostrar.</p>
      </div>
    );
  }

  const calculateBalance = (account) => {
    const relevant = activeRecord.entries.filter((e) => e.code === account.code);
    if (relevant.length === 0) return null;
    const totalDebit  = relevant.reduce((s, e) => s + toNumber(e.debit), 0);
    const totalCredit = relevant.reduce((s, e) => s + toNumber(e.credit), 0);
    const type = account.code.charAt(0);
    if (type === "1") { const b = totalDebit - totalCredit; return b !== 0 ? b : null; }
    if (type === "2" || type === "3") { const b = totalCredit - totalDebit; return b !== 0 ? b : null; }
    return null;
  };

  const resultAccounts = chartOfAccounts.filter((a) => ["4", "5", "6"].includes(a.code.charAt(0)));
  const netIncome = resultAccounts.reduce((total, account) => {
    const relevant = activeRecord.entries.filter((e) => e.code === account.code);
    if (relevant.length === 0) return total;
    const td = relevant.reduce((s, e) => s + toNumber(e.debit), 0);
    const tc = relevant.reduce((s, e) => s + toNumber(e.credit), 0);
    if (account.code.startsWith("4")) return total + (tc - td);
    return total - (td - tc);
  }, 0);

  const buildSection = (prefix) =>
    chartOfAccounts
      .filter((a) => a.code.startsWith(prefix) && a.levelType === "Detalle")
      .map((a) => ({ ...a, balance: calculateBalance(a) }))
      .filter((a) => a.balance !== null);

  const currentAssets         = buildSection("1.1");
  const nonCurrentAssets      = buildSection("1.2");
  const otherAssets           = buildSection("1.3");
  const currentLiabilities    = buildSection("2.1");
  const nonCurrentLiabilities = buildSection("2.2");
  const capital               = buildSection("3");

  const totalCurrentAssets    = currentAssets.reduce((s, a) => s + a.balance, 0);
  const totalNonCurrentAssets = nonCurrentAssets.reduce((s, a) => s + a.balance, 0);
  const totalOtherAssets      = otherAssets.reduce((s, a) => s + a.balance, 0);
  const totalAssets           = totalCurrentAssets + totalNonCurrentAssets + totalOtherAssets;
  const totalCurrentLiab      = currentLiabilities.reduce((s, a) => s + a.balance, 0);
  const totalNonCurrentLiab   = nonCurrentLiabilities.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities      = totalCurrentLiab + totalNonCurrentLiab;
  const totalCapital          = capital.reduce((s, a) => s + a.balance, 0);
  const totalCapitalAndNet    = totalCapital + netIncome;
  const totalLiabAndCapital   = totalLiabilities + totalCapitalAndNet;
  const isBalanced            = Math.abs(totalAssets - totalLiabAndCapital) < 0.01;

  const SectionRows = ({ items }) =>
    items.map((acc) => (
      <tr className="report-row" key={acc.code}>
        <td>{acc.code}</td><td>{acc.name}</td>
        <td style={{ textAlign: "right" }}>{formatCurrency(acc.balance, currency)}</td>
        <td></td>
      </tr>
    ));

  const SectionHeader = ({ title }) => (
    <tr className="report-section-header"><td colSpan="4">{title}</td></tr>
  );

  const SubtotalRow = ({ label, amount }) => (
    <tr className="report-subtotal">
      <td colSpan="2">{label}</td><td></td>
      <td style={{ textAlign: "right" }}>{formatCurrency(amount, currency)}</td>
    </tr>
  );

  const periodLabel = activeRecord.date
    ? `Al ${new Date(activeRecord.date).toLocaleDateString("es-CR", {
        year: "numeric", month: "long", day: "numeric",
      })}`
    : "";

  return (
    <div className="container container--narrow">
      <ReportHeader record={activeRecord} title="Estado de Situación Financiera" periodLabel={periodLabel} />

      <div className="fin-position-grid">
        <div>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Código</th>
                  <th style={{ width: "45%" }}>ACTIVOS</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Parcial</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <SectionHeader title="Activo Corriente" />
                <SectionRows items={currentAssets} />
                <SubtotalRow label="Total Activo Corriente" amount={totalCurrentAssets} />
                {nonCurrentAssets.length > 0 && (<>
                  <SectionHeader title="Activo No Corriente" />
                  <SectionRows items={nonCurrentAssets} />
                  <SubtotalRow label="Total Activo No Corriente" amount={totalNonCurrentAssets} />
                </>)}
                {otherAssets.length > 0 && (<>
                  <SectionHeader title="Otros Activos" />
                  <SectionRows items={otherAssets} />
                  <SubtotalRow label="Total Otros Activos" amount={totalOtherAssets} />
                </>)}
              </tbody>
              <tfoot>
                <tr className="report-final-total">
                  <td colSpan="2">TOTAL ACTIVOS</td><td></td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(totalAssets, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div>
          <div className="table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Código</th>
                  <th style={{ width: "45%" }}>PASIVOS Y CAPITAL</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Parcial</th>
                  <th style={{ width: "20%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <SectionHeader title="Pasivo Corriente" />
                <SectionRows items={currentLiabilities} />
                <SubtotalRow label="Total Pasivo Corriente" amount={totalCurrentLiab} />
                {nonCurrentLiabilities.length > 0 && (<>
                  <SectionHeader title="Pasivo Largo Plazo" />
                  <SectionRows items={nonCurrentLiabilities} />
                  <SubtotalRow label="Total Pasivo Largo Plazo" amount={totalNonCurrentLiab} />
                </>)}
                <tr className="report-grand-total">
                  <td colSpan="2">Total Pasivos</td><td></td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(totalLiabilities, currency)}</td>
                </tr>
                <SectionHeader title="Capital Contable" />
                <SectionRows items={capital} />
                <tr className="report-row">
                  <td>—</td>
                  <td>{netIncome >= 0 ? "Utilidad del Período" : "Pérdida del Período"}</td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(Math.abs(netIncome), currency)}</td>
                  <td></td>
                </tr>
                <SubtotalRow label="Total Capital Contable" amount={totalCapitalAndNet} />
              </tbody>
              <tfoot>
                <tr className="report-final-total">
                  <td colSpan="2">TOTAL PASIVO + CAPITAL</td><td></td>
                  <td style={{ textAlign: "right" }}>{formatCurrency(totalLiabAndCapital, currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="balance-status">
        {isBalanced ? (
          <p className="balance-ok">✅ El estado cuadra correctamente.</p>
        ) : (
          <p className="balance-error">
            ❌ No cuadra. Diferencia: {formatCurrency(Math.abs(totalAssets - totalLiabAndCapital), currency)}
          </p>
        )}
      </div>

      <div className="report-nav">
        <button className="secondary" onClick={() => navigate("/estado-resultados")}>← Estado de Resultados</button>
        <PrintButton /> {/* ← reemplaza el botón anterior */}
        <button onClick={() => navigate("/cuentas-pendientes")}>Cuentas Pendientes →</button>
      </div>
    </div>
  );
}

export default FinancialPosition;