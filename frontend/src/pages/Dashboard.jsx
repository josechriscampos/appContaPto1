// frontend/src/pages/Dashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooks } from "../context/BookProvider";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";

function Dashboard() {
  const { books, loading, createBook, deleteBook } = useBooks();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch]             = useState("");
  const [showNewBook, setShowNewBook]   = useState(false);
  const [bookName, setBookName]         = useState("");
  const [companyName, setCompanyName]   = useState("");
  const [companyId, setCompanyId]       = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isCreating, setIsCreating]     = useState(false);

  const filteredBooks = books.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!bookName.trim()) return;
    setIsCreating(true);
    try {
      const newBook = await createBook({
        name: bookName,
        companyName,
        companyId,
      });
      showToast(`Libro "${newBook.name}" creado exitosamente.`, "success");
      setBookName(""); setCompanyName(""); setCompanyId("");
      setShowNewBook(false);
      navigate(`/libros/${newBook.id}`);
    } catch (err) {
      if (import.meta.env.DEV) console.error(err);
      showToast("No se pudo crear el libro.", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteBook(confirmDeleteId);
      showToast("Libro eliminado.", "info");
    } catch {
      showToast("No se pudo eliminar el libro.", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="dashboard">

      {/* ── Bienvenida ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Bienvenido{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="dashboard-subtitle">
            Selecciona un libro para ver sus registros contables
          </p>
        </div>
        <button className="dashboard-new-btn" onClick={() => setShowNewBook(true)}>
          + Nuevo Libro
        </button>
      </div>

      {/* ── Formulario nuevo libro ── */}
      {showNewBook && (
        <div className="book-form-card">
          <h3 style={{ marginBottom: "16px", textAlign: "left" }}>Nuevo Libro Contable</h3>
          <form onSubmit={handleCreateBook}>
            <div className="book-form-grid">
              <div>
                <label className="settings-label">Nombre del Libro *</label>
                <input
                  value={bookName}
                  onChange={(e) => setBookName(e.target.value)}
                  placeholder="Ej: Empresa AMC S.A. — 2026"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="settings-label">Nombre de la Empresa</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ej: Empresa AMC S.A."
                />
              </div>
              <div>
                <label className="settings-label">Cédula Jurídica / RUC</label>
                <input
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Ej: 3-101-123456"
                />
              </div>
            </div>
            <div className="button-group" style={{ marginTop: "16px" }}>
              <button
                type="button"
                className="secondary"
                onClick={() => setShowNewBook(false)}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button type="submit" disabled={isCreating}>
                {isCreating ? "Creando..." : "Crear Libro"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Confirmación eliminar ── */}
      {confirmDeleteId && (
        <div className="confirm-dialog">
          <p>¿Eliminar este libro y todos sus registros? Esta acción es permanente.</p>
          <div className="confirm-actions">
            <button onClick={handleDeleteBook} className="btn-danger">Sí, eliminar</button>
            <button onClick={() => setConfirmDeleteId(null)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Lista de libros ── */}
      <div className="dashboard-records">
        <h2 className="dashboard-section-title">📒 Mis Libros Contables</h2>

        {books.length > 0 && (
          <div className="dashboard-search">
            <input
              type="text"
              placeholder="🔍 Buscar libro por nombre o empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="dashboard-search-input"
            />
          </div>
        )}

        {loading ? (
          <p className="dashboard-empty">Cargando libros...</p>
        ) : books.length === 0 ? (
          <div className="dashboard-empty">
            <p>No tienes libros contables aún.</p>
            <button onClick={() => setShowNewBook(true)}>
              + Crear primer libro
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="dashboard-empty">
            <p>No se encontraron libros con "{search}".</p>
          </div>
        ) : (
          <div className="dashboard-records-list">
            {filteredBooks.map((book) => {
              const recordCount = book._count?.records ?? 0;
              return (
                <div key={book.id} className="dashboard-record-item">
                  <div
                    className="dashboard-record-info"
                    onClick={() => navigate(`/libros/${book.id}`)}
                  >
                    <div className="dashboard-record-name">
                      📒 {book.name}
                    </div>
                    <div className="dashboard-record-meta">
                      {book.companyName && <span>{book.companyName}</span>}
                      {book.companyName && book.companyId && <span> · </span>}
                      {book.companyId && <span>{book.companyId}</span>}
                      {(book.companyName || book.companyId) && <span> · </span>}
                      <span>{recordCount} {recordCount === 1 ? "registro" : "registros"}</span>
                    </div>
                  </div>
                  <div className="dashboard-record-actions">
                    <button
                      onClick={() => navigate(`/libros/${book.id}`)}
                      className="dashboard-btn-open"
                    >
                      Abrir
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(book.id); }}
                      className="dashboard-btn-delete"
                      title="Eliminar libro"
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

export default Dashboard;