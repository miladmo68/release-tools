import { useDialogFocus } from "../hooks/useDialogFocus";

export function InfoDialog({ onClose }: { onClose: () => void }) {
  const ref = useDialogFocus(onClose);
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="info-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="info-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Close dialog">×</button>
      <span className="eyebrow">How Tandem works</span><h2 id="info-title">A repair plan in four steps.</h2>
      <ol><li>Find a device family.</li><li>Choose the symptoms you notice.</li><li>Review an itemised illustrative estimate.</li><li>Save a visit preview in this browser.</li></ol>
      <p>All prices, time slots and records are fictional. Nothing is sent to a repair shop.</p>
      <button className="primary-action" type="button" onClick={onClose}>Got it</button>
    </div>
  </div>;
}
