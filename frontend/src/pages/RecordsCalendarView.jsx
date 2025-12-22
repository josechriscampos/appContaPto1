import React, { useState, useMemo } from 'react';
import { useRecords } from '../context/useRecords';
import { useNavigate } from 'react-router-dom';

// Componente para una tarjeta de registro individual dentro del calendario
const RecordEvent = ({ record, onSelect }) => {
    // Calcula el balance del registro para mostrar un estado visual
    const balance = useMemo(() => {
        if (!record.entries || record.entries.length === 0) return { totalDebit: 0, totalCredit: 0, isBalanced: true };
        
        const totals = record.entries.reduce((acc, entry) => {
            acc.totalDebit += Number(entry.debit) || 0;
            acc.totalCredit += Number(entry.credit) || 0;
            return acc;
        }, { totalDebit: 0, totalCredit: 0 });

        totals.isBalanced = Math.abs(totals.totalDebit - totals.totalCredit) < 0.01;
        return totals;
    }, [record.entries]);

    return (
        <div 
            className={`record-event ${balance.isBalanced ? 'balanced' : 'unbalanced'}`}
            onClick={() => onSelect(record.id)}
            title={balance.isBalanced ? 'Balance correcto' : 'Balance incorrecto'}
        >
            {record.name}
        </div>
    );
};

// Componente principal de la vista de calendario
function RecordsCalendarView() {
    const { records, setActiveRecordId } = useRecords();
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Agrupa los registros por fecha para un acceso rápido
    const groupedRecords = useMemo(() => {
        return records.reduce((acc, record) => {
            if (record.date) {
                const recordDate = new Date(record.date);
                const utcDate = new Date(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate());
                const dateKey = utcDate.toISOString().split('T')[0];

                if (!acc[dateKey]) {
                    acc[dateKey] = [];
                }
                acc[dateKey].push(record);
            }
            return acc;
        }, {});
    }, [records]);

    const handleSelectRecord = (recordId) => {
        setActiveRecordId(recordId);
        navigate('/asientos');
    };

    // --- NUEVA FUNCIÓN PARA NAVEGAR A LA PÁGINA DE GRÁFICOS ---
    const handleNavigateToAnalytics = () => {
        navigate('/graficos');
    };
    
    // Funciones para navegar entre meses
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // --- Lógica para generar el calendario ---
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div className="calendar-day empty" key={`empty-${i}`}></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = new Date(year, month, day).toISOString().split('T')[0];
        const dayRecords = groupedRecords[dateKey] || [];
        calendarDays.push(
            <div className="calendar-day" key={day}>
                <div className="day-number">{day}</div>
                <div className="events-container">
                    {dayRecords.map(record => (
                        <RecordEvent key={record.id} record={record} onSelect={handleSelectRecord} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container calendar-container">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <button onClick={goToPreviousMonth}>&lt;</button>
                    <button onClick={goToNextMonth}>&gt;</button>
                    <button onClick={goToToday} className="today-btn">Hoy</button>
                </div>
                <h2>{monthName}</h2>
                {/* --- APARTADO DE GRÁFICOS AHORA FUNCIONAL --- */}
                <div className="analytics-nav">
                    <button onClick={handleNavigateToAnalytics}>Regresar al Registro</button>
                </div>
            </div>
            <div className="calendar-grid">
                <div className="day-name">Dom</div>
                <div className="day-name">Lun</div>
                <div className="day-name">Mar</div>
                <div className="day-name">Mié</div>
                <div className="day-name">Jue</div>
                <div className="day-name">Vie</div>
                <div className="day-name">Sáb</div>
                {calendarDays}
            </div>
            {/* --- ESTILOS ACTUALIZADOS --- */}
            <style>{`
                .calendar-container { max-width: 1200px; }
                .calendar-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #eee; margin-bottom: 20px; }
                .calendar-header h2 { text-transform: capitalize; margin: 0; color: #333; }
                .calendar-nav, .analytics-nav { display: flex; gap: 10px; }
                
                /* --- ESTILO UNIFICADO PARA TODOS LOS BOTONES DEL ENCABEZADO --- */
                .calendar-header button {
                    background-color: #059669;
                    color: white;
                    border: 1px solid #047857;
                    border-radius: 4px;
                    padding: 5px 12px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                .calendar-header button:hover {
                    background-color: #047857;
                }
                .calendar-nav button.today-btn { font-weight: bold; }

                .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .day-name { font-weight: bold; text-align: center; padding: 10px; background-color: #059669; color: white; border-bottom: 1px solid #047857; }
                .calendar-day { min-height: 120px; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0; padding: 5px; position: relative; background: #fff; }
                .calendar-day:nth-child(7n) { border-right: none; }
                .calendar-day:nth-last-child(-n+7) { border-bottom: none; }
                .calendar-day.empty { background-color: #fafafa; }
                .day-number { font-size: 0.8rem; font-weight: bold; color: #777; text-align: right; margin-bottom: 5px; }
                .events-container { display: flex; flex-direction: column; gap: 4px; }
                .record-event { background-color: #dcfce7; border-left: 3px solid #10b981; border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; cursor: pointer; transition: background-color 0.2s; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #065f46; }
                .record-event:hover { background-color: #bbf7d0; }
                .record-event.unbalanced { background-color: #fce8e6; border-left-color: #d93025; color: #b91c1c; }
                .record-event.unbalanced:hover { background-color: #fbdadc; }
            `}</style>
        </div>
    );
}

export default RecordsCalendarView;

