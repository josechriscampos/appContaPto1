// frontend/src/components/PrintButton.jsx
import { useState } from "react";

function PrintButton() {
  const [showHint, setShowHint] = useState(false);

  const handleClick = () => {
    setShowHint(true);
    setTimeout(() => {
      window.print();
      setShowHint(false);
    }, 2500);
  };

  return (
    <>
      {showHint && (
        <div className="print-hint">
          💡 En el diálogo → <strong>Más opciones</strong> → desmarca{" "}
          <strong>"Encabezados y pies de página"</strong>
        </div>
      )}
      <button className="print-btn" onClick={handleClick}>
        🖨️ Imprimir / PDF
      </button>
    </>
  );
}

export default PrintButton;