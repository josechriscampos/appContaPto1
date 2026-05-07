// frontend/src/pages/ChartOfAccounts.jsx
import { useState } from "react";
import { useChartOfAccounts } from "../context/useChartOfAccounts";
import { useToast } from "../context/useToast"; // ← nuevo

const getIndentation = (code) => {
  if (!code) return 0;
  const level = code.split(".").length;
  if (level <= 1) return 0;
  if (level === 2) return 20;
  if (level === 3) return 40;
  return 60;
};

const getCategoryFromCode = (code) => {
  if (!code) return "Indefinida";
  switch (code.charAt(0)) {
    case "1": return "Activo";
    case "2": return "Pasivo";
    case "3": return "Capital";
    case "4": return "Ingresos";
    case "5": return "Gastos";
    case "6": return "Costo de Ventas";
    case "7": return "Cuentas de Orden";
    default:  return "Indefinida";
  }
};

function ChartOfAccounts() {
  const { accounts, loading, error, saveChartOfAccounts, reloadAccounts } =
    useChartOfAccounts();
  const { showToast } = useToast(); // ← nuevo

  const [isEditing, setIsEditing]         = useState(false);
  const [localAccounts, setLocalAccounts] = useState([]);
  const [saveError, setSaveError]         = useState("");
  const [isSaving, setIsSaving]           = useState(false);

  const handleStartEditing = () => {
    setLocalAccounts(structuredClone(accounts));
    setSaveError("");
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setLocalAccounts([]);
    setSaveError("");
    setIsEditing(false);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...localAccounts];
    const account = { ...updated[index] };
    account[field] = value;
    if (field === "code") account.category = getCategoryFromCode(value);
    if (field === "levelType") account.type = value === "Detalle" ? "detail" : "group";
    updated[index] = account;
    setLocalAccounts(updated);
  };

  const addAccountAtIndex = (index) => {
    const parentAccount = localAccounts[index];
    const newAccount = {
      id: `new-${Date.now()}`,
      code: "",
      name: "",
      type: "detail",
      category: parentAccount.category,
      levelType: "Detalle",
    };
    const updated = [...localAccounts];
    updated.splice(index + 1, 0, newAccount);
    setLocalAccounts(updated);
  };

  const addHeaderAccount = () => {
    setLocalAccounts([
      ...localAccounts,
      {
        id: `new-${Date.now()}`,
        code: "",
        name: "",
        type: "group",
        category: "Indefinida",
        levelType: "Control",
      },
    ]);
  };

  const removeAccountAtIndex = (indexToRemove) => {
    setLocalAccounts(localAccounts.filter((_, i) => i !== indexToRemove));
  };

  const handleSaveChanges = async () => {
    setSaveError("");

    const accountsToSave = localAccounts.filter(
      (acc) => acc.code.trim() !== "" && acc.name.trim() !== ""
    );

    const seenCodes = new Set();
    for (const account of accountsToSave) {
      if (seenCodes.has(account.code)) {
        const msg = `El código "${account.code}" está duplicado. Corrígelo antes de guardar.`;
        setSaveError(msg);
        showToast(msg, "warning"); // ← nuevo
        return;
      }
      seenCodes.add(account.code);
    }

    const sortedAccounts = [...accountsToSave].sort((a, b) => {
      const codeA = a.code.split(".").map(Number);
      const codeB = b.code.split(".").map(Number);
      const maxLength = Math.max(codeA.length, codeB.length);
      for (let i = 0; i < maxLength; i++) {
        const valA = codeA[i] || 0;
        const valB = codeB[i] || 0;
        if (valA < valB) return -1;
        if (valA > valB) return 1;
      }
      return a.code.length - b.code.length;
    });

    setIsSaving(true);
    try {
      await saveChartOfAccounts(sortedAccounts);
      showToast("Catálogo guardado exitosamente.", "success"); // ← nuevo
      setLocalAccounts([]);
      setIsEditing(false);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setSaveError("No se pudo guardar el catálogo. Intenta de nuevo.");
      showToast("No se pudo guardar el catálogo.", "error"); // ← nuevo
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="container"><h2>Cargando Catálogo de Cuentas...</h2></div>;
  }

  if (error && !isEditing) {
    return (
      <div className="container">
        <h2>Catálogo de Cuentas</h2>
        <p className="error-message">{error}</p>
        <button onClick={reloadAccounts}>Reintentar</button>
      </div>
    );
  }

  const displayAccounts = isEditing ? localAccounts : accounts;

  return (
    <div className="container container--narrow">
      <div className="catalog-header">
        <h2>Catálogo de Cuentas</h2>
        <div className="catalog-actions">
          {isEditing ? (
            <>
              <button type="button" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar Catálogo"}
              </button>
              <button type="button" className="secondary" onClick={handleCancelEditing} disabled={isSaving}>
                Cancelar
              </button>
            </>
          ) : (
            <button type="button" onClick={handleStartEditing}>
              Editar Catálogo
            </button>
          )}
        </div>
      </div>

      {saveError && <p className="error-message">{saveError}</p>}

      <div className="table-wrapper">
        <table className="catalog-table">
          <thead>
            <tr>
              <th style={{ width: "25%" }}>Código</th>
              <th style={{ width: "55%" }}>Nombre de la Cuenta</th>
              <th style={{ width: "20%", textAlign: "center" }}>
                {isEditing ? "Acciones" : "Clasificación"}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayAccounts.map((account, index) => {
              const isHeader = account.code.split(".").length === 1;
              const indentation = getIndentation(account.code);
              const rowClassName = `catalog-row ${isHeader && !isEditing ? "header-view" : ""}`;

              if (isHeader && !isEditing) {
                return (
                  <tr key={account.id || index} className={rowClassName}>
                    <td colSpan="3">{account.code} - {account.name}</td>
                  </tr>
                );
              }

              return (
                <tr key={account.id || index} className={rowClassName}>
                  <td>
                    <input
                      style={{ paddingLeft: `${indentation}px` }}
                      value={account.code}
                      onChange={(e) => handleInputChange(index, "code", e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Código"
                      autoFocus={String(account.id).startsWith("new-")}
                    />
                  </td>
                  <td>
                    <input
                      style={{
                        paddingLeft: `${indentation}px`,
                        fontWeight: account.levelType === "Control" || isHeader ? "600" : "400",
                      }}
                      value={account.name}
                      onChange={(e) => handleInputChange(index, "name", e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Nombre de la cuenta"
                    />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {isEditing ? (
                      <div className="catalog-row-actions">
                        {!isHeader && (
                          <select
                            value={account.levelType}
                            onChange={(e) => handleInputChange(index, "levelType", e.target.value)}
                          >
                            <option value="Control">Control</option>
                            <option value="Detalle">Detalle</option>
                          </select>
                        )}
                        {account.levelType === "Control" && (
                          <button
                            onClick={() => addAccountAtIndex(index)}
                            className="catalog-add-btn"
                            title="Agregar sub-cuenta"
                          >
                            + Sub-cuenta
                          </button>
                        )}
                        <button
                          onClick={() => removeAccountAtIndex(index)}
                          className="catalog-delete-btn"
                          title="Eliminar cuenta"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <input value={account.levelType} readOnly disabled />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="button-group">
          <button type="button" className="secondary" onClick={addHeaderAccount}>
            + Agregar Categoría Principal
          </button>
        </div>
      )}
    </div>
  );
}

export default ChartOfAccounts;