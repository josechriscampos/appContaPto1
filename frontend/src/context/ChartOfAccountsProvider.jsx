// frontend/src/context/ChartOfAccountsProvider.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "./useAuth";
import { ChartOfAccountsContext } from "./useChartOfAccounts";

const defaultChartOfAccounts = [
  // ==================== ACTIVO ====================
  { code: "1",       name: "ACTIVO",                              type: "header",   category: "Activo",  levelType: "Control" },
  { code: "1.1",     name: "Activo Corriente",                    type: "group",    category: "Activo",  levelType: "Control" },
  { code: "1.1.1",   name: "Caja y Bancos",                       type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.1.1.1", name: "Caja Chica",                          type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.1.2", name: "Banco C.R. Cta. No.",                 type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.1.3", name: "Banco Nac. Cta. No.",                 type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.2",   name: "Cuentas por Cobrar",                  type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.1.2.1", name: "Cuentas Comerciales",                 type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.2.2", name: "Tarjetas de Crédito",                 type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.2.3", name: "Funcionarios y Empleados",            type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.3",   name: "Inventario de Mercadería",            type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.1.3.1", name: "Productos Varios",                    type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.4",   name: "Acumulados a Cobrar",                 type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.1.4.1", name: "Intereses por Cobrar",                type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.5",   name: "Pagos Anticipados",                   type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.1.5.1", name: "Alquileres Pagados por Anticipado",   type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.5.2", name: "Intereses Pagados por Anticipado",    type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.1.5.3", name: "Seguros Pagados por Anticipado",      type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.2",     name: "Activo No Corriente",                 type: "group",    category: "Activo",  levelType: "Control" },
  { code: "1.2.1",   name: "Propiedad, Planta y Equipo",          type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.2.1.1", name: "Edificio",                            type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.2.1.2", name: "Mobiliario y Equipo de Oficina",      type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.2.1.3", name: "Mobiliario y Equipo Vario",           type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.2.1.4", name: "Vehículo",                            type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.3",     name: "Otros Activos",                       type: "group",    category: "Activo",  levelType: "Control" },
  { code: "1.3.1",   name: "Activos Varios",                      type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.3.1.1", name: "Derecho Telefónico",                  type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.3.1.2", name: "Derecho en Garantía",                 type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4",     name: "Cuentas de Valuación",                type: "group",    category: "Activo",  levelType: "Control" },
  { code: "1.4.1",   name: "Estimación Ctas. Incobrables",        type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.4.1.1", name: "Estimación Tarjetas de Crédito",      type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.1.2", name: "Estimación Funcionarios y Empleados", type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.2",   name: "Provisión Compromisos Pendientes",    type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.4.2.1", name: "Aguinaldos",                          type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.2.2", name: "Prestaciones Legales",                type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.2.3", name: "Vacaciones",                          type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.3",   name: "Deprec. Acum. Prop. Planta y Equipo", type: "subgroup", category: "Activo",  levelType: "Control" },
  { code: "1.4.3.1", name: "Depreciación Edificio",               type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.3.2", name: "Depreciación Mobiliario Oficina",     type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.3.3", name: "Depreciación Mobiliario Vario",       type: "detail",   category: "Activo",  levelType: "Detalle" },
  { code: "1.4.3.4", name: "Depreciación Vehículo",               type: "detail",   category: "Activo",  levelType: "Detalle" },

  // ==================== PASIVO ====================
  { code: "2",       name: "PASIVO",                              type: "header",   category: "Pasivo",  levelType: "Control" },
  { code: "2.1",     name: "Pasivo a Corto Plazo",                type: "group",    category: "Pasivo",  levelType: "Control" },
  { code: "2.1.1",   name: "Servicios Personales por Pagar",      type: "subgroup", category: "Pasivo",  levelType: "Control" },
  { code: "2.1.1.1", name: "Sueldos por Pagar",                   type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.1.2", name: "Cuota Patronal C.C.S.S.",             type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.1.3", name: "Cuota Patronal Banco Popular",        type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.2",   name: "Cuentas por Pagar Corto Plazo",       type: "subgroup", category: "Pasivo",  levelType: "Control" },
  { code: "2.1.2.1", name: "Proveedores",                         type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.2.2", name: "Impuesto de Ventas por Pagar",        type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.2.3", name: "Impuesto de Renta por Pagar",         type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.2.4", name: "Otros Impuestos por Pagar",           type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.3",   name: "Deducciones por Pagar",               type: "subgroup", category: "Pasivo",  levelType: "Control" },
  { code: "2.1.3.1", name: "Cuota Obrera C.C.S.S.",               type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.3.2", name: "Cuota Obrera Banco Popular",          type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.3.3", name: "Impuesto sobre la Renta",             type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.3.4", name: "Retenciones Judiciales",              type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.1.4",   name: "Gastos Acumulados por Pagar",         type: "subgroup", category: "Pasivo",  levelType: "Control" },
  { code: "2.1.4.1", name: "Intereses por Pagar",                 type: "detail",   category: "Pasivo",  levelType: "Detalle" },
  { code: "2.2",     name: "Pasivo a Largo Plazo",                type: "group",    category: "Pasivo",  levelType: "Control" },
  { code: "2.2.1",   name: "Documentos por Pagar",                type: "subgroup", category: "Pasivo",  levelType: "Control" },
  { code: "2.2.1.1", name: "Hipotecas por Pagar",                 type: "detail",   category: "Pasivo",  levelType: "Detalle" },

  // ==================== CAPITAL ====================
  { code: "3",       name: "CAPITAL CONTABLE",                    type: "header",   category: "Capital", levelType: "Control" },
  { code: "3.1",     name: "Capital Social",                      type: "group",    category: "Capital", levelType: "Control" },
  { code: "3.1.1",   name: "Capital en Acciones",                 type: "subgroup", category: "Capital", levelType: "Control" },
  { code: "3.1.1.1", name: "Capital Socio A",                     type: "detail",   category: "Capital", levelType: "Detalle" },
  { code: "3.1.1.2", name: "Capital Socio B",                     type: "detail",   category: "Capital", levelType: "Detalle" },
  { code: "3.1.2",   name: "Utilidades Retenidas",                type: "subgroup", category: "Capital", levelType: "Control" },
  { code: "3.1.3",   name: "Dividendos",                          type: "subgroup", category: "Capital", levelType: "Control" },

  // ==================== INGRESOS ====================
  { code: "4",       name: "INGRESOS",                            type: "header",   category: "Ingresos", levelType: "Control" },
  { code: "4.1",     name: "Ingresos por Ventas",                 type: "group",    category: "Ingresos", levelType: "Control" },
  { code: "4.1.1",   name: "Ventas de Mercadería",                type: "detail",   category: "Ingresos", levelType: "Detalle" },
  { code: "4.1.2",   name: "Ventas Local 2",                      type: "detail",   category: "Ingresos", levelType: "Detalle" },
  { code: "4.2",     name: "Otros Ingresos",                      type: "group",    category: "Ingresos", levelType: "Control" },
  { code: "4.2.1",   name: "Sobrantes de Caja",                   type: "detail",   category: "Ingresos", levelType: "Detalle" },
  { code: "4.2.2",   name: "Diferencia de Cambio",                type: "detail",   category: "Ingresos", levelType: "Detalle" },
  { code: "4.3",     name: "Ingresos Financieros",                type: "group",    category: "Ingresos", levelType: "Control" },
  { code: "4.3.1",   name: "Intereses Ganados",                   type: "detail",   category: "Ingresos", levelType: "Detalle" },

  // ==================== GASTOS ====================
  { code: "5",       name: "GASTOS",                              type: "header",   category: "Gastos",   levelType: "Control" },
  { code: "5.1",     name: "Gastos Operativos y Administrativos", type: "group",    category: "Gastos",   levelType: "Control" },
  { code: "5.1.1",   name: "Gastos de Personal",                  type: "subgroup", category: "Gastos",   levelType: "Control" },
  { code: "5.1.1.1", name: "Sueldos y Salarios",                  type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.2", name: "Aguinaldos",                          type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.3", name: "Tiempo Extraordinario",               type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.4", name: "Vacaciones",                          type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.5", name: "Prestaciones Legales",                type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.6", name: "Cuota Patronal C.C.S.S.",             type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.1.7", name: "Cuota Patronal Banco Popular",        type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2",   name: "Gastos Generales",                    type: "subgroup", category: "Gastos",   levelType: "Control" },
  { code: "5.1.2.1", name: "Alquileres",                          type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2.2", name: "Energía Eléctrica y Teléfono",        type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2.3", name: "Seguros",                             type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2.4", name: "Reparación y Mant. de Equipo",        type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2.5", name: "Suministros de Limpieza",             type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.1.2.6", name: "Combustible",                         type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.2",     name: "Gastos por Depreciación",             type: "group",    category: "Gastos",   levelType: "Control" },
  { code: "5.2.1",   name: "Depreciación Edificio",               type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.2.2",   name: "Depreciación Mobiliario Oficina",     type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.2.3",   name: "Depreciación Mobiliario Vario",       type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.2.4",   name: "Depreciación Vehículo",               type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.3",     name: "Otros Gastos",                        type: "group",    category: "Gastos",   levelType: "Control" },
  { code: "5.3.1",   name: "Faltantes de Caja",                   type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.3.2",   name: "Diferencia de Cambio",                type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.3.3",   name: "Gastos por Incobrables",              type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.3.4",   name: "Comisión Tarjetas de Crédito",        type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.4",     name: "Descuentos y Devoluciones",           type: "group",    category: "Gastos",   levelType: "Control" },
  { code: "5.4.1",   name: "Descuentos sobre Ventas",             type: "detail",   category: "Gastos",   levelType: "Detalle" },
  { code: "5.4.2",   name: "Descuentos por Pronto Pago",          type: "detail",   category: "Gastos",   levelType: "Detalle" },

  // ==================== COSTO DE VENTAS ====================
  { code: "6",       name: "COSTO DE VENTAS",                     type: "header",   category: "Costo de Ventas", levelType: "Control" },
  { code: "6.1",     name: "Costo de Mercadería Vendida",         type: "group",    category: "Costo de Ventas", levelType: "Control" },
  { code: "6.1.1",   name: "Compras de Mercaderías",              type: "detail",   category: "Costo de Ventas", levelType: "Detalle" },
  { code: "6.1.2",   name: "Costo de Venta Directa",              type: "detail",   category: "Costo de Ventas", levelType: "Detalle" },
];

export const ChartOfAccountsProvider = ({ children }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/accounts");
      if (res.data && res.data.length > 0) {
        setAccounts(res.data);
      } else {
        setAccounts(defaultChartOfAccounts);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Error al cargar el catálogo:", err);
      }
      setError("No se pudo cargar el catálogo. Verifica tu conexión.");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    } else {
      setAccounts([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const saveChartOfAccounts = async (updatedAccounts) => {
    const filteredAccounts = updatedAccounts.filter(
      (acc) => acc.code.trim() !== "" && acc.name.trim() !== ""
    );

    // eslint-disable-next-line no-unused-vars
    const payload = filteredAccounts.map(({ id, ...rest }) => rest);
    await API.put("/accounts", payload);
    await fetchAccounts();
  };

  return (
    <ChartOfAccountsContext.Provider
      value={{
        accounts,
        loading,
        error,
        saveChartOfAccounts,
        reloadAccounts: fetchAccounts,
      }}
    >
      {children}
    </ChartOfAccountsContext.Provider>
  );
};