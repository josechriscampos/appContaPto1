// frontend/src/components/ReportHeader.jsx
function ReportHeader({ record, title, periodLabel }) {
  // ✅ Lee del registro activo, no del localStorage
  const companyName = record?.companyName || record?.name || "Sin nombre de empresa";
  const companyId   = record?.companyId   || "";

  const generatedAt = new Date().toLocaleDateString("es-CR", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="report-header">
      <div className="report-header__company">{companyName}</div>
      {companyId && (
        <div className="report-header__id">Cédula Jurídica: {companyId}</div>
      )}
      <div className="report-header__title">{title}</div>
      {periodLabel && (
        <div className="report-header__period">{periodLabel}</div>
      )}
      <div className="report-header__generated">Generado el {generatedAt}</div>
    </div>
  );
}

export default ReportHeader;