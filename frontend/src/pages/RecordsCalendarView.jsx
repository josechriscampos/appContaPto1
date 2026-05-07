// frontend/src/pages/RecordsCalendarView.jsx
import { useState, useMemo } from "react";
import { useRecords } from "../context/useRecords";
import { useNavigate } from "react-router-dom";

// ✅ Conversión segura para Decimal de Prisma
const toNumber = (value) => parseFloat(String(value)) || 0;

const RecordEvent = ({ record, onSelect }) => {
  const balance = useMemo(() => {
    if (!record.entries || record.entries.length === 0) {
      return { isBalanced: true };
    }

    const totals = record.entries.reduce(
      (acc, entry) => {
        acc.totalDebit  += toNumber(entry.debit);
        acc.totalCredit += toNumber(entry.credit);
        return acc;
      },
      { totalDebit: 0, totalCredit: 0 }
    );

    return {
      ...totals,
      isBalanced: Math.abs(totals.totalDebit - totals.totalCredit) < 0.01,
    };
  }, [record.entries]);

  return (
    <div
      className={`record-event ${balance.isBalanced ? "balanced" : "unbalanced"}`}
      onClick={() => onSelect(record.id)}
      title={balance.isBalanced ? "Balance correcto" : "Balance incorrecto"}
    >
      {record.name}
    </div>
  );
};

function RecordsCalendarView() {
  const { records, setActiveRecordId } = useRecords();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const groupedRecords = useMemo(() => {
    return records.reduce((acc, record) => {
      if (record.date) {
        const recordDate = new Date(record.date);
        const utcDate = new Date(
          recordDate.getUTCFullYear(),
          recordDate.getUTCMonth(),
          recordDate.getUTCDate()
        );
        const dateKey = utcDate.toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(record);
      }
      return acc;
    }, {});
  }, [records]);

  const handleSelectRecord = (recordId) => {
    setActiveRecordId(recordId);
    navigate("/asientos");
  };

  const goToPreviousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const goToToday = () => setCurrentDate(new Date());

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("es-CR", {
    month: "long",
    year: "numeric",
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div className="calendar-day calendar-day--empty" key={`empty-${i}`} />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey    = new Date(year, month, day).toISOString().split("T")[0];
    const dayRecords = groupedRecords[dateKey] || [];

    calendarDays.push(
      <div className="calendar-day" key={day}>
        <div className="day-number">{day}</div>
        <div className="events-container">
          {dayRecords.map((record) => (
            <RecordEvent
              key={record.id}
              record={record}
              onSelect={handleSelectRecord}
            />
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
        <h2 className="calendar-title">{monthName}</h2>
        {/* ✅ Ruta corregida — va al home en lugar de /graficos que no existe */}
        <div className="calendar-nav">
          <button onClick={() => navigate("/")}>Volver al Registro</button>
        </div>
      </div>

      <div className="calendar-grid">
        {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((day) => (
          <div className="day-name" key={day}>{day}</div>
        ))}
        {calendarDays}
      </div>
    </div>
  );
}

export default RecordsCalendarView;