// frontend/src/context/RecordProvider.jsx
import { useState, useEffect, useCallback } from "react";
import { RecordContext } from "./useRecords";
import { useAuth } from "./useAuth";
import API from "../api/axios";

const formatAmount = (value) => {
  const number = parseFloat(String(value)) || 0;
  if (number === 0) return "";
  return new Intl.NumberFormat("es-CR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const toNumber = (value) => parseFloat(String(value)) || 0;

export const RecordProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [records, setRecords] = useState([]);

  const [activeRecordId, setActiveRecordIdState] = useState(() => {
    const saved = localStorage.getItem("activeRecordId");
    return saved ? parseInt(saved) : null;
  });

  const [loading, setLoading]       = useState(false);
  const [currency, setCurrency]     = useState("CRC");
  const [draftEntries, setDraftEntries] = useState(null);

  const activeRecord = records.find((r) => r.id === activeRecordId);

  const loadEntriesForRecord = useCallback(async (recordId) => {
    if (!recordId) return;
    try {
      const res = await API.get(`/records/${recordId}/entries`);
      setRecords((prev) =>
        prev.map((r) => r.id === recordId ? { ...r, entries: res.data } : r)
      );
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error al cargar entries:", err);
    }
  }, []);

  const setActiveRecordId = useCallback((id) => {
    if (id) {
      localStorage.setItem("activeRecordId", id);
      loadEntriesForRecord(id);
    } else {
      localStorage.removeItem("activeRecordId");
    }
    setActiveRecordIdState(id);
  }, [loadEntriesForRecord]);

  useEffect(() => {
    if (activeRecordId && isAuthenticated) {
      loadEntriesForRecord(activeRecordId);
    }
  }, [isAuthenticated]); // eslint-disable-line

  useEffect(() => {
    try {
      if (activeRecord?.entries?.length > 0) {
        const upgradedLines = activeRecord.entries.map((entry) => {
          const debitNum  = toNumber(entry.debit);
          const creditNum = toNumber(entry.credit);

          let accountDetail  = entry.accountDetail || "";
          let specificDetail = entry.specificDetail || "";

          if (!accountDetail && typeof entry.detail === "string") {
            const parts = entry.detail.split(" - ");
            accountDetail  = parts[0] || "";
            specificDetail = parts.length > 1 ? parts.slice(1).join(" - ") : "";
          }

          return {
            ...entry,
            debit:  debitNum,
            credit: creditNum,
            debitRaw:  debitNum  > 0 ? formatAmount(debitNum)  : "",
            creditRaw: creditNum > 0 ? formatAmount(creditNum) : "",
            accountDetail,
            specificDetail,
            isAutoBalanced: false,
          };
        });

        const grouped = upgradedLines.reduce((acc, line) => {
          const groupId = line.entryGroupId || "default-group";
          if (!acc[groupId]) acc[groupId] = [];
          acc[groupId].push(line);
          return acc;
        }, {});

        const entryGroups = Object.keys(grouped).map((groupId) => ({
          id: groupId === "default-group" ? String(Date.now()) : groupId,
          title: "",
          lines: grouped[groupId],
        }));

        setDraftEntries(entryGroups);
      } else {
        setDraftEntries(null);
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error al procesar asientos:", err);
      setDraftEntries([]);
    }
  }, [activeRecord]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/records");
      setRecords(res.data);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error al cargar registros:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchRecords();
    else {
      setRecords([]);
      setActiveRecordIdState(null);
      localStorage.removeItem("activeRecordId");
      setDraftEntries(null);
    }
  }, [isAuthenticated, fetchRecords]);

  // ✅ Ahora acepta bookId opcional
  const addRecord = async (newRecordData) => {
    const res = await API.post("/records", newRecordData);
    const newRecord = res.data;
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  };

  const updateRecordEntries = (recordId, newEntriesFromJournal) => {
    const standardizedEntries = newEntriesFromJournal.map((entry) => ({
      ...entry,
      detail: entry.specificDetail
        ? `${entry.accountDetail} - ${entry.specificDetail}`
        : entry.accountDetail,
      debit:  toNumber(entry.debit),
      credit: toNumber(entry.credit),
      debitRaw:  toNumber(entry.debit)  > 0 ? formatAmount(entry.debit)  : "",
      creditRaw: toNumber(entry.credit) > 0 ? formatAmount(entry.credit) : "",
    }));

    setRecords((prev) =>
      prev.map((record) =>
        record.id === recordId ? { ...record, entries: standardizedEntries } : record
      )
    );
  };

  const deleteRecord = async (recordId) => {
    await API.delete(`/records/${recordId}`);
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (recordId === activeRecordId) setActiveRecordId(null);
  };

  return (
    <RecordContext.Provider value={{
      records, addRecord, activeRecord,
      setActiveRecordId, updateRecordEntries, deleteRecord,
      currency, setCurrency, loading,
      draftEntries, setDraftEntries,
    }}>
      {children}
    </RecordContext.Provider>
  );
};