import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './useAuth';
import { ChartOfAccountsContext } from './useChartOfAccounts';

const defaultChartOfAccounts = [
    // Activos
    { code: '1', name: 'ACTIVO', type: 'header', category: 'Activo', levelType: 'Control' },
    { code: '1.1', name: 'Activo Corriente', type: 'group', category: 'Activo', levelType: 'Control' },
    { code: '1.1.1', name: 'Caja y Bancos', type: 'subgroup', category: 'Activo', levelType: 'Control' },
    { code: '1.1.1.1', name: 'Caja Chica', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.1.1.2', name: 'Banco C.R. Cta. No.', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.1.1.3', name: 'Banco Nac. Cta. No.', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.1.2', name: 'Cuentas por Cobrar', type: 'subgroup', category: 'Activo', levelType: 'Control' },
    { code: '1.1.2.1', name: 'Cuentas Comerciales', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.1.2.2', name: 'Tarjetas de Crédito', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.2', name: 'Activo No Corriente', type: 'group', category: 'Activo', levelType: 'Control' },
    { code: '1.2.1', name: 'Propiedad, Planta y Equipo', type: 'subgroup', category: 'Activo', levelType: 'Control' },
    { code: '1.2.1.1', name: 'Edificio', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.2.1.2', name: 'Mobiliario y Equipo', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    { code: '1.2.1.3', name: 'Vehículo', type: 'detail', category: 'Activo', levelType: 'Detalle' },
    // Pasivos
    { code: '2', name: 'PASIVO', type: 'header', category: 'Pasivo', levelType: 'Control' },
    { code: '2.1', name: 'Pasivo a Corto Plazo', type: 'group', category: 'Pasivo', levelType: 'Control' },
    { code: '2.1.1', name: 'Cuentas por Pagar', type: 'subgroup', category: 'Pasivo', levelType: 'Control' },
    { code: '2.1.1.1', name: 'Proveedores', type: 'detail', category: 'Pasivo', levelType: 'Detalle' },
    { code: '2.1.1.2', name: 'Impuesto de Ventas por Pagar', type: 'detail', category: 'Pasivo', levelType: 'Detalle' },
    { code: '2.2', name: 'Pasivo a Largo Plazo', type: 'group', category: 'Pasivo', levelType: 'Control' },
    { code: '2.2.1', name: 'Documentos por Pagar', type: 'subgroup', category: 'Pasivo', levelType: 'Control' },
    { code: '2.2.1.1', name: 'Hipotecas por Pagar', type: 'detail', category: 'Pasivo', levelType: 'Detalle' },
    // Capital
    { code: '3', name: 'CAPITAL CONTABLE', type: 'header', category: 'Capital', levelType: 'Control' },
    { code: '3.1', name: 'Capital Social', type: 'group', category: 'Capital', levelType: 'Control' },
    { code: '3.1.1', name: 'Capital en Acciones', type: 'subgroup', category: 'Capital', levelType: 'Control' },
    { code: '3.1.1.1', name: 'Capital Socio A', type: 'detail', category: 'Capital', levelType: 'Detalle' },
    { code: '3.1.2', name: 'Utilidades Retenidas', type: 'subgroup', category: 'Capital', levelType: 'Control' },
    // Ingresos
    { code: '4', name: 'INGRESOS', type: 'header', category: 'Ingresos', levelType: 'Control' },
    { code: '4.1', name: 'Ingresos por Ventas', type: 'group', category: 'Ingresos', levelType: 'Control' },
    { code: '4.1.1', name: 'Ventas de Mercadería', type: 'detail', category: 'Ingresos', levelType: 'Detalle' },
    { code: '4.2', name: 'Otros Ingresos', type: 'group', category: 'Ingresos', levelType: 'Control' },
    { code: '4.2.1', name: 'Ingresos por Intereses', type: 'detail', category: 'Ingresos', levelType: 'Detalle' },
    // Gastos
    { code: '5', name: 'GASTOS', type: 'header', category: 'Gastos', levelType: 'Control' },
    { code: '5.1', name: 'Gastos Operativos', type: 'group', category: 'Gastos', levelType: 'Control' },
    { code: '5.1.1', name: 'Sueldos y Salarios', type: 'detail', category: 'Gastos', levelType: 'Detalle' },
    { code: '5.1.2', name: 'Alquileres', type: 'detail', category: 'Gastos', levelType: 'Detalle' },
    { code: '5.1.3', name: 'Servicios Públicos', type: 'detail', category: 'Gastos', levelType: 'Detalle' },
    { code: '5.2', name: 'Gastos Administrativos', type: 'group', category: 'Gastos', levelType: 'Control' },
    { code: '5.2.1', name: 'Papelería y Útiles', type: 'detail', category: 'Gastos', levelType: 'Detalle' },
    { code: '5.3', name: 'Gastos por Depreciación', type: 'group', category: 'Gastos', levelType: 'Control' },
    { code: '5.3.1', name: 'Depreciación Edificio', type: 'detail', category: 'Gastos', levelType: 'Detalle' },
    // Costo de Ventas
    { code: '6', name: 'COSTO DE VENTAS', type: 'header', category: 'Costo de Ventas', levelType: 'Control' },
    { code: '6.1', name: 'Costo de Mercadería Vendida', type: 'group', category: 'Costo de Ventas', levelType: 'Control' },
];

export const ChartOfAccountsProvider = ({ children }) => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchChartOfAccounts = async () => {
            try {
                const res = await API.get('/accounts');
                if (res.data && res.data.length > 0) {
                    setAccounts(res.data);
                } else {
                    setAccounts(defaultChartOfAccounts);
                }
            } catch (error) {
                console.error("Error al cargar el catálogo desde el backend:", error);
                setAccounts(defaultChartOfAccounts);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchChartOfAccounts();
        } else {
            setAccounts([]);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const saveChartOfAccounts = async (updatedAccounts) => {
        try {
            // 1. Filtramos para no enviar cuentas vacías
            const filteredAccounts = updatedAccounts.filter(acc => acc.code.trim() !== '' && acc.name.trim() !== '');

            // 2. PREPARAMOS EL PAYLOAD: Eliminamos la propiedad 'id' para evitar el error en Prisma.
            // Prisma se encargará de asignar los IDs a los nuevos registros.
            // eslint-disable-next-line no-unused-vars
            const payload = filteredAccounts.map(({ id, ...rest }) => rest);

            await API.put('/accounts', payload);
            
            // 3. Volvemos a pedir los datos del backend para tener los IDs correctos y actualizados.
            // Esto es más seguro que solo actualizar el estado localmente.
            const res = await API.get('/accounts');
            setAccounts(res.data);
            
            console.log('¡Catálogo guardado exitosamente!');
        } catch (error) {
            console.error("Error al guardar el catálogo:", error);
            alert('No se pudo guardar el catálogo. Revisa la consola para más detalles.');
        }
    };
    
    const value = {
        accounts,
        setAccounts,
        loading,
        saveChartOfAccounts,
    };

    return (
        <ChartOfAccountsContext.Provider value={value}>
            {children}
        </ChartOfAccountsContext.Provider>
    );
};

