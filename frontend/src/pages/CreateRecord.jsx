// frontend/src/pages/CreateRecord.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useToast } from "../context/useToast";

function CreateRecord() {
  const [name,             setName]             = useState("");
  const [date,             setDate]             = useState("");
  const [description,      setDescription]      = useState("");
  const [companyName,      setCompanyName]      = useState(""); // ← nuevo
  const [companyId,        setCompanyId]        = useState(""); // ← nuevo
  const [selectedCurrency, setSelectedCurrency] = useState("CRC");
  const [error,            setError]            = useState("");
  const [deleteError,      setDeleteError]      = useState("");
  const [confirmDeleteId,  setConfirmDeleteId]  = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { records, addRecord, setActiveRecordId, loading, deleteRecord, setCurrency } = useRecords();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor, ingresa un nombre para el registro.");
      return;
    }

    try {
      const newRecord = await addRecord({
        name,
        date,
        description,
        companyName, // ← nuevo
        companyId,   // ← nuevo
      });
      if (newRecord) {
        showToast(`Registro "${name}" creado exitosamente.`, "success");
        setActiveRecordId(newRecord.id);
        setCurrency(selectedCurrency);
        navigate("/asientos");
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setError("No se pudo crear el registro. Intenta de nuevo.");
      showToast("No se pudo crear el registro.", "error");
    }
  };

  const handleRecentClick = (recordId) => {
    setActiveRecordId(recordId);
    navigate("/asientos");
  };

  const handleDeleteClick = (e, recordId) => {
    e.stopPropagation();
    setConfirmDeleteId(recordId);
  };

  const confirmDelete = async () => {
    try {
      await deleteRecord(confirmDeleteId);
      setDeleteError("");
      showToast("Registro eliminado.", "info");
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      setDeleteError("No se pudo eliminar el registro.");
      showToast("No se pudo eliminar el registro.", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="main-layout">
      <div className="container form-container">
        <h2>Crear un Registro Contable</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Nombre del Registro</th>
                <th>Fecha</th>
                <th>Moneda</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Cierre Fiscal Enero 2025"
                    required
                  />
                </td>
                <td>
                  <input
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                  />
                </td>
                <td>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                  >
                    <option value="CRC">Colón Costarricense (₡)</option>
                    <option value="USD">Dólar Estadounidense ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </td>
                <td>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción detallada..."
                    rows="3"
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* ✅ Datos de la empresa cliente */}
          <table style={{ marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Nombre de la Empresa Cliente</th>
                <th>Cédula Jurídica / RUC</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej: Empresa AMC S.A."
                    maxLength={100}
                  />
                </td>
                <td>
                  <input
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    placeholder="Ej: 3-101-123456"
                    maxLength={20}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="button-group">
            <button type="submit">Agregar y Continuar</button>
          </div>
        </form>
      </div>

      <div className="container sidebar-container">
        <h2>Registros Recientes</h2>

        {deleteError && <p className="error-message">{deleteError}</p>}

        {confirmDeleteId && (
          <div className="confirm-dialog">
            <p>¿Eliminar este registro? Esta acción es permanente.</p>
            <div className="confirm-actions">
              <button onClick={confirmDelete} className="btn-danger">
                Sí, eliminar
              </button>
              <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="recent-records-list">
          {loading ? (
            <p>Cargando registros...</p>
          ) : records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="recent-record-item">
                <button
                  onClick={() => handleRecentClick(record.id)}
                  className="secondary"
                >
                  {record.name}
                  {record.companyName && (
                    <span style={{ display: "block", fontSize: "0.75rem", opacity: 0.7 }}>
                      {record.companyName}
                    </span>
                  )}
                </button>
                <button
                  onClick={(e) => handleDeleteClick(e, record.id)}
                  className="delete-record-btn"
                  title="Eliminar registro"
                >
                  &times;
                </button>
              </div>
            ))
          ) : (
            <p>No hay registros recientes.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateRecord;