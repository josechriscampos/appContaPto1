import React, { useState, useEffect, useCallback } from 'react';
import { RecordContext } from './useRecords';
import { useAuth } from './useAuth';
import API from '../api/axios';

export const RecordProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [records, setRecords] = useState([]);
    const [activeRecordId, setActiveRecordId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currency, setCurrency] = useState('CRC');

    const [draftEntries, setDraftEntries] = useState(null);

    const activeRecord = records.find(r => r.id === activeRecordId);

    // --- LÓGICA DE COMPATIBILIDAD FINAL Y CORRECTA ---
    useEffect(() => {
        try {
            if (activeRecord && activeRecord.entries) {
                // 1. "Actualizamos" cada línea individual al formato de edición
                const upgradedLines = activeRecord.entries.map(entry => {
                    if (entry.accountDetail) { // Ya tiene el formato nuevo
                        return entry;
                    }
                    if (typeof entry.detail === 'string') { // Formato viejo
                        const parts = entry.detail.split(' - ');
                        const accountDetail = parts[0] || '';
                        const specificDetail = parts.length > 1 ? parts.slice(1).join(' - ') : '';
                        return { ...entry, accountDetail, specificDetail };
                    }
                    return { ...entry, accountDetail: 'Error de Formato', specificDetail: '' };
                });

                // 2. Agrupamos las líneas. Los registros viejos no tienen 'entryGroupId',
                // por lo que los agruparemos todos en un único grupo por defecto.
                const grouped = upgradedLines.reduce((acc, line) => {
                    const groupId = line.entryGroupId || 'default-group';
                    if (!acc[groupId]) {
                        acc[groupId] = [];
                    }
                    acc[groupId].push(line);
                    return acc;
                }, {});

                // 3. Convertimos el objeto de grupos al array de grupos que espera JournalEntries
                const entryGroups = Object.keys(grouped).map(groupId => ({
                    id: groupId === 'default-group' ? Date.now() : groupId, // Aseguramos un ID único
                    lines: grouped[groupId]
                }));

                setDraftEntries(entryGroups);
            } else {
                setDraftEntries(null);
            }
        } catch (error) {
            console.error("Error al procesar los asientos del registro:", error);
            setDraftEntries([]); // Estado seguro y vacío para evitar un crash
        }
    }, [activeRecord]);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await API.get('/records');
            setRecords(res.data);
        } catch (error) {
            console.error("No se pudieron cargar los registros:", error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchRecords();
        } else {
            setRecords([]);
            setActiveRecordId(null);
            setDraftEntries(null);
        }
    }, [isAuthenticated, fetchRecords]);

    const addRecord = async (newRecordData) => {
        try {
            const res = await API.post('/records', newRecordData);
            const newRecord = res.data;
            setRecords(prevRecords => [newRecord, ...prevRecords]);
            return newRecord;
        } catch (error) {
            console.error("Error al crear el registro:", error);
            return null;
        }
    };
    
    const updateRecordEntries = (recordId, newEntriesFromJournal) => {
        const standardizedEntries = newEntriesFromJournal.map(entry => {
            const combinedDetail = entry.specificDetail
                ? `${entry.accountDetail} - ${entry.specificDetail}`
                : entry.accountDetail;
            
            return {
                ...entry,
                detail: combinedDetail,
            };
        });

        setRecords(prevRecords =>
            prevRecords.map(record =>
                record.id === recordId
                    ? { ...record, entries: standardizedEntries }
                    : record
            )
        );
    };

    const deleteRecord = async (recordId) => {
        try {
            await API.delete(`/records/${recordId}`);
            setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
            if (recordId === activeRecordId) {
                setActiveRecordId(null);
            }
        } catch (error) {
            console.error("Error al eliminar el registro:", error);
            alert("No se pudo eliminar el registro.");
        }
    };

    const value = {
        records,
        addRecord,
        activeRecord,
        setActiveRecordId,
        updateRecordEntries,
        deleteRecord,
        currency,
        setCurrency,
        loading,
        draftEntries,
        setDraftEntries,
    };

    return (
        <RecordContext.Provider value={value}>
            {children}
        </RecordContext.Provider>
    );
};

