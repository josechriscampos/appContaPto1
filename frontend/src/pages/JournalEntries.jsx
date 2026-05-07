// frontend/src/pages/JournalEntries.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import { useToast } from "../context/useToast";
import ReportHeader from "../components/ReportHeader";
import PrintButton from "../components/PrintButton";
import API from "../api/axios";

const newEntryGroupTemplate = () => ({
  id: String(Date.now()),
  title: "",
  lines: [
    {
      id: String(Date.now() + 1),
      code: "", accountDetail: "", specificDetail: "",
      debit: 0, credit: 0, debitRaw: "", creditRaw: "", isAutoBalanced: false,
    },
    {
      id: String(Date.now() + 2),
      code: "", accountDetail: "", specificDetail: "",
      debit: 0, credit: 0, debitRaw: "", creditRaw: "", isAutoBalanced: false,
    },
  ],
});

const formatCurrency = (decimalValue) => {
  const number = parseFloat(String(decimalValue)) || 0;
  return new Intl.NumberFormat("es-CR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const parseAmount = (rawValue) => {
  if (!rawValue) return 0;
  const cleaned = rawValue.toString().replace(/\s/g, "").replace(/[^\d.,-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const isIvaAccount = (line) => {
  const name = line.accountDetail?.toLowerCase() || "";
  return name.includes("impuesto") || name.includes("iva");
};

function JournalEntries() {
  const { activeRecord, updateRecordEntries, currency, draftEntries, setDraftEntries } = useRecords();
  const { accounts } = useChartOfAccounts();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSaving,  setIsSaving]  = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lineError, setLineError] = useState("");

  const initialEntries = useMemo(() => [newEntryGroupTemplate()], []);
  const entries = draftEntries && draftEntries.length > 0 ? draftEntries : initialEntries;

  const detailAccounts = useMemo(
    () => accounts.filter((acc) => acc.levelType === "Detalle"),
    [accounts]
  );

  const accountsMap = useMemo(
    () => new Map(detailAccounts.map((acc) => [acc.code, acc.name])),
    [detailAccounts]
  );

  const periodTitle = useMemo(() => {
    if (!activeRecord?.date) return "";
    const date = new Date(activeRecord.date);
    const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });
  }, [activeRecord?.date]);

  const updateAndBalanceEntries = (updatedEntries) => {
    updatedEntries.forEach((group) => {
      group.lines.forEach((line) => {
        if (line.isAutoBalanced) {
          line.debit = 0; line.credit = 0;
          line.debitRaw = ""; line.creditRaw = "";
          line.isAutoBalanced = false;
        }
      });

      let debitTotal = 0, creditTotal = 0;
      const emptyLines = [];

      group.lines.forEach((line, index) => {
        debitTotal += line.debit;
        creditTotal += line.credit;
        if (line.debit === 0 && line.credit === 0 && line.code.trim() !== "") {
          emptyLines.push(index);
        }
      });

      if (emptyLines.length === 1) {
        const difference = Math.abs(debitTotal - creditTotal);
        const lineToBalance = group.lines[emptyLines[0]];
        if (difference > 0) {
          if (debitTotal > creditTotal) {
            lineToBalance.credit = difference;
            lineToBalance.creditRaw = formatCurrency(difference);
            lineToBalance.debit = 0; lineToBalance.debitRaw = "";
          } else {
            lineToBalance.debit = difference;
            lineToBalance.debitRaw = formatCurrency(difference);
            lineToBalance.credit = 0; lineToBalance.creditRaw = "";
          }
          lineToBalance.isAutoBalanced = true;
        }
      }
    });
    setDraftEntries(updatedEntries);
  };

  const handleCodeChange = (groupIndex, lineIndex, code) => {
    const updatedEntries = structuredClone(entries);
    const line = updatedEntries[groupIndex].lines[lineIndex];
    line.code = code;
    line.accountDetail = accountsMap.get(code) || "";
    updateAndBalanceEntries(updatedEntries);
  };

  const handleAmountChange = (groupIndex, lineIndex, field, rawValue) => {
    const updatedEntries = structuredClone(entries);
    const group = updatedEntries[groupIndex];
    const line = group.lines[lineIndex];
    line.isAutoBalanced = false;

    const trimmed = rawValue.toString().trim();
    if (trimmed.endsWith("%") && isIvaAccount(line)) {
      const match = trimmed.match(/(\d+(?:[.,]\d+)?)/);
      const factor = match ? parseFloat(match[1].replace(",", ".")) / 100 : 0;
      let baseAmount = 0;
      for (let i = lineIndex - 1; i >= 0; i -= 1) {
        const c = group.lines[i];
        if (c.debit > 0 || c.credit > 0) { baseAmount = c.debit > 0 ? c.debit : c.credit; break; }
      }
      if (baseAmount === 0) {
        for (let i = lineIndex + 1; i < group.lines.length; i += 1) {
          const c = group.lines[i];
          if (c.debit > 0 || c.credit > 0) { baseAmount = c.debit > 0 ? c.debit : c.credit; break; }
        }
      }
      if (baseAmount > 0 && factor > 0) {
        const ivaAmount = +(baseAmount * factor).toFixed(2);
        if (field === "debit") {
          line.debit = ivaAmount; line.debitRaw = formatCurrency(ivaAmount);
          line.credit = 0; line.creditRaw = "";
        } else {
          line.credit = ivaAmount; line.creditRaw = formatCurrency(ivaAmount);
          line.debit = 0; line.debitRaw = "";
        }
        updateAndBalanceEntries(updatedEntries);
        return;
      }
    }

    const amount = parseAmount(rawValue);
    if (field === "debit") {
      line.debit = amount; line.debitRaw = rawValue;
      if (amount > 0) { line.credit = 0; line.creditRaw = ""; }
    } else {
      line.credit = amount; line.creditRaw = rawValue;
      if (amount > 0) { line.debit = 0; line.debitRaw = ""; }
    }
    updateAndBalanceEntries(updatedEntries);
  };

  const handleAmountBlur = (groupIndex, lineIndex, field) => {
    const updatedEntries = structuredClone(entries);
    const line = updatedEntries[groupIndex].lines[lineIndex];
    const amount = field === "debit" ? line.debit : line.credit;
    if (amount > 0) {
      if (field === "debit") line.debitRaw = formatCurrency(amount);
      else line.creditRaw = formatCurrency(amount);
      setDraftEntries(updatedEntries);
    }
  };

  const handleAmountFocus = (groupIndex, lineIndex, field) => {
    const updatedEntries = structuredClone(entries);
    const line = updatedEntries[groupIndex].lines[lineIndex];
    const amount = field === "debit" ? line.debit : line.credit;
    if (amount > 0) {
      if (field === "debit") line.debitRaw = String(amount);
      else line.creditRaw = String(amount);
      setDraftEntries(updatedEntries);
    }
  };

  const handleDetailChange = (groupIndex, lineIndex, value) => {
    const updatedEntries = structuredClone(entries);
    updatedEntries[groupIndex].lines[lineIndex].specificDetail = value;
    setDraftEntries(updatedEntries);
  };

  const handleTitleChange = (groupIndex, value) => {
    const updatedEntries = structuredClone(entries);
    updatedEntries[groupIndex].title = value;
    setDraftEntries(updatedEntries);
  };

  const addLineToGroup = (groupIndex) => {
    const updatedEntries = structuredClone(entries);
    updatedEntries[groupIndex].lines.push({
      id: String(Date.now()),
      code: "", accountDetail: "", specificDetail: "",
      debit: 0, credit: 0, debitRaw: "", creditRaw: "", isAutoBalanced: false,
    });
    updateAndBalanceEntries(updatedEntries);
  };

  const removeLineFromGroup = (groupIndex, lineIndex) => {
    const updatedEntries = structuredClone(entries);
    const group = updatedEntries[groupIndex];
    if (group.lines.length <= 2) {
      setLineError("Un asiento debe tener al menos dos líneas.");
      setTimeout(() => setLineError(""), 3000);
      return;
    }
    setLineError("");
    group.lines.splice(lineIndex, 1);
    updateAndBalanceEntries(updatedEntries);
  };

  const addEntryGroup = () => setDraftEntries([...entries, newEntryGroupTemplate()]);

  const removeEntryGroup = (groupIndex) => {
    if (entries.length > 1) {
      setDraftEntries(entries.filter((_, i) => i !== groupIndex));
    } else {
      setDraftEntries([newEntryGroupTemplate()]);
    }
  };

  const { totalDebit, totalCredit } = useMemo(
    () => entries.reduce(
      (totals, group) => {
        group.lines.forEach((line) => {
          totals.totalDebit  += line.debit;
          totals.totalCredit += line.credit;
        });
        return totals;
      },
      { totalDebit: 0, totalCredit: 0 }
    ),
    [entries]
  );

  const handleSaveChanges = async () => {
    setSaveError("");
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
    if (!activeRecord || !isBalanced || totalDebit === 0) {
      setSaveError("El asiento no está balanceado o está vacío. Revise los totales.");
      return;
    }
    setIsSaving(true);
    try {
      const entriesToSave = entries.flatMap((group) =>
        group.lines
          .filter((line) => line.code.trim() !== "" && (line.debit > 0 || line.credit > 0))
          .map((line) => {
            // eslint-disable-next-line no-unused-vars
            const { isAutoBalanced, debitRaw, creditRaw, ...restOfLine } = line;
            return { ...restOfLine, entryGroupId: group.id };
          })
      );
      await API.put(`/records/${activeRecord.id}/entries`, entriesToSave);
      updateRecordEntries(activeRecord.id, entriesToSave);
      showToast("Asientos guardados exitosamente.", "success");
      navigate("/cuentas-t");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error al guardar asientos:", error);
      const msg = error.response?.data?.message || "No se pudieron guardar los cambios.";
      setSaveError(msg);
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeRecord) {
    return <div className="container"><p>No hay un registro seleccionado.</p></div>;
  }

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return (
    <div className="container">
      <ReportHeader
        record={activeRecord}
        title="Asientos de Diario"
        periodLabel={periodTitle ? `Para el período del ${periodTitle}` : ""}
      />

      {lineError && <p className="error-message">{lineError}</p>}
      {saveError && <p className="error-message">{saveError}</p>}

      <p className="iva-hint">
        💡 Para calcular IVA automáticamente, selecciona la cuenta de impuesto
        y escribe el porcentaje en el campo Debe o Haber. Ejemplo: <strong>13%</strong>
      </p>

      <datalist id="account-codes">
        {detailAccounts.map((acc) => (
          <option key={acc.code} value={acc.code}>{acc.code} - {acc.name}</option>
        ))}
      </datalist>

      {entries.map((group, groupIndex) => (
        <div className="entry-group" key={group.id}>
          <div className="entry-group-header">
            <div className="entry-group-title">
              {/* ✅ Título visible en pantalla e impresión */}
              <h4>Asiento N° {groupIndex + 1}{group.title ? ` — ${group.title}` : ""}</h4>
              <input
                type="text"
                className="entry-title-input screen-only"
                placeholder="Título del asiento (opcional)"
                value={group.title || ""}
                onChange={(e) => handleTitleChange(groupIndex, e.target.value)}
              />
            </div>
            <div className="group-actions">
              <button onClick={() => addLineToGroup(groupIndex)} className="secondary">
                + Agregar línea
              </button>
              {entries.length > 1 && (
                <button onClick={() => removeEntryGroup(groupIndex)} className="danger">
                  Eliminar Asiento
                </button>
              )}
            </div>
          </div>

          <table className="entry-table">
            <thead>
              {groupIndex === 0 && (
                <tr>
                  <th style={{ width: "12%" }}>Código</th>
                  <th style={{ width: "25%" }}>Nombre de Cuenta</th>
                  <th style={{ width: "28%" }}>Detalle Específico</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Debe ({currency})</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Haber ({currency})</th>
                  <th style={{ width: "5%" }}></th>
                </tr>
              )}
            </thead>
            <tbody>
              {group.lines.map((line, lineIndex) => (
                <tr key={line.id}>

                  {/* ✅ Código — dropdown en pantalla, texto en impresión */}
                  <td>
                    <span className="print-only-text">{line.code}</span>
                    <div className="code-input-wrapper screen-only">
                      <input
                        list="account-codes"
                        className="code-input"
                        value={line.code}
                        onChange={(e) => handleCodeChange(groupIndex, lineIndex, e.target.value)}
                        placeholder="Código"
                      />
                    </div>
                  </td>

                  {/* ✅ Nombre de cuenta — input en pantalla, texto en impresión */}
                  <td>
                    <span className="print-only-text">{line.accountDetail}</span>
                    <input
                      value={line.accountDetail}
                      readOnly
                      placeholder="Nombre de la cuenta"
                      className="read-only-detail screen-only"
                    />
                  </td>

                  {/* ✅ Detalle específico — input en pantalla, texto en impresión */}
                  <td>
                    <span className="print-only-text">{line.specificDetail}</span>
                    <input
                      value={line.specificDetail}
                      onChange={(e) => handleDetailChange(groupIndex, lineIndex, e.target.value)}
                      placeholder="Ej: Compra de mercancía"
                      className="screen-only"
                    />
                  </td>

                  {/* ✅ Debe — input en pantalla, texto alineado en impresión */}
                  <td style={{ textAlign: "right" }}>
                    <span className="print-only-text">
                      {line.debit > 0 ? formatCurrency(line.debit) : ""}
                    </span>
                    <input
                      type="text"
                      className={`journal-entry-input screen-only ${line.isAutoBalanced ? "auto-balanced" : ""}`}
                      value={line.debitRaw}
                      onChange={(e) => handleAmountChange(groupIndex, lineIndex, "debit", e.target.value)}
                      onFocus={() => handleAmountFocus(groupIndex, lineIndex, "debit")}
                      onBlur={() => handleAmountBlur(groupIndex, lineIndex, "debit")}
                      placeholder="0.00"
                    />
                  </td>

                  {/* ✅ Haber — input en pantalla, texto alineado en impresión */}
                  <td style={{ textAlign: "right" }}>
                    <span className="print-only-text">
                      {line.credit > 0 ? formatCurrency(line.credit) : ""}
                    </span>
                    <input
                      type="text"
                      className={`journal-entry-input screen-only ${line.isAutoBalanced ? "auto-balanced" : ""}`}
                      value={line.creditRaw}
                      onChange={(e) => handleAmountChange(groupIndex, lineIndex, "credit", e.target.value)}
                      onFocus={() => handleAmountFocus(groupIndex, lineIndex, "credit")}
                      onBlur={() => handleAmountBlur(groupIndex, lineIndex, "credit")}
                      placeholder="0.00"
                    />
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => removeLineFromGroup(groupIndex, lineIndex)}
                      className="remove-line-btn"
                      title="Quitar línea"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className={`totals-bar ${isBalanced && totalDebit > 0 ? "balanced" : "unbalanced"}`}>
        <span>Debe: {formatCurrency(totalDebit)}</span>
        <span>Haber: {formatCurrency(totalCredit)}</span>
        <span>{isBalanced && totalDebit > 0 ? "✅ Balanceado" : "⚠️ No balanceado"}</span>
      </div>

      <div className="button-group">
        <button type="button" className="secondary" onClick={addEntryGroup}>
          + Nuevo Asiento
        </button>
        <PrintButton />
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving || !isBalanced || totalDebit === 0}
        >
          {isSaving ? "Guardando..." : "Guardar y Continuar"}
        </button>
      </div>
    </div>
  );
}

export default JournalEntries;