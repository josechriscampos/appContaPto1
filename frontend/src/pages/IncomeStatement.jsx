import React from 'react';
import { useRecords } from '../context/useRecords';
import { useChartOfAccounts } from '../context/useChartOfAccounts';

// --- FUNCIÓN DE FORMATO MEJORADA Y CENTRALIZADA ---
const formatCurrency = (amount, currency) => {
    const number = Math.abs(Number(amount)) || 0;
    const formatted = new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: currency,
    }).format(number);

    // Usamos paréntesis para números negativos, una práctica contable común
    return amount < 0 ? `(${formatted})` : formatted;
};

function IncomeStatement() {
    const { activeRecord, currency } = useRecords();
    const { accounts: chartOfAccounts } = useChartOfAccounts();

    if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
        return (
            <div className="container">
                <h2>Estado de Resultados</h2>
                <p>No hay datos para mostrar.</p>
            </div>
        );
    }

    // --- LÓGICA DE CÁLCULO BASADA EN EL CATÁLOGO DE CUENTAS ---

    // 1. FILTRAMOS SOLO CUENTAS DE RESULTADO (INGRESOS '4', GASTOS '5', COSTOS '6')
    const resultAccounts = chartOfAccounts
        .filter(account => ['4', '5', '6'].includes(account.code.charAt(0)))
        .map(account => {
            const relevantEntries = activeRecord.entries.filter(entry => entry.code === account.code);
            if (relevantEntries.length === 0) {
                return null;
            }

            const totalDebits = relevantEntries.reduce((sum, entry) => sum + (Number(entry.debit) || 0), 0);
            const totalCredits = relevantEntries.reduce((sum, entry) => sum + (Number(entry.credit) || 0), 0);

            // 2. CALCULAMOS EL SALDO SEGÚN LA NATURALEZA DE LA CUENTA
            let balance = 0;
            // Ingresos ('4') son de naturaleza acreedora
            if (account.code.startsWith('4')) {
                balance = totalCredits - totalDebits;
            } 
            // Gastos ('5') y Costos ('6') son de naturaleza deudora
            else {
                balance = totalDebits - totalCredits;
            }

            return {
                code: account.code,
                name: account.name,
                balance: balance,
                type: account.code.charAt(0),
            };
        })
        .filter(Boolean);

    // 3. SEPARAMOS LAS CUENTAS EN SUS GRUPOS CORRESPONDIENTES
    const incomeAccounts = resultAccounts.filter(acc => acc.type === '4');
    const cogsAccounts = resultAccounts.filter(acc => acc.type === '6');
    const expenseAccounts = resultAccounts.filter(acc => acc.type === '5');

    // 4. CÁLCULOS FINALES
    const totalIncome = incomeAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalCogs = cogsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const grossProfit = totalIncome - totalCogs;
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = grossProfit - totalExpenses;
    
    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <h3>{activeRecord.name}</h3>
            <h2>Estado de Resultados</h2>
            <h3 style={{ marginBottom: '30px' }}>
                {activeRecord.date ? `Para el período terminado el ${new Date(activeRecord.date).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}
            </h3>

            <div className="table-wrapper">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th style={{width: '15%'}}>Código</th>
                            <th style={{width: '45%'}}>Descripción</th>
                            <th style={{width: '20%', textAlign: 'right'}}>Parcial</th>
                            <th style={{width: '20%', textAlign: 'right'}}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* INGRESOS */}
                        <tr className="report-section-header"><td colSpan="4">Ingresos Operativos</td></tr>
                        {incomeAccounts.map(acc => (
                            <tr className="report-row" key={acc.code}>
                                <td>{acc.code}</td>
                                <td>{acc.name}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(acc.balance, currency)}</td>
                                <td></td>
                            </tr>
                        ))}
                        <tr className="report-subtotal">
                            <td colSpan="2">Ingresos Netos</td>
                            <td></td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(totalIncome, currency)}</td>
                        </tr>

                        {/* COSTO DE VENTAS */}
                        <tr className="report-section-header"><td colSpan="4">Costo de Ventas</td></tr>
                        {cogsAccounts.map(acc => (
                            <tr className="report-row" key={acc.code}>
                                <td>{acc.code}</td>
                                <td>{acc.name}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(-acc.balance, currency)}</td>
                                <td></td>
                            </tr>
                        ))}
                        <tr className="report-grand-total">
                            <td colSpan="2">Utilidad Bruta</td>
                            <td></td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(grossProfit, currency)}</td>
                        </tr>

                        {/* GASTOS OPERATIVOS */}
                        <tr className="report-section-header"><td colSpan="4">Gastos Operativos</td></tr>
                        {expenseAccounts.map(acc => (
                            <tr className="report-row" key={acc.code}>
                                <td>{acc.code}</td>
                                <td>{acc.name}</td>
                                <td style={{ textAlign: 'right' }}>{formatCurrency(acc.balance, currency)}</td>
                                <td></td>
                            </tr>
                        ))}
                        <tr className="report-subtotal">
                            <td colSpan="2">Total Gastos Operativos</td>
                            <td></td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(-totalExpenses, currency)}</td>
                        </tr>

                        {/* UTILIDAD NETA */}
                        <tr className="report-final-total">
                            <td colSpan="2">Utilidad Neta del Período</td>
                            <td></td>
                            <td style={{ textAlign: 'right' }}>{formatCurrency(netIncome, currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default IncomeStatement;
