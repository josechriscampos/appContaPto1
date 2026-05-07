// frontend/src/pages/BookDetail.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecords } from "../context/useRecords";
import { useBooks } from "../context/BookProvider";
import { useToast } from "../context/useToast";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setActiveRecordId, addRecord, deleteRecord, setCurrency } = useRecords();
  const { getBookRecords, incrementBookCount } = useBooks();
  const { showToast } = useToast();

  const [book, setBook]               = useState(null);
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Formulario nuevo registro
  const [name, setName]                       = useState("");
  const [date, setDate]                       = useState("");
  const [description, setDescription]         = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("CRC");
  const [isCreating, setIsCreating]           = useState(false);

  const loadBook = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookRecords(parseInt(id));
      setBook(data.book);
      setRecords(data.records);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line

  useEffect(() => { loadBook(); }, [loadBook]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const newRecord = await addRecord({
        name,
        date,
        description,
        companyName: book?.companyName || null,
        companyId:   book?.companyId   || null,
        bookId: parseInt(id),
      });
      setCurrency(selectedCurrency);
      setActiveRecordId(newRecord.id);
      incrementBookCount(parseInt(id));
      showToast(`Registro "${name}" creado.`, "success");
      navigate("/asientos");
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      showToast("No se pudo crear el registro.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenRecord = (recordId) => {
    setActiveRecordId(recordId);
    navigate("/asientos");
  };

  const handleDeleteRecord = async () => {
    try {
      await deleteRecord(confirmDeleteId);
      setRecords((prev) => prev.filter((r) => r.id !== confirmDeleteId));
      showToast("Registro eliminado.", "info");
    } catch {
      showToast("No se pudo eliminar el registro.", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return <div className="container"><p>Cargando libro...</p></div>;
  }

  return (
    <div className="dashboard">

      {/* ── Encabezado del libro ── */}
      <div className="dashboard-header">
        <div>
          <button
            className="secondary"
            style={{ marginBottom: "12px", padding: "6px 14px", fontSize: "0.85rem" }}
            onClick={() => navigate("/")}
          >
            ← Mis Libros
          </button>
          <h1 className="dashboard-title">📒 {book?.name}</h1>
          {book?.companyName && (
            <p className="dashboard-subtitle">
              {book.companyName}
              {book.companyId && ` · ${book.companyId}`}
            </p>
          )}
        </div>
        <button className="dashboard-new-btn" onClick={() => setShowNewRecord(true)}>
          + Nuevo Registro
        </button>
      </div>

      {/* ── Formulario nuevo registro ── */}
      {showNewRecord && (
        <div className="book-form-card">
          <h3 style={{ marginBottom: "16px", textAlign: "left" }}>Nuevo Registro Contable</h3>
          <form onSubmit={handleCreateRecord}>
            <div className="book-form-grid">
              <div>
                <label className="settings-label">Nombre del Registro *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Enero 2026"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="settings-label">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="settings-label">Moneda</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  <option value="CRC">Colón Costarricense (₡)</option>
                  <option value="USD">Dólar Estadounidense ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="settings-label">Descripción</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional..."
                />
              </div>
            </div>
            <div className="button-group" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowNewRecord(false)}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button type="submit" disabled={isCreating}>
                {isCreating ? "Creando..." : "Crear y Continuar"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Confirmación eliminar registro ── */}
      {confirmDeleteId && (
        <div className="confirm-dialog">
          <p>¿Eliminar este registro y todos sus asientos? Esta acción es permanente.</p>
          <div className="confirm-actions">
            <button onClick={handleDeleteRecord} className="btn-danger">Sí, eliminar</button>
            <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Lista de registros del libro ── */}
      <div className="dashboard-records">
        <h2 className="dashboard-section-title">
          Registros — {records.length} {records.length === 1 ? "registro" : "registros"}
        </h2>

        {records.length === 0 ? (
          <div className="dashboard-empty">
            <p>Este libro no tiene registros aún.</p>
            <button onClick={() => setShowNewRecord(true)}>
              + Crear primer registro
            </button>
          </div>
        ) : (
          <div className="dashboard-records-list">
            {records.map((record) => {
              const entryCount = record._count?.entries ?? 0;
              return (
                <div key={record.id} className="dashboard-record-item">
                  <div
                    className="dashboard-record-info"
                    onClick={() => handleOpenRecord(record.id)}
                  >
                    <div className="dashboard-record-name">
                      {record.name}
                    </div>
                    <div className="dashboard-record-meta">
                      {record.date
                        ? new Date(record.date).toLocaleDateString("es-CR", {
                            year: "numeric", month: "long", day: "numeric",
                          })
                        : "Sin fecha"}
                      {" · "}
                      {entryCount} {entryCount === 1 ? "asiento" : "asientos"}
                    </div>
                  </div>
                  <div className="dashboard-record-actions">
                    <button
                      onClick={() => handleOpenRecord(record.id)}
                      className="dashboard-btn-open"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(record.id); }}
                      className="dashboard-btn-delete"
                      title="Eliminar registro"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookDetail;