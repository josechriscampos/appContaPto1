// frontend/src/pages/CreateRecord.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecords } from '../context/useRecords';

function CreateRecord() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  // --- NUEVO ESTADO LOCAL PARA EL SELECTOR DE MONEDA ---
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const navigate = useNavigate();
  
  // Obtenemos 'setCurrency' del contexto para poder actualizar la moneda global.
  const { records, addRecord, setActiveRecordId, loading, deleteRecord, setCurrency } = useRecords();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Por favor, ingresa un nombre para el registro.");
      return;
    }
    // Nota: A futuro, podrías guardar 'selectedCurrency' en el backend también.
    const newRecord = await addRecord({ name, date, description });
    if (newRecord) {
      setActiveRecordId(newRecord.id);
      // --- ACTUALIZAMOS LA MONEDA GLOBAL AL CREAR EL REGISTRO ---
      setCurrency(selectedCurrency); 
      navigate('/asientos');
    }
  };
  
  const handleRecentClick = (recordId) => {
    // Nota: Aquí también deberías cargar la moneda asociada a ese registro si la guardas en el backend.
    // Por ahora, mantiene la moneda actual.
    setActiveRecordId(recordId);
    navigate('/asientos');
  };
  
  const handleDeleteClick = (e, recordId) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción es permanente.")) {
      deleteRecord(recordId);
    }
  };

  return (
    <div className="main-layout">
      <div className="container form-container">
        <h2>Crear un Registro Contable</h2>
        <form onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                {/* --- NUEVA CABECERA DE TABLA --- */}
                <th>Moneda</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Cierre Fiscal 2025" required /></td>
                <td><input value={date} onChange={(e) => setDate(e.target.value)} type="date" /></td>
                {/* --- NUEVO SELECTOR DE MONEDA EN EL FORMULARIO --- */}
                <td>
                  <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
                    <option value="USD">Dólar Estadounidense ($)</option>
                    <option value="CRC">Colón Costarricense (₡)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </td>
                <td><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción detallada..." rows="3"></textarea></td>
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
        <div className="recent-records-list">
          {loading ? (
            <p>Cargando registros...</p>
          ) : records.length > 0 ? (
            records.map(record => (
              <div key={record.id} className="recent-record-item">
                <button onClick={() => handleRecentClick(record.id)} className="secondary">
                  {record.name}
                </button>
                <button onClick={(e) => handleDeleteClick(e, record.id)} className="delete-record-btn" title="Eliminar registro">
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