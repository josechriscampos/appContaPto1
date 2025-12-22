import React from 'react';
import { useRecords } from '../context/useRecords';
import { useNavigate } from 'react-router-dom';
// --- 1. IMPORTAMOS EL CATÁLOGO ---
import { useChartOfAccounts } from '../context/useChartOfAccounts';

const formatCurrency = (amount, currency) => {
    const number = Number(amount) || 0;
    return new Intl.NumberFormat('es-CR', {
        style: 'currency',
        currency: currency,
    }).format(number);
};

const TAccountCard = ({ accountName, debits = [], credits = [], currency }) => {
    const totalDebits = debits.reduce((sum, val) => sum + val, 0);
    const totalCredits = credits.reduce((sum, val) => sum + val, 0);
    const finalBalance = totalDebits - totalCredits;

    const finalDebit = finalBalance > 0 ? finalBalance : 0;
    const finalCredit = finalBalance < 0 ? Math.abs(finalBalance) : 0;

    return (
        <div className="t-account-custom">
            <div className="t-account-custom-header">
                <input value={accountName} readOnly />
            </div>
            <div className="t-account-custom-body">
                <div className="debit-col">
                    <div className="amounts-list">
                        {debits.map((amount, index) => (
                            <input key={index} type="text" value={formatCurrency(amount, currency)} readOnly />
                        ))}
                    </div>
                </div>
                <div className="credit-col">
                    <div className="amounts-list">
                        {credits.map((amount, index) => (
                            <input key={index} type="text" value={formatCurrency(amount, currency)} readOnly />
                        ))}
                    </div>
                </div>
            </div>
            <div className="t-account-custom-footer">
                <div className="total-debit">
                    <input className="final-balance-input" type="text" value={formatCurrency(totalDebits, currency)} readOnly />
                </div>
                <div className="total-credit">
                    <input className="final-balance-input" type="text" value={formatCurrency(totalCredits, currency)} readOnly />
                </div>
            </div>
            <div className="t-account-final-balance">
                 {finalDebit > 0 && <div className="balance-debit">{formatCurrency(finalDebit, currency)}</div>}
                 {finalCredit > 0 && <div className="balance-credit">{formatCurrency(finalCredit, currency)}</div>}
            </div>
        </div>
    );
};

function TAccounts() {
    const { activeRecord, currency } = useRecords();
    const navigate = useNavigate();
    // --- 2. OBTENEMOS EL CATÁLOGO ---
    const { accounts: chartOfAccounts } = useChartOfAccounts();

    if (!activeRecord || !activeRecord.entries || activeRecord.entries.length === 0) {
        return (
            <div className="container">
                <h2>Cuentas T</h2>
                <p>No hay asientos guardados para este registro.</p>
                <button type="button" onClick={() => navigate('/asientos')}>Volver a Asientos</button>
            </div>
        );
    }

    // --- 3. CREAMOS UN MAPA DE CÓDIGOS A NOMBRES (PARA EFICIENCIA) ---
    const accountNameMap = new Map(
        chartOfAccounts.map(account => [account.code, account.name])
    );

    // --- 4. AGRUPAMOS POR CÓDIGO (NO POR 'detail') ---
    const accountsMap = activeRecord.entries.reduce((acc, line) => {
        const accountCode = line.code; // Usamos el código
        
        // Ignoramos líneas sin código
        if (typeof accountCode === 'string' && accountCode.trim() !== '') {
            if (!acc[accountCode]) {
                acc[accountCode] = { debits: [], credits: [] };
            }
            if (line.debit > 0) acc[accountCode].debits.push(line.debit);
            if (line.credit > 0) acc[accountCode].credits.push(line.credit);
        }
        return acc;
    }, {});

    return (
        <div className="container">
            <h3>{activeRecord.name}</h3>
            <h2>Cuentas T</h2>
            
            <div className="t-accounts-scroll-wrapper">
                <div className="t-accounts-grid">
                    {/* --- 5. RENDERIZAMOS USANDO EL CÓDIGO COMO 'key' --- */}
                    {Object.entries(accountsMap).map(([code, data]) => (
                        <TAccountCard 
                            key={code}
                            // Buscamos el nombre de la cuenta en nuestro mapa
                            accountName={`${code} - ${accountNameMap.get(code) || 'Cuenta no encontrada'}`}
                            debits={data.debits}
                            credits={data.credits}
                            currency={currency}
                        />
                    ))}
                </div>
            </div>

            <div className="button-group">
                <button type="button" onClick={() => navigate('/balance')}>Continuar a Balanza</button>
            </div>

            {/* --- ESTILOS CSS AÑADIDOS SOLAMENTE PARA EL ESPACIO --- */}
            <style>{`
                /* Da un ancho mínimo a la tarjeta para que quepa todo */
                .t-account-custom {
                    min-width: 320px; 
                }

                /* Hace que los inputs se expandan al 100% de su columna */
                .t-account-custom-body .amounts-list input,
                .t-account-custom-footer input {
                    width: 100%;
                    box-sizing: border-box; /* Para que el padding no rompa el ancho */
                    padding: 5px 8px;
                    font-size: 0.9rem; /* Un poco más pequeño para asegurar que quepa */
                }

                /* Ajusta el título también por si es muy largo */
                .t-account-custom-header input {
                    font-size: 0.9rem;
                }

                /* Ajusta los saldos finales para que tengan espacio */
                .t-account-final-balance .balance-debit,
                .t-account-final-balance .balance-credit {
                    font-size: 0.95rem;
                    padding: 4px 0;
                }
            `}</style>
        </div>
    );
}

export default TAccounts;