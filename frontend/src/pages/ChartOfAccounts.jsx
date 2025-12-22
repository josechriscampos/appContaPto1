import React, { useState } from 'react';
import { useChartOfAccounts } from '../context/useChartOfAccounts';

const getIndentation = (code) => {
    if (!code) return 0;
    const level = code.split('.').length;
    if (level <= 1) return 0;
    if (level === 2) return 20;
    if (level === 3) return 40;
    return 60;
};

const getCategoryFromCode = (code) => {
    if (!code) return 'Indefinida';
    const firstDigit = code.charAt(0);
    switch (firstDigit) {
        case '1': return 'Activo';
        case '2': return 'Pasivo';
        case '3': return 'Capital';
        case '4': return 'Ingresos';
        case '5': return 'Gastos';
        case '6': return 'Costo de Ventas';
        case '7': return 'Cuentas de Orden';
        default: return 'Indefinida';
    }
};

function ChartOfAccounts() {
    const { accounts, setAccounts, loading, saveChartOfAccounts } = useChartOfAccounts();
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (index, field, value) => {
        const newAccounts = [...accounts];
        const accountToUpdate = { ...newAccounts[index] };
        
        accountToUpdate[field] = value;

        if (field === 'code') {
            accountToUpdate.category = getCategoryFromCode(value);
        }
        if (field === 'levelType') {
            accountToUpdate.type = value === 'Detalle' ? 'detail' : 'group';
        }

        newAccounts[index] = accountToUpdate;
        setAccounts(newAccounts);
    };
 
    const addAccountAtIndex = (index) => {
        const parentAccount = accounts[index];
        const newId = `new-${Date.now()}`;
        const newAccount = { 
            id: newId,
            code: '', 
            name: '', 
            type: 'detail', 
            category: parentAccount.category,
            levelType: 'Detalle' 
        };
        const newAccounts = [...accounts];
        newAccounts.splice(index + 1, 0, newAccount);
        setAccounts(newAccounts);
    };
    
    const addHeaderAccount = () => {
        const newId = `new-${Date.now()}`; 
        const newAccount = {
            id: newId, 
            code: '',
            name: '',
            type: 'group',
            category: 'Indefinida',
            levelType: 'Control',
        };
        setAccounts([...accounts, newAccount]);
    };

    const removeAccountAtIndex = (indexToRemove) => {
        setAccounts(accounts.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveChanges = () => {
        const accountsToSave = accounts.filter(
            (acc) => acc.code.trim() !== '' && acc.name.trim() !== ''
        );

        // --- VALIDACIÓN DE CÓDIGOS DUPLICADOS ---
        const seenCodes = new Set();
        for (const account of accountsToSave) {
            if (seenCodes.has(account.code)) {
                // Si encontramos un código duplicado, mostramos un error y detenemos el guardado.
                alert(`Error: El código de cuenta "${account.code}" está duplicado. Por favor, corrige los códigos antes de guardar.`);
                return; // Detiene la ejecución de la función aquí.
            }
            seenCodes.add(account.code);
        }
        // --- FIN DE LA VALIDACIÓN ---

        const sortedAccounts = accountsToSave.sort((a, b) => {
            const codeA = a.code.split('.').map(Number);
            const codeB = b.code.split('.').map(Number);
            const maxLength = Math.max(codeA.length, codeB.length);

            for (let i = 0; i < maxLength; i++) {
                const valA = codeA[i] || 0;
                const valB = codeB[i] || 0;

                if (valA < valB) return -1;
                if (valA > valB) return 1;
            }
            return a.code.length - b.code.length;
        });
        
        saveChartOfAccounts(sortedAccounts);
        setIsEditing(false);
    };

    if (loading) {
        return <div className="container" style={{ textAlign: 'center' }}><h2>Cargando Catálogo de Cuentas...</h2></div>;
    }

    return (
        <div className="container" style={{ maxWidth: '900px' }}> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Catálogo de Cuentas</h2>
                {isEditing ? (
                    <button type="button" onClick={handleSaveChanges}>Guardar Catálogo</button>
                ) : (
                    <button type="button" onClick={() => setIsEditing(true)}>Editar Catálogo</button>
                )}
            </div>

            <div className="table-wrapper">
                <table className="catalog-table">
                    <thead>
                        <tr>
                            <th style={{width: '25%'}}>Código</th>
                            <th style={{width: '55%'}}>Nombre de la Cuenta</th>
                            <th style={{width: '20%', textAlign: 'center' }}>{isEditing ? 'Acciones' : 'Clasificación'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map((account, index) => {
                            const isHeader = account.code.split('.').length === 1;
                            const indentation = getIndentation(account.code);
                            const rowClassName = `catalog-row ${isHeader && !isEditing ? 'header-view' : ''}`;
                            
                            const nameInputStyle = { 
                                paddingLeft: `${indentation}px`, 
                                fontWeight: account.levelType === 'Control' || isHeader ? '600' : '400' 
                            };
                            const codeInputStyle = {
                                paddingLeft: `${indentation}px`
                            };

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
                                            style={codeInputStyle}
                                            value={account.code}
                                            onChange={(e) => handleInputChange(index, 'code', e.target.value)}
                                            readOnly={!isEditing}
                                            placeholder="Código"
                                            autoFocus={String(account.id).startsWith('new-')}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            style={nameInputStyle}
                                            value={account.name}
                                            onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                                            readOnly={!isEditing}
                                            placeholder="Nombre de la cuenta"
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                                {!isHeader && (
                                                    <select
                                                        value={account.levelType}
                                                        onChange={(e) => handleInputChange(index, 'levelType', e.target.value)}
                                                        style={{marginRight: '10px'}}
                                                    >
                                                        <option value="Control">Control</option>
                                                        <option value="Detalle">Detalle</option>
                                                    </select>
                                                )}
                                                {account.levelType === 'Control' && (
                                                    <button 
                                                        onClick={() => addAccountAtIndex(index)}
                                                        className="add-amount-btn" 
                                                        title="Agregar sub-cuenta"
                                                        style={{ width: '28px', height: '28px', fontSize: '1.2rem' }}
                                                    >+</button>
                                                )}
                                                <button 
                                                    onClick={() => removeAccountAtIndex(index)}
                                                    className="delete-record-btn" 
                                                    title="Eliminar cuenta"
                                                    style={{ fontSize: '1.2rem', width: '30px', height: '30px' }}
                                                >🗑️</button>
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
                    <button type="button" className="secondary" onClick={addHeaderAccount}>+ Agregar Categoría Principal</button>
                </div>
            )}
        </div>
    );
}

export default ChartOfAccounts;

