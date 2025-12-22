// frontend/src/pages/JournalEntries.jsx
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecords } from '../context/useRecords';
import { useChartOfAccounts } from '../context/useChartOfAccounts';
import API from '../api/axios';

const newEntryGroupTemplate = () => ({
  id: String(Date.now()),
  lines: [
    {
      id: String(Date.now() + 1),
      code: '',
      accountDetail: '',
      specificDetail: '',
      debit: 0,
      credit: 0,
      debitRaw: '',
      creditRaw: '',
      isAutoBalanced: false,
    },
    {
      id: String(Date.now() + 2),
      code: '',
      accountDetail: '',
      specificDetail: '',
      debit: 0,
      credit: 0,
      debitRaw: '',
      creditRaw: '',
      isAutoBalanced: false,
    },
  ],
});

const formatCurrency = (decimalValue) => {
  const number = Number(decimalValue) || 0;
  return new Intl.NumberFormat('es-CR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

// Parseamos lo que escribe el usuario: acepta "150000", "150000.50", "150000,50"
const parseAmount = (rawValue) => {
  if (!rawValue) return 0;

  const cleaned = rawValue
    .toString()
    .replace(/\s/g, '')
    .replace(/[^\d.,-]/g, '') // dejamos solo dígitos, coma, punto y signo
    .replace(',', '.');

  const parsed = parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

function JournalEntries() {
  const {
    activeRecord,
    updateRecordEntries,
    currency,
    draftEntries,
    setDraftEntries,
  } = useRecords();
  const { accounts } = useChartOfAccounts();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const initialEntries = useMemo(() => [newEntryGroupTemplate()], []);
  const entries =
    draftEntries && draftEntries.length > 0 ? draftEntries : initialEntries;

  // Solo cuentas de detalle
  const detailAccounts = useMemo(
    () => accounts.filter((acc) => acc.levelType === 'Detalle'),
    [accounts]
  );

  const accountsMap = useMemo(
    () => new Map(detailAccounts.map((acc) => [acc.code, acc.name])),
    [detailAccounts]
  );

  const periodTitle = useMemo(() => {
    if (!activeRecord?.date) return '';
    const date = new Date(activeRecord.date);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + userTimezoneOffset);

    return localDate.toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [activeRecord?.date]);

  const updateAndBalanceEntries = (updatedEntries) => {
    updatedEntries.forEach((group) => {
      // Limpiamos marca de autobalanceo antes de recalcular
      group.lines.forEach((line) => {
        if (line.isAutoBalanced) {
          line.debit = 0;
          line.credit = 0;
          line.debitRaw = '';
          line.creditRaw = '';
          line.isAutoBalanced = false;
        }
      });

      let debitTotal = 0;
      let creditTotal = 0;
      const emptyLines = [];

      group.lines.forEach((line, index) => {
        debitTotal += line.debit;
        creditTotal += line.credit;

        if (
          line.debit === 0 &&
          line.credit === 0 &&
          line.code.trim() !== ''
        ) {
          emptyLines.push(index);
        }
      });

      // Si solo hay una línea "vacía" con código, la usamos para cuadrar
      if (emptyLines.length === 1) {
        const balanceIndex = emptyLines[0];
        const difference = Math.abs(debitTotal - creditTotal);
        const lineToBalance = group.lines[balanceIndex];

        if (difference > 0) {
          if (debitTotal > creditTotal) {
            lineToBalance.credit = difference;
            lineToBalance.creditRaw = formatCurrency(difference);
            lineToBalance.debit = 0;
            lineToBalance.debitRaw = '';
          } else {
            lineToBalance.debit = difference;
            lineToBalance.debitRaw = formatCurrency(difference);
            lineToBalance.credit = 0;
            lineToBalance.creditRaw = '';
          }
          lineToBalance.isAutoBalanced = true;
        }
      }
    });

    setDraftEntries(updatedEntries);
  };

  const handleCodeChange = (groupIndex, lineIndex, code) => {
    const updatedEntries = JSON.parse(JSON.stringify(entries));
    const line = updatedEntries[groupIndex].lines[lineIndex];

    line.code = code;
    line.accountDetail = accountsMap.get(code) || '';

    updateAndBalanceEntries(updatedEntries);
  };

  // === AQUÍ METEMOS LA LÓGICA DE IVA PARA CANTIDADES GRANDES ===
  const handleAmountChange = (groupIndex, lineIndex, field, rawValue) => {
    const updatedEntries = JSON.parse(JSON.stringify(entries));
    const group = updatedEntries[groupIndex];
    const line = group.lines[lineIndex];

    // Cada vez que el usuario escribe, esa línea deja de ser "autobalanceada"
    line.isAutoBalanced = false;

    const trimmed = rawValue.toString().trim();
    const isPercentage = trimmed.endsWith('%');
    const isIvaAccount = line.code === '2.1.1.2'; // Impuesto de Ventas por Pagar (tu cuenta de IVA)

    // Caso especial: el usuario escribe "13%" en la línea de IVA
    if (isPercentage && isIvaAccount) {
      // 1. Obtenemos el número del porcentaje (ej. "13,5%" -> 13.5)
      const match = trimmed.match(/(\d+(?:[.,]\d+)?)/);
      const percentNumber = match
        ? parseFloat(match[1].replace(',', '.'))
        : 0;
      const factor = percentNumber / 100;

      // 2. Buscamos una línea base en el mismo asiento (de arriba hacia abajo)
      let baseAmount = 0;
      for (let i = lineIndex - 1; i >= 0; i -= 1) {
        const candidate = group.lines[i];
        if (candidate.debit > 0 || candidate.credit > 0) {
          baseAmount = candidate.debit > 0 ? candidate.debit : candidate.credit;
          break;
        }
      }
      // Si no encontramos arriba, buscamos abajo
      if (baseAmount === 0) {
        for (let i = lineIndex + 1; i < group.lines.length; i += 1) {
          const candidate = group.lines[i];
          if (candidate.debit > 0 || candidate.credit > 0) {
            baseAmount =
              candidate.debit > 0 ? candidate.debit : candidate.credit;
            break;
          }
        }
      }

      // 3. Si tenemos base y porcentaje, calculamos IVA normal (sin dividir de más)
      if (baseAmount > 0 && factor > 0) {
        const ivaAmount = +(baseAmount * factor).toFixed(2); // ej. 150000 * 0.13 = 19500.00

        if (field === 'debit') {
          line.debit = ivaAmount;
          line.debitRaw = formatCurrency(ivaAmount);
          line.credit = 0;
          line.creditRaw = '';
        } else {
          line.credit = ivaAmount;
          line.creditRaw = formatCurrency(ivaAmount);
          line.debit = 0;
          line.debitRaw = '';
        }

        updateAndBalanceEntries(updatedEntries);
        return;
      }
      // Si no encontramos base, caemos al comportamiento normal (no rompemos nada)
    }

    // ==== COMPORTAMIENTO NORMAL (sin IVA especial) ====
    const amount = parseAmount(rawValue);

    if (field === 'debit') {
      line.debit = amount;
      line.debitRaw = rawValue;

      if (amount > 0) {
        line.credit = 0;
        line.creditRaw = '';
      }
    } else {
      line.credit = amount;
      line.creditRaw = rawValue;

      if (amount > 0) {
        line.debit = 0;
        line.debitRaw = '';
      }
    }

    updateAndBalanceEntries(updatedEntries);
  };

  const handleDetailChange = (groupIndex, lineIndex, value) => {
    const updatedEntries = JSON.parse(JSON.stringify(entries));
    updatedEntries[groupIndex].lines[lineIndex].specificDetail = value;
    setDraftEntries(updatedEntries);
  };

  const addLineToGroup = (groupIndex) => {
    const updatedEntries = JSON.parse(JSON.stringify(entries));
    updatedEntries[groupIndex].lines.push({
      id: String(Date.now()),
      code: '',
      accountDetail: '',
      specificDetail: '',
      debit: 0,
      credit: 0,
      debitRaw: '',
      creditRaw: '',
      isAutoBalanced: false,
    });
    updateAndBalanceEntries(updatedEntries);
  };

  const removeLineFromGroup = (groupIndex, lineIndex) => {
    const updatedEntries = JSON.parse(JSON.stringify(entries));
    const group = updatedEntries[groupIndex];

    if (group.lines.length <= 2) {
      alert('Un asiento debe tener al menos dos líneas.');
      return;
    }

    group.lines.splice(lineIndex, 1);
    updateAndBalanceEntries(updatedEntries);
  };

  const addEntryGroup = () => {
    setDraftEntries([...entries, newEntryGroupTemplate()]);
  };

  const removeEntryGroup = (groupIndex) => {
    if (entries.length > 1) {
      const updatedEntries = entries.filter((_, index) => index !== groupIndex);
      setDraftEntries(updatedEntries);
    } else {
      setDraftEntries([newEntryGroupTemplate()]);
    }
  };

  const { totalDebit, totalCredit } = useMemo(
    () =>
      entries.reduce(
        (totals, group) => {
          group.lines.forEach((line) => {
            totals.totalDebit += line.debit;
            totals.totalCredit += line.credit;
          });
          return totals;
        },
        { totalDebit: 0, totalCredit: 0 }
      ),
    [entries]
  );

  const handleSaveChanges = async () => {
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    if (!activeRecord || !isBalanced || totalDebit === 0) {
      alert('El asiento no está balanceado o está vacío. Revise los totales.');
      return;
    }

    setIsSaving(true);

    try {
      const entriesToSave = entries.flatMap((group) =>
        group.lines
          .filter(
            (line) =>
              line.code.trim() !== '' &&
              (line.debit > 0 || line.credit > 0)
          )
          .map((line) => {
            const restOfLine = { ...line };
            delete restOfLine.isAutoBalanced;
            delete restOfLine.debitRaw;
            delete restOfLine.creditRaw;

            return { ...restOfLine, entryGroupId: group.id };
          })
      );

      await API.put(`/records/${activeRecord.id}/entries`, entriesToSave);
      updateRecordEntries(activeRecord.id, entriesToSave);
      setDraftEntries([]);
      console.log('¡Asientos guardados! Navegando a Cuentas T...');
      navigate('/cuentas-t');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeRecord) {
    return (
      <div className="container">
        <p>No hay un registro seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h3>{activeRecord.name}</h3>
      <h2>Asientos de Diario</h2>
      {periodTitle && (
        <h4 className="period-title">
          Para el período del {periodTitle}
        </h4>
      )}

      {/* Sugerencias para códigos de cuenta (solo detalle) */}
      <datalist id="account-codes">
        {detailAccounts.map((acc) => (
          <option key={acc.code} value={acc.code}>
            {acc.code} - {acc.name}
          </option>
        ))}
      </datalist>

      {entries.map((group, groupIndex) => (
        <div className="entry-group" key={group.id}>
          <div className="entry-group-header">
            <h4>Asiento N° {groupIndex + 1}</h4>
            <div className="group-actions">
              <button
                onClick={() => addLineToGroup(groupIndex)}
                className="secondary"
              >
                + Agregar línea
              </button>
              {entries.length > 1 && (
                <button
                  onClick={() => removeEntryGroup(groupIndex)}
                  className="danger"
                >
                  Eliminar Asiento
                </button>
              )}
            </div>
          </div>

          <table className="entry-table">
            <thead>
              {groupIndex === 0 && (
                <tr>
                  <th style={{ width: '12%' }}>Código</th>
                  <th style={{ width: '25%' }}>Nombre de Cuenta</th>
                  <th style={{ width: '28%' }}>Detalle Específico</th>
                  <th style={{ width: '15%' }}>Debe ({currency})</th>
                  <th style={{ width: '15%' }}>Haber ({currency})</th>
                  <th style={{ width: '5%' }}></th>
                </tr>
              )}
            </thead>
            <tbody>
              {group.lines.map((line, lineIndex) => (
                <tr key={line.id}>
                  <td>
                     <div className="code-input-wrapper">
                      <input
                        list="account-codes"
                        className="code-input"
                        value={line.code}
                        onChange={(e) =>
                          handleCodeChange(
                            groupIndex,
                            lineIndex,
                            e.target.value
                          )
                        }
                        placeholder="Código"
                      />
                    </div>
                  </td>
                  <td>
                    <input
                      value={line.accountDetail}
                      readOnly
                      placeholder="Nombre de la cuenta"
                      className="read-only-detail"
                    />
                  </td>
                  <td>
                    <input
                      value={line.specificDetail}
                      onChange={(e) =>
                        handleDetailChange(
                          groupIndex,
                          lineIndex,
                          e.target.value
                        )
                      }
                      placeholder="Ej: Compra de mercancía"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={`journal-entry-input ${
                        line.isAutoBalanced ? 'auto-balanced' : ''
                      }`}
                      value={line.debitRaw}
                      onChange={(e) =>
                        handleAmountChange(
                          groupIndex,
                          lineIndex,
                          'debit',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className={`journal-entry-input ${
                        line.isAutoBalanced ? 'auto-balanced' : ''
                      }`}
                      value={line.creditRaw}
                      onChange={(e) =>
                        handleAmountChange(
                          groupIndex,
                          lineIndex,
                          'credit',
                          e.target.value
                        )
                      }
                      placeholder="0.00"
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() =>
                        removeLineFromGroup(groupIndex, lineIndex)
                      }
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

      <div className="button-group">
        <button
          type="button"
          className="secondary"
          onClick={addEntryGroup}
        >
          + Nuevo Asiento
        </button>
        <button
          type="button"
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : 'Guardar y Continuar'}
        </button>
      </div>
    </div>
  );
}

export default JournalEntries;
