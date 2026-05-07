// frontend/src/context/BookProvider.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import API from "../api/axios";

const BookContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error("useBooks debe usarse dentro de BookProvider");
  return context;
};

export const BookProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/books");
      setBooks(res.data);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error al cargar libros:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchBooks();
    else setBooks([]);
  }, [isAuthenticated, fetchBooks]);

  const createBook = async (data) => {
    const res = await API.post("/books", data);
    const newBook = { ...res.data, _count: { records: 0 } };
    setBooks((prev) => [newBook, ...prev]);
    return res.data;
  };

  const updateBook = async (bookId, data) => {
    const res = await API.put(`/books/${bookId}`, data);
    setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, ...res.data } : b));
    return res.data;
  };

  const deleteBook = async (bookId) => {
    await API.delete(`/books/${bookId}`);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const getBookRecords = async (bookId) => {
    const res = await API.get(`/books/${bookId}/records`);
    return res.data; // { book, records }
  };

  // Actualiza el conteo de registros de un libro localmente
  const incrementBookCount = (bookId) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? { ...b, _count: { records: (b._count?.records ?? 0) + 1 } }
          : b
      )
    );
  };

  return (
    <BookContext.Provider value={{
      books, loading, fetchBooks,
      createBook, updateBook, deleteBook,
      getBookRecords, incrementBookCount,
    }}>
      {children}
    </BookContext.Provider>
  );
};