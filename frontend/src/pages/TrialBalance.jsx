import React from 'react';
import { useRecords } from '../context/useRecords';
import { useChartOfAccounts } from '../context/useChartOfAccounts'; // ¡Importante!

// Función de formato (sin cambios)
const formatCurrency = (amount, currency) => {
    if (amount === 0 || !amount) return '';
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

function TrialBalance() {
    const { activeRecord, currency } = useRecords();
    // 1. OBTENEMOS EL CATÁLOGO DE CUENTAS PARA USARLO COMO BASE
    const { accounts: chartOfAccounts } = useChartOfAccounts();

    if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
        return (
            <div className="container">
                <h2>Balanza de Comprobación</h2>
                <p>No hay datos para mostrar.</p>
            </div>
        );
    }

    // --- LÓGICA DE CÁLCULO COMPLETAMENTE RECONSTRUIDA ---
    const balanceData = chartOfAccounts
        .map(account => {
            // Para cada cuenta del catálogo, encontramos sus movimientos
            const relevantEntries = activeRecord.entries.filter(entry => entry.code === account.code);
            
            if (relevantEntries.length === 0) {
                return null; // Si no tuvo movimientos, no la incluimos
            }

            const totalDebits = relevantEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
            const totalCredits = relevantEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);

            // 2. APLICAMOS LA LÓGICA DE LA NATURALEZA DE LA CUENTA
            const accountType = account.code.charAt(0);
            let finalDebit = 0;
            let finalCredit = 0;

            // Naturaleza Acreedora: Pasivo (2), Capital (3), Ingresos (4)
            if (['2', '3', '4'].includes(accountType)) {
                const balance = totalCredits - totalDebits;
                if (balance > 0) finalCredit = balance;
                else finalDebit = Math.abs(balance); // Saldo invertido
            } 
            // Naturaleza Deudora: Activo (1), Costo (6), Gasto (5)
            else {
                const balance = totalDebits - totalCredits;
                if (balance > 0) finalDebit = balance;
                else finalCredit = Math.abs(balance); // Saldo invertido
            }

            return {
                code: account.code,
                name: account.name,
                debit: finalDebit,
                credit: finalCredit,
            };
        })
        .filter(Boolean); // Limpiamos las cuentas nulas (sin movimientos)

    const totalDebits = balanceData.reduce((sum, item) => sum + item.debit, 0);
    const totalCredits = balanceData.reduce((sum, item) => sum + item.credit, 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return (
        <div className="container">
            <h3>{activeRecord.name}</h3>
            <h2>Balanza de Comprobación</h2>

            <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>Código</th>
                            <th style={{ width: '45%' }}>Nombre de Cuenta</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Debe</th>
                            <th style={{ width: '20%', textAlign: 'right' }}>Haber</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balanceData.map(account => (
                            <tr key={account.code}>
                                <td>{account.code}</td>
                                <td>{account.name}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(account.debit, currency)}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(account.credit, currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="table-totals">
                            <td colSpan="2"><strong>TOTALES</strong></td>
                            <td style={{ textAlign: 'right' }}><strong>{formatCurrency(totalDebits, currency)}</strong></td>
                            <td style={{ textAlign: 'right' }}><strong>{formatCurrency(totalCredits, currency)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
                {isBalanced ? (
                    <p style={{ color: 'var(--accent-green)' }}>✅ ¡El balance es correcto!</p>
                ) : (
                    <p style={{ color: 'var(--danger-color)' }}>❌ ¡El balance es incorrecto! Diferencia: {formatCurrency(Math.abs(totalDebits - totalCredits), currency)}</p>
                )}
            </div>
        </div>
    );
}

export default TrialBalance;

