// frontend/src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap";

const STATS = [
  { value: "∞",    label: "Empresas cliente sin límite" },
  { value: "$20",  label: "Por mes, sin contratos anuales" },
  { value: "4",    label: "Reportes financieros automáticos" },
  { value: "13%",  label: "IVA calculado automáticamente" },
];

const DEMO_STEPS = [
  {
    num: 1,
    title: "Crea tu cuenta en 30 segundos",
    desc: "Registro simple con nombre de usuario, correo y contraseña. Sin formularios interminables, sin tarjeta de crédito. En menos de un minuto ya estás dentro de la app.",
    detail: "Acceso inmediato · 7 días gratis · Sin compromisos",
  },
  {
    num: 2,
    title: "Un libro contable por empresa cliente",
    desc: "Crea un libro separado para cada empresa que manejas. Cada libro tiene su propio catálogo de cuentas, sus registros mensuales y su historial completo. Nunca más confundirás datos de un cliente con otro.",
    detail: "Libros ilimitados · Todo organizado · Datos 100% aislados",
  },
  {
    num: 3,
    title: "Registra asientos con auto-balance",
    desc: "Selecciona la cuenta del catálogo, escribe el monto. El sistema verifica el balance Debe/Haber en tiempo real. Para IVA, intereses o comisiones escribe el porcentaje (ej: 13%) y el monto se calcula automáticamente.",
    detail: "Auto-balance en tiempo real · IVA 13% automático · Guardado incremental",
  },
  {
    num: 4,
    title: "Cuentas T generadas automáticamente",
    desc: "Al terminar de registrar tus asientos, las Cuentas T se construyen solas. Cada cuenta muestra sus movimientos de débito y crédito, el total y el saldo final. Sin copiar, sin calcular, sin riesgo de error.",
    detail: "Sin cálculo manual · Todas las cuentas · Saldo automático",
  },
  {
    num: 5,
    title: "Balanza de Comprobación instantánea",
    desc: "La Balanza de Comprobación se genera al instante con todas las cuentas y sus saldos. El sistema verifica que el total Debe sea igual al total Haber y te muestra la confirmación. Si hay error, lo detectas de inmediato.",
    detail: "Verificación automática · Alerta si no cuadra · Lista para imprimir",
  },
  {
    num: 6,
    title: "Estado de Resultados en segundos",
    desc: "Con un clic generas el Estado de Resultados completo: ingresos operativos, costo de ventas, utilidad bruta, gastos operativos y utilidad neta del período. Todo calculado automáticamente a partir de tus asientos.",
    detail: "Ventas · Costos · Gastos · Utilidad neta",
  },
  {
    num: 7,
    title: "Estado de Situación Financiera",
    desc: "El balance general se genera automáticamente mostrando activos, pasivos y capital contable. El sistema verifica que el estado cuadre correctamente. Incluye encabezado formal con nombre de empresa y fecha de corte.",
    detail: "Activos · Pasivos · Capital · Verificación automática",
  },
  {
    num: 8,
    title: "Panel de Cuentas Pendientes",
    desc: "El sistema detecta automáticamente qué facturas están pendientes de cobro, qué deudas están sin pagar y qué impuestos (como el IVA) están pendientes de declarar. Todo en un solo panel, sin buscar manualmente.",
    detail: "Por cobrar · Por pagar · Impuestos por declarar",
  },
];

const EARLY_PERKS = [
  "Acceso a todas las funciones sin restricción",
  "Soporte directo con el equipo de desarrollo",
  "Tu feedback moldea las próximas funciones",
  "Sin tarjeta de crédito requerida",
];

const PRICING_FEATURES = [
  "Empresas cliente ilimitadas",
  "Registros y asientos sin límite",
  "Catálogo de cuentas personalizable",
  "Cálculo automático IVA 13%",
  "4 reportes financieros automáticos",
  "Panel de cuentas pendientes",
  "Exportar e imprimir a PDF",
  "Acceso desde cualquier dispositivo",
];

const FAQ_ITEMS = [
  {
    q: "¿Necesito saber contabilidad avanzada para usar AppContable?",
    a: "AppContable está diseñado para contadores — asume que ya manejas los conceptos básicos de débito, crédito y catálogo de cuentas. No es una app para principiantes, sino una herramienta profesional que te ahorra el trabajo tedioso: cuadrar, calcular IVA, generar reportes.",
  },
  {
    q: "¿Puedo manejar varias empresas cliente al mismo tiempo?",
    a: "Sí, sin límite. Creas un 'libro contable' por empresa y dentro de cada libro organizas los registros por período. Los datos de cada empresa están completamente separados entre sí — nunca se mezclan.",
  },
  {
    q: "¿Mis datos y los de mis clientes están seguros?",
    a: "La aplicación implementa protección CSRF, tokens JWT, rate limiting y aislamiento total entre usuarios. Cada usuario solo tiene acceso a sus propios datos. Los datos viajan cifrados bajo HTTPS en todo momento.",
  },
  {
    q: "¿Funciona específicamente para Costa Rica?",
    a: "Sí. El catálogo incluye la estructura contable costarricense, el IVA del 13% se calcula automáticamente, y el formato de moneda usa colones (₡) de forma nativa. También soporta dólares y euros.",
  },
  {
    q: "¿Qué pasa al terminar los 7 días gratis?",
    a: "Si quieres continuar ingresas tu método de pago y se activa la suscripción de $20/mes. Si decides no continuar, tus datos se conservan 30 días adicionales. No hay cobros automáticos sin aviso previo.",
  },
  {
    q: "¿Puedo cancelar en cualquier momento?",
    a: "Sí, sin preguntas ni formularios. Cancelas desde tu cuenta y listo. No hay contratos anuales ni penalizaciones por cancelar antes de tiempo.",
  },
  {
    q: "¿Puedo exportar e imprimir los reportes?",
    a: "Todos los reportes tienen un botón de imprimir que genera un PDF formal con el encabezado de la empresa, fecha de generación y formato profesional listo para entregar al cliente.",
  },
];

// ── Demo panels ──────────────────────────────────────────
function DemoPanel0() {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 16 }}>Crear cuenta en AppContable</div>
      {[["Nombre de usuario","christian_conta","text"],["Correo electrónico","christian@miestudio.cr","email"],["Contraseña","••••••••","password"]].map(([label, val, type]) => (
        <div key={label} style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
          <input type={type} readOnly value={val} style={{ width: "100%", padding: "8px 10px", borderRadius: 7, border: "1.5px solid #00875A", fontSize: "0.82rem", background: "#fff", boxSizing: "border-box" }} />
        </div>
      ))}
      <button style={{ width: "100%", padding: 10, borderRadius: 8, background: "linear-gradient(135deg,#00693E,#00875A)", color: "#fff", fontWeight: 700, fontSize: "0.88rem", border: "none", marginTop: 6, cursor: "pointer" }}>
        ✓ Crear cuenta — Gratis
      </button>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: "0.68rem", color: "#6b7280" }}>Sin tarjeta · 7 días gratis · Cancela cuando quieras</div>
    </div>
  );
}

function DemoPanel1() {
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#374151", marginBottom: 8 }}>📒 Mis Libros Contables</div>
      {[
        { name: "El Fogón Tico S.A.", ced: "57382927111", n: 3, dim: false },
        { name: "Distribuidora Méndez Ltda.", ced: "3-102-456789", n: 1, dim: true },
        { name: "Reparaciones Martínez", ced: "123345566", n: 0, dim: true },
      ].map((b) => (
        <div key={b.name} style={{ background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 10, borderLeft: `3px solid ${b.dim ? "#9ca3af" : "#00693E"}`, opacity: b.dim ? 0.55 : 1 }}>
          <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>📒 {b.name}</div>
          <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>Cédula: {b.ced} · {b.n} registros</div>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{ background: "#00693E", color: "#fff", fontSize: "0.75rem", fontWeight: 700, padding: "7px 14px", borderRadius: 7 }}>+ Nuevo Libro</div>
      </div>
    </div>
  );
}

function DemoPanel2() {
  const row = (code, name, debe, haber, gray) => (
    <div key={code} style={{ background: "#fff", padding: "7px 10px", display: "grid", gridTemplateColumns: "0.8fr 1.5fr 1fr 1fr", gap: 6, alignItems: "center", borderBottom: "1px solid #f3f4f6", fontSize: "0.75rem" }}>
      <span><span style={{ background: gray ? "#374151" : "#00693E", color: "#fff", padding: "2px 6px", borderRadius: 3, fontSize: "0.65rem", fontWeight: 700 }}>{code}</span></span>
      <span>{name}</span>
      <span style={{ fontWeight: 700, textAlign: "right", color: debe ? "#00693E" : "#9ca3af" }}>{debe || "—"}</span>
      <span style={{ fontWeight: 700, textAlign: "right", color: haber ? "#374151" : "#9ca3af" }}>{haber || "—"}</span>
    </div>
  );
  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 8, color: "#374151" }}>Asiento N°5 — Inventario Bar ✅ Guardado</div>
      <div style={{ background: "#00693E", color: "#fff", padding: "6px 10px", borderRadius: "6px 6px 0 0", display: "grid", gridTemplateColumns: "0.8fr 1.5fr 1fr 1fr", fontSize: "0.65rem", fontWeight: 700, gap: 6, textTransform: "uppercase" }}>
        <span>Cód.</span><span>Cuenta</span><span style={{ textAlign: "right" }}>Debe</span><span style={{ textAlign: "right" }}>Haber</span>
      </div>
      {row("6.1.1","Compras Merc.","₡1.500.000",null,false)}
      {row("2.1.2.2","IVA por Pagar","₡195.000",null,true)}
      {row("2.1.1.1","Proveedores",null,"₡1.695.000",true)}
      <div style={{ marginTop: 8, padding: "7px 10px", borderRadius: 7, background: "#f0fdf4", border: "1px solid #d1fae5", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", fontWeight: 600, color: "#00693E" }}>
        <span>Debe: ₡1.695.000</span><span>Haber: ₡1.695.000</span><span>✅ Balanceado</span>
      </div>
      <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 6, textAlign: "center" }}>💡 IVA calculado automáticamente escribiendo "13%"</div>
    </div>
  );
}

function DemoPanel3() {
  const card = (code, name, deb, cred, bal, balRed) => (
    <div key={code} style={{ background: "#fff", borderRadius: 8, border: "1px solid #d1d5db", overflow: "hidden" }}>
      <div style={{ background: "#00693E", color: "#fff", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, padding: "5px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{code} - {name}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #d1d5db" }}>
        <div style={{ padding: 4, fontSize: "0.62rem", textAlign: "center", color: "#374151", borderRight: "1px solid #d1d5db" }}>{deb}</div>
        <div style={{ padding: 4, fontSize: "0.62rem", textAlign: "center", color: "#374151" }}>{cred}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #d1d5db", background: "#f3f4f6" }}>
        <div style={{ padding: 4, textAlign: "center", fontSize: "0.62rem", fontWeight: 700, borderRight: "1px solid #d1d5db" }}>{deb}</div>
        <div style={{ padding: 4, textAlign: "center", fontSize: "0.62rem", fontWeight: 700 }}>{cred}</div>
      </div>
      <div style={{ textAlign: "center", padding: "3px 6px" }}>
        <span style={{ background: balRed ? "#fee2e2" : "#dcfce7", color: balRed ? "#991b1b" : "#00693E", borderRadius: 3, padding: "2px 6px", fontSize: "0.62rem", fontWeight: 700 }}>{bal}</span>
      </div>
    </div>
  );
  return (
    <div>
      <div style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: "1rem", marginBottom: 12 }}>Cuentas T</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {card("1.1.1.2","Banco C.R.","₡22.3M","₡6.3M","₡16M",false)}
        {card("4.1.1","Ventas","—","₡23.3M","₡23.3M",true)}
        {card("2.1.2.2","IVA","₡767K","₡3.02M","₡2.25M",true)}
      </div>
      <div style={{ marginTop: 10, background: "#f0fdf4", borderRadius: 6, padding: "7px 10px", fontSize: "0.7rem", color: "#00693E", fontWeight: 600, textAlign: "center" }}>
        ⚡ Generadas automáticamente — sin cálculo manual
      </div>
    </div>
  );
}

function DemoPanel4() {
  const hdr = { background: "#00693E", color: "#fff", padding: "6px 10px", borderRadius: "6px 6px 0 0", display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", gap: 4 };
  const row = (cod, name, d, h) => (
    <div key={cod} style={{ background: "#fff", display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", padding: "6px 10px", borderBottom: "1px solid #f3f4f6", fontSize: "0.72rem", gap: 4 }}>
      <span>{cod}</span><span>{name}</span>
      <span style={{ fontWeight: d ? 600 : 400 }}>{d || "—"}</span>
      <span style={{ fontWeight: h ? 600 : 400 }}>{h || "—"}</span>
    </div>
  );
  return (
    <div>
      <div style={{ textAlign: "center", fontFamily: "'DM Serif Display', serif", fontSize: "1rem", marginBottom: 2 }}>Balanza de Comprobación</div>
      <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#6b7280", marginBottom: 10 }}>Al 6 de mayo de 2026</div>
      <div style={hdr}><span>Cód.</span><span>Cuenta</span><span>Debe</span><span>Haber</span></div>
      {row("1.1.1.2","Banco C.R. Cta.","₡14.09M",null)}
      {row("1.2.1.2","Mobiliario","₡2.5M",null)}
      {row("4.1.1","Ventas",null,"₡23.3M")}
      {row("5.1.1.1","Sueldos","₡1.8M",null)}
      {row("6.1.1","Compras","₡3.1M",null)}
      <div style={{ background: "#f0fdf4", display: "grid", gridTemplateColumns: "0.5fr 2fr 1fr 1fr", padding: "7px 10px", fontSize: "0.72rem", fontWeight: 700, gap: 4, color: "#00693E" }}>
        <span></span><span>TOTALES</span><span>₡39.3M</span><span>₡39.3M</span>
      </div>
      <div style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 6, padding: "6px 10px", fontSize: "0.72rem", fontWeight: 600, color: "#00693E", textAlign: "center", marginTop: 8 }}>
        ✅ ¡El balance es correcto!
      </div>
    </div>
  );
}

function DemoPanel5() {
  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", textAlign: "center", marginBottom: 2 }}>Estado de Resultados</div>
      <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#6b7280", marginBottom: 10 }}>Para el período terminado el 6 de mayo de 2026</div>
      {[
        { label: "Ingresos Operativos", isSection: true },
        { label: "4.1.1 Ventas de Mercadería", value: "₡23.300.000" },
        { label: "Total Ingresos", value: "₡23.300.000", sub: true },
        { label: "Costo de Ventas", isSection: true },
        { label: "6.1.1 Compras Mercaderías", value: "(₡3.100.000)" },
        { label: "Utilidad Bruta", value: "₡20.200.000", sub: true },
        { label: "Gastos Operativos", isSection: true },
        { label: "Sueldos y Salarios", value: "₡1.800.000" },
        { label: "Alquileres", value: "₡650.000" },
        { label: "Energía y Teléfono", value: "₡380.000" },
        { label: "Utilidad Neta del Período", value: "₡17.070.000", total: true },
      ].map((r, i) => (
        <div key={i} style={{
          display: r.isSection ? "block" : "flex", justifyContent: "space-between",
          padding: r.isSection ? "5px 8px" : "4px 8px",
          background: r.total ? "#00693E" : r.sub ? "#f0fdf4" : r.isSection ? "#f3f4f6" : "#fff",
          color: r.total ? "#fff" : r.sub ? "#00693E" : "#0a0f0d",
          fontWeight: r.total || r.sub ? 700 : 400, fontSize: "0.72rem",
          borderBottom: "1px solid #f3f4f6",
          borderRadius: r.total ? 6 : 0, marginTop: r.total ? 6 : 0,
        }}>
          <span>{r.label}</span>
          {r.value && <span>{r.value}</span>}
        </div>
      ))}
    </div>
  );
}

function DemoPanel6() {
  const sfSec = (t) => <div style={{ background: "#00693E", color: "#fff", padding: "4px 8px", borderRadius: 4, marginBottom: 4, fontSize: "0.68rem", fontWeight: 700 }}>{t}</div>;
  const sfRow = (l, v) => <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: "0.7rem", borderBottom: "1px solid #f3f4f6" }}><span>{l}</span><span>{v}</span></div>;
  const sfSub = (l, v) => <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", fontSize: "0.72rem", fontWeight: 700, color: "#00693E", background: "#f0fdf4", borderRadius: 4, margin: "3px 0" }}><span>{l}</span><span>{v}</span></div>;
  const sfTot = (l, v) => <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", fontSize: "0.75rem", fontWeight: 800, background: "#00693E", color: "#fff", borderRadius: 6, marginTop: 4 }}><span>{l}</span><span>{v}</span></div>;
  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "0.95rem", textAlign: "center", marginBottom: 10 }}>Estado de Situación Financiera</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          {sfSec("ACTIVOS")}
          {sfRow("1.1.1.2 Banco C.R.","₡14.09M")}
          {sfSub("Total A. Corriente","₡14.09M")}
          {sfRow("1.2.1.2 Mobiliario","₡2.5M")}
          {sfSub("Total A. No Corriente","₡2.5M")}
          {sfTot("TOTAL ACTIVOS","₡16.59M")}
        </div>
        <div>
          {sfSec("PASIVOS")}
          {sfRow("2.1.1.1 Proveedores","₡480K")}
          {sfSub("Total Pasivos","₡480K")}
          {sfSec("CAPITAL")}
          {sfRow("Capital Socios","₡16M")}
          {sfRow("Utilidad Período","₡17.07M")}
          {sfTot("PASIVO+CAPITAL","₡16.59M")}
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: "0.7rem", color: "#00693E", fontWeight: 600, marginTop: 6, background: "#f0fdf4", padding: 5, borderRadius: 5 }}>
        ✅ El estado cuadra correctamente
      </div>
    </div>
  );
}

function DemoPanel7() {
  return (
    <div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1rem", textAlign: "center", marginBottom: 10 }}>Cuentas Pendientes</div>
      <div style={{ background: "#fff3cd", border: "1px solid #f59e0b", borderRadius: 8, padding: "10px 12px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.1rem" }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 700, color: "#92400e", fontSize: "0.78rem" }}>Hay cuentas con saldo pendiente</div>
          <div style={{ color: "#92400e", fontSize: "0.7rem" }}>Total pendiente: ₡2.133.950,00</div>
        </div>
      </div>
      {[
        { title: "📤 Pendientes de Pago", total: "₡480.000", color: "#dc3545", rows: [["2.1.1.1 Proveedores","₡480.000"]] },
        { title: "🧾 Impuestos Pendientes", total: "₡1.653.950", color: "#3b82f6", rows: [["2.1.2.2 IVA por Pagar","₡1.653.950"]] },
      ].map((g) => (
        <div key={g.title} style={{ borderRadius: 8, border: "1px solid #d1d5db", overflow: "hidden", marginBottom: 8, borderLeft: `3px solid ${g.color}` }}>
          <div style={{ background: "#f3f4f6", padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #d1d5db" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{g.title}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>{g.total}</span>
          </div>
          {g.rows.map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: "0.7rem" }}>
              <span>{l}</span><span style={{ fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ background: "#f0fdf4", borderRadius: 6, padding: "7px 10px", fontSize: "0.7rem", color: "#00693E", fontWeight: 600, textAlign: "center" }}>
        ⚡ Detectado automáticamente — sin revisión manual
      </div>
    </div>
  );
}

const PANELS = [DemoPanel0, DemoPanel1, DemoPanel2, DemoPanel3, DemoPanel4, DemoPanel5, DemoPanel6, DemoPanel7];
const DURATION = 3000;

// ── Feature card (dark bg) ───────────────────────────────
function FeatureCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(0,105,62,0.15)" : "rgba(255,255,255,0.04)",
        borderRadius: 16, padding: 28, cursor: "default",
        border: hov ? "1px solid rgba(0,135,90,0.5)" : "1px solid rgba(255,255,255,0.08)",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        position: "relative", overflow: "hidden",
      }}
    >
      {hov && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 0%,rgba(0,135,90,0.18) 0%,transparent 60%)", pointerEvents: "none" }} />}
      <div style={{ fontSize: "2.2rem", marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "#fff" }}>{title}</h3>
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.88rem", lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ── FAQ item (dark bg) ───────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "none", border: "none", fontFamily: "'DM Sans',sans-serif", fontSize: "0.93rem", fontWeight: 600, color: open ? "#86efac" : "rgba(255,255,255,0.9)", cursor: "pointer", textAlign: "left", gap: 16, transition: "color 0.2s" }}>
        {q}
        <span style={{ width: 26, height: 26, borderRadius: "50%", background: open ? "rgba(0,135,90,0.3)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.7rem", color: open ? "#86efac" : "rgba(255,255,255,0.5)", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "all 0.3s ease" }}>▼</span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height 0.4s ease" }}>
        <p style={{ padding: "0 20px 18px", fontSize: "0.88rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>{a}</p>
      </div>
    </div>
  );
}

// ── Floating number particles ────────────────────────────
function FloatingNumber({ value, x, y, delay, duration }) {
  return (
    <div style={{ position: "absolute", left: `${x}%`, top: `${y}%`, color: "rgba(134,239,172,0.35)", animation: `floatUp ${duration}s ${delay}s ease-in-out infinite`, fontSize: "0.68rem", fontFamily: "monospace", fontWeight: 700, pointerEvents: "none", userSelect: "none" }}>
      {value}
    </div>
  );
}

// ── Main component ───────────────────────────────────────
function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [demoIdx,  setDemoIdx]  = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const progRef  = useRef(null);

  // Load fonts
  useEffect(() => {
    if (!document.querySelector(`link[href="${FONT_LINK}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  // Remove global body padding
  useEffect(() => {
    document.body.style.padding = "0";
    document.body.style.margin  = "0";
    document.body.style.overflow = "auto";
    document.body.style.background = "#030b06";
    return () => {
      document.body.style.padding = "";
      document.body.style.margin  = "";
      document.body.style.overflow = "";
      document.body.style.background = "";
    };
  }, []);

  // Scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Progress bar
  const startProgress = useCallback(() => {
    clearInterval(progRef.current);
    setProgress(0);
    const start = Date.now();
    progRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(progRef.current);
    }, 30);
  }, []);

  // Auto-rotate
  const scheduleNext = useCallback((from) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (from + 1) % PANELS.length;
      setDemoIdx(next);
      startProgress();
      scheduleNext(next);
    }, DURATION);
  }, [startProgress]);

  useEffect(() => {
    startProgress();
    scheduleNext(0);
    return () => { clearTimeout(timerRef.current); clearInterval(progRef.current); };
  }, [scheduleNext, startProgress]);

  const goToStep = (i) => {
    clearTimeout(timerRef.current);
    clearInterval(progRef.current);
    setDemoIdx(i);
    startProgress();
    scheduleNext(i);
  };

  const ActivePanel = PANELS[demoIdx];

  const floatingNums = [
    { value: "₡23.3M", x: 7,  y: 18, delay: 0,   duration: 6 },
    { value: "13%",    x: 86, y: 22, delay: 1,   duration: 7 },
    { value: "✅",     x: 11, y: 65, delay: 2,   duration: 5 },
    { value: "DEBE",   x: 4,  y: 82, delay: 1.5, duration: 6 },
    { value: "HABER",  x: 88, y: 44, delay: 2.5, duration: 7 },
    { value: "IVA 13%",x: 71, y: 10, delay: 3,   duration: 6 },
  ];

  // Shared section tag style
  const sectionTag = {
    display: "inline-block", padding: "6px 16px", borderRadius: "50px",
    fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.4px", textTransform: "uppercase",
    marginBottom: "20px", background: "rgba(0,135,90,0.15)", color: "#86efac",
    border: "1px solid rgba(0,135,90,0.25)",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: "#fff", overflowX: "hidden", background: "#030b06" }}>
      <style>{`
        @keyframes floatUp { 0%{opacity:0;transform:translateY(20px)} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateY(-40px)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,135,90,0.3)} 50%{box-shadow:0 0 40px rgba(0,135,90,0.6)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rotateGlow { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        @keyframes panelIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .shimmer-text { background:linear-gradient(90deg,#86efac 0%,#fff 40%,#86efac 80%,#fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 4s linear infinite; }
        .f0{animation:fadeInUp 0.9s ease both}
        .f1{animation:fadeInUp 0.9s 0.1s ease both}
        .f2{animation:fadeInUp 0.9s 0.2s ease both}
        .f3{animation:fadeInUp 0.9s 0.35s ease both}
        .f4{animation:fadeInUp 0.9s 0.5s ease both}
        .green-glow { animation: glow 3s ease-in-out infinite; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#030b06}
        ::-webkit-scrollbar-thumb{background:rgba(0,135,90,0.45);border-radius:3px}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        padding: scrolled ? "10px 48px" : "15px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(3,11,6,0.94)" : "transparent",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 1px 0 rgba(0,135,90,0.18)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#00693E,#00875A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 16px rgba(0,135,90,0.4)" }}>📒</div>
          <span style={{ fontWeight: 700, fontSize: "1.15rem", color: "#fff", transition: "color 0.3s" }}>AppContable</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[["#problemas","El problema"],["#demo","Cómo funciona"],["#precio","Precio"],["#faq","FAQ"]].map(([href, label]) => (
            <a key={href} href={href} style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontWeight: 500, fontSize: "0.88rem", transition: "color 0.3s" }}
              onMouseEnter={(e) => e.target.style.color = "#86efac"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}>
              {label}
            </a>
          ))}
          <button onClick={() => navigate("/login")}
            style={{ background: "linear-gradient(135deg,#00693E,#00875A)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", boxShadow: "0 0 16px rgba(0,105,62,0.4)", transition: "all 0.2s ease" }}>
            Iniciar Sesión →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", background: "linear-gradient(160deg,#003d24 0%,#00693E 45%,#005c38 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "130px 24px 80px", position: "relative", overflow: "hidden" }}>
        {/* Grid overlay */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Glow */}
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,163,109,0.35) 0%,transparent 70%)", top: -100, right: -100 }} />
        {/* Rotating rings */}
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", border: "1px solid rgba(0,135,90,0.12)", top: "50%", left: "50%", animation: "rotateGlow 30s linear infinite" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", border: "1px solid rgba(0,135,90,0.08)", top: "50%", left: "50%", animation: "rotateGlow 20s linear infinite reverse" }} />
        {/* Floating numbers */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          {floatingNums.map((n, i) => <FloatingNumber key={i} {...n} />)}
        </div>

        <div className="f0" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, padding: "7px 18px", fontSize: "0.82rem", color: "rgba(255,255,255,0.9)", fontWeight: 500, marginBottom: 28, position: "relative", zIndex: 1 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", animation: "pulseDot 2s infinite" }} />
          Diseñado para contadores en Costa Rica
        </div>

        <h1 className="f1" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2.8rem,6vw,4.2rem)", color: "#fff", lineHeight: 1.1, marginBottom: 24, position: "relative", zIndex: 1, maxWidth: 820 }}>
          Cierra los estados financieros de<br />
          <span className="shimmer-text"><em>todas tus empresas cliente</em></span><br />
          en menos de una hora
        </h1>

        <p className="f2" style={{ fontSize: "clamp(1rem,2vw,1.18rem)", color: "rgba(255,255,255,0.78)", lineHeight: 1.75, maxWidth: 580, margin: "0 auto 40px", position: "relative", zIndex: 1 }}>
          Sin Excel. Sin errores de cuadre. Sin perder el hilo entre empresas.<br />
          AppContable organiza la contabilidad de todos tus clientes en un solo lugar.
        </p>

        <div className="f3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <button onClick={() => navigate("/login")} style={{ background: "#fff", color: "#00693E", padding: "14px 32px", borderRadius: 10, border: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", transition: "all 0.25s" }}>
            Probar gratis 7 días →
          </button>
          <a href="#demo" style={{ background: "transparent", color: "#fff", padding: "14px 32px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif", fontWeight: 500, fontSize: "1rem", cursor: "pointer", textDecoration: "none", display: "inline-block" }}>
            Ver cómo funciona
          </a>
        </div>

        <p className="f4" style={{ marginTop: 18, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", position: "relative", zIndex: 1 }}>Sin tarjeta de crédito · Cancela cuando quieras</p>

        <div className="f4" style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap", marginTop: 64, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.12)", width: "100%", maxWidth: 800, position: "relative", zIndex: 1 }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.4rem", color: "#86efac" }}>{s.value}</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMAS ── */}
      <section id="problemas" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={sectionTag}>💬 El problema</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", marginBottom: 14 }}>¿Te suena familiar alguna de estas?</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>Si eres contador independiente o tienes un estudio contable, estas situaciones te están costando horas cada semana.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {[
              { icon: "🗂️", color: "#ef4444", title: "Datos de empresas mezclados",       desc: '"Manejo 5 empresas en hojas de cálculo diferentes y siempre termino confundiendo los datos de una con otra."' },
              { icon: "📁", color: "#f59e0b", title: "Archivos imposibles de encontrar",   desc: '"Tengo los archivos de cada cliente regados entre carpetas, correos y USB. Cuando necesito algo urgente, nunca encuentro el período correcto."' },
              { icon: "😓", color: "#8b5cf6", title: "Los reportes toman días",             desc: '"Cuando el cliente me pide sus reportes financieros tengo que avisarle que espere días, porque armar todo toma más tiempo del que debería."' },
              { icon: "😰", color: "#3b82f6", title: "No sabes qué está pendiente",         desc: '"No tengo forma de saber rápido qué facturas están pendientes de pago o qué le debo declarar al fisco este mes."' },
            ].map((c, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "28px 28px 28px 36px", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", borderRadius: "16px 0 0 16px", background: c.color }} />
                <div style={{ fontSize: "2.2rem", marginBottom: 14 }}>{c.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "#fff" }}>{c.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.88rem", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO — Steps + Panel ── */}
      <section id="demo" style={{ padding: "100px 24px", background: "rgba(0,135,90,0.03)" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={sectionTag}>⚡ Cómo funciona</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", marginBottom: 14 }}>De cero a estados financieros completos</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto" }}>El flujo contable completo — desde el registro hasta los estados financieros — en un solo lugar.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 56, alignItems: "start" }}>

            {/* LEFT — steps */}
            <div>
              {DEMO_STEPS.map((step, i) => (
                <div key={i} onClick={() => goToStep(i)}
                  style={{
                    display: "flex", gap: 16, padding: "18px 16px",
                    borderLeft: `2px solid ${demoIdx === i ? "#00693E" : "rgba(255,255,255,0.1)"}`,
                    background: demoIdx === i ? "rgba(0,135,90,0.15)" : "transparent",
                    cursor: "pointer", transition: "all 0.25s", marginLeft: 14,
                    borderRadius: "0 12px 12px 0",
                    border: demoIdx === i ? "1px solid rgba(0,135,90,0.35)" : "1px solid transparent",
                    // eslint-disable-next-line no-dupe-keys
                    borderLeft: `2px solid ${demoIdx === i ? "#00693E" : "rgba(255,255,255,0.1)"}`,
                    marginBottom: 4,
                  }}>
                  <span style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: demoIdx === i ? "#00693E" : "rgba(255,255,255,0.07)",
                    color: demoIdx === i ? "#fff" : "rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: "0.8rem", marginLeft: -30,
                    border: `2px solid ${demoIdx === i ? "#00693E" : "rgba(255,255,255,0.12)"}`,
                    boxShadow: demoIdx === i ? "0 0 0 4px rgba(0,135,90,0.15)" : "none",
                    // eslint-disable-next-line no-dupe-keys
                    transition: "all 0.25s", flexShrink: 0,
                  }}>{step.num}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: demoIdx === i ? "#86efac" : "rgba(255,255,255,0.85)", marginBottom: 4 }}>{step.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{step.desc}</div>
                    {demoIdx === i && (
                      <>
                        <div style={{ marginTop: 8, fontSize: "0.72rem", color: "rgba(0,209,130,0.7)", fontWeight: 500 }}>{step.detail}</div>
                        <div style={{ height: 2, background: "rgba(0,135,90,0.25)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#00875A", borderRadius: 2, width: `${progress}%`, transition: "width 0.1s linear" }} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT — screen */}
            <div style={{ background: "#f3f4f6", borderRadius: 14, overflow: "hidden", border: "1px solid #d1d5db", boxShadow: "0 0 50px rgba(0,105,62,0.2), 0 20px 60px rgba(0,0,0,0.3)", position: "sticky", top: 90 }}>
              <div style={{ background: "#e5e7eb", padding: "9px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                {["#fc5f57","#ffbb2c","#27c840"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
                <span style={{ flex: 1, textAlign: "center", fontSize: "0.7rem", color: "#6b7280", fontFamily: "monospace" }}>appcontable.it.com</span>
              </div>
              <div style={{ padding: 20, minHeight: 400, animation: "panelIn 0.35s ease" }} key={demoIdx}>
                <ActivePanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EARLY ADOPTERS ── */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(135deg,rgba(0,61,36,0.6) 0%,transparent 100%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <span style={{ ...sectionTag, background: "rgba(251,191,36,0.15)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.25)" }}>🌱 Early adopters</span>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(1.9rem,3.5vw,2.7rem)", color: "#fff", marginBottom: 12 }}>
            Sé de los primeros.<br /><span style={{ fontStyle: "italic", color: "#86efac" }}>Tu opinión vale acceso gratis.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>AppContable está en sus primeras semanas. Buscamos contadores que quieran probarlo a fondo y compartir su experiencia real.</p>
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 40, textAlign: "left" }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.6rem", color: "#fff", marginBottom: 12 }}>Acceso completo gratis por 30 días</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: 28 }}>A cambio de una reseña honesta al finalizar. Sin trampa, sin presión — si no te funciona, lo dices.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {EARLY_PERKS.map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.9)", fontSize: "0.9rem" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>{p}
                </div>
              ))}
            </div>
            <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "14px", borderRadius: 10, background: "#fff", color: "#00693E", border: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer" }}>
              Quiero ser early adopter →
            </button>
            <div style={{ textAlign: "center", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginTop: 16 }}>Quedan <span style={{ color: "#fbbf24", fontWeight: 700 }}>12 de 20</span> cupos disponibles</div>
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={sectionTag}>🏆 Por qué AppContable</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", marginBottom: 14 }}>No es otro Excel disfrazado</h2>
            <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto" }}>Construido específicamente para la forma en que trabaja un contador costarricense.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
            {[
              { icon: "📒", title: "Un libro por empresa, todo separado",      desc: "Cada cliente vive en su propio libro. Nunca más datos mezclados entre empresas." },
              { icon: "⚖️", title: "Auto-balance en tiempo real",               desc: "El sistema detecta el error al instante — no al final del mes." },
              { icon: "📊", title: "Reportes automáticos listos para imprimir", desc: "Estado de Resultados, Balanza, Situación y Cuentas T en segundos." },
              { icon: "🧾", title: "IVA costarricense incluido",                desc: "Escribe '13%' y el monto se calcula solo. Sin fórmulas aparte." },
              { icon: "⚠️", title: "Panel de cuentas pendientes",               desc: "Ve de un vistazo qué está por cobrar, pagar o declarar." },
              { icon: "🔒", title: "Datos seguros y aislados",                  desc: "Cada usuario solo ve sus propios datos. Protección CSRF, JWT y HTTPS." },
            ].map((item) => <FeatureCard key={item.title} {...item} />)}
          </div>

          {/* VS table */}
          <div style={{ marginTop: 48, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 28, overflowX: "auto", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 16, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>AppContable vs las alternativas</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
              <thead>
                <tr>
                  {["Característica","AppContable","Excel manual","Apps genéricas"].map((h, i) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "center", fontWeight: 700, color: i === 1 ? "#86efac" : "rgba(255,255,255,0.45)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Libros por empresa cliente","✓","✗","Parcial"],
                  ["Auto-balance en tiempo real","✓","✗","✓"],
                  ["IVA costarricense nativo","✓","✗","✗"],
                  ["Reportes automáticos PDF","✓","✗","Parcial"],
                  ["Panel de cuentas pendientes","✓","✗","✗"],
                  ["Sin instalación requerida","✓","Parcial","Parcial"],
                  ["Precio mensual","$20","$10+","$50+"],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {row.map((cell, i) => (
                      <td key={i} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "center", fontWeight: i === 0 ? 500 : 700, color: cell === "✓" ? "#4ade80" : cell === "✗" ? "#ef4444" : i === 1 ? "#86efac" : "rgba(255,255,255,0.45)" }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precio" style={{ padding: "100px 24px", background: "rgba(0,135,90,0.03)" }}>
        <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
          <span style={sectionTag}>💳 Precio</span>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)", marginBottom: 14 }}>Simple y transparente</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>Un solo plan. Todo incluido. Sin sorpresas.</p>
          <div className="green-glow" style={{ background: "rgba(255,255,255,0.04)", borderRadius: 22, padding: "44px 36px", border: "1px solid rgba(0,135,90,0.3)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 18, right: -28, background: "#00875A", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "4px 38px", transform: "rotate(35deg)", letterSpacing: "0.5px" }}>POPULAR</div>
            <div style={{ fontSize: "0.85rem", color: "#86efac", fontWeight: 600, marginBottom: 8 }}>🎁 7 días gratis — sin tarjeta</div>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: "3.4rem", color: "#fff", lineHeight: 1 }}><sup style={{ fontSize: "1.4rem", verticalAlign: "super" }}>$</sup>20</div>
            <div style={{ fontSize: "0.83rem", color: "rgba(255,255,255,0.45)", marginTop: 4, marginBottom: 28 }}>por mes · cancela cuando quieras</div>
            <ul style={{ listStyle: "none", textAlign: "left", marginBottom: 28, padding: 0 }}>
              {PRICING_FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.88rem", color: "rgba(255,255,255,0.78)" }}>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate("/login")} style={{ display: "block", width: "100%", padding: 14, borderRadius: 10, background: "linear-gradient(135deg,#00693E,#00875A)", color: "#fff", border: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 8px 32px rgba(0,105,62,0.4)" }}>
              Empezar gratis 7 días →
            </button>
            <div style={{ marginTop: 18, padding: 14, background: "rgba(0,135,90,0.12)", borderRadius: 10, fontSize: "0.8rem", color: "#86efac", display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left", border: "1px solid rgba(0,135,90,0.2)" }}>
              <span style={{ fontSize: "1.2rem" }}>🛡️</span>
              <span><strong>Garantía de valor:</strong> Si en los primeros 7 días no ahorraste al menos 2 horas de trabajo, no pagas nada.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <span style={sectionTag}>❓ Preguntas frecuentes</span>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,4vw,2.8rem)" }}>Todo lo que necesitas saber</h2>
          </div>
          {FAQ_ITEMS.map((item) => <FaqItem key={item.q} {...item} />)}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: "120px 24px", background: "linear-gradient(160deg,#003d24,#001a10)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 100%,rgba(0,135,90,0.3) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "clamp(2rem,5vw,3.2rem)", color: "#fff", marginBottom: 16, lineHeight: 1.2 }}>
            Tu próximo cliente no tiene<br /><span style={{ fontStyle: "italic", color: "#86efac" }}>que esperar días sus reportes</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1rem", marginBottom: 40, lineHeight: 1.7 }}>
            Empieza gratis hoy. En menos de 5 minutos tienes tu primer libro contable listo y tu primer asiento registrado.
          </p>
          <button onClick={() => navigate("/login")} style={{ background: "#fff", color: "#00693E", padding: "16px 40px", borderRadius: 10, border: "none", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: "1.05rem", cursor: "pointer", boxShadow: "0 12px 40px rgba(0,105,62,0.5)", transition: "all 0.25s" }}>
            Crear cuenta gratis →
          </button>
          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>7 días gratis · Sin tarjeta · Cancela cuando quieras</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#010804", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, borderTop: "1px solid rgba(0,135,90,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#00693E,#00875A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📒</div>
          <span style={{ color: "#fff", fontWeight: 700 }}>AppContable</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.78rem" }}>© {new Date().getFullYear()} AppContable — Todos los derechos reservados</p>
        <div style={{ display: "flex", gap: 24 }}>
          <button onClick={() => navigate("/login")} style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", fontSize: "0.78rem", cursor: "pointer" }}>Iniciar Sesión</button>
          <a href="mailto:soporte@appcontable.it.com" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "0.78rem" }}>Soporte</a>
        </div>
      </footer>
    </div>
  );
}

export default Landing;