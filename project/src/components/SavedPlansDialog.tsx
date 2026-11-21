import { useState } from "react";
import { devices, repairs, serviceSlots } from "../domain/catalog";
import { createEstimate } from "../domain/estimate";
import { readPlans, removePlan, type VisitPlan } from "../domain/plans";
import { useDialogFocus } from "../hooks/useDialogFocus";

const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

export function SavedPlansDialog({ onClose, onStart }: { onClose: () => void; onStart: () => void }) {
  const ref = useDialogFocus(onClose);
  const [plans, setPlans] = useState<VisitPlan[]>(() => readPlans());
  const [selected, setSelected] = useState<string | null>(() => readPlans()[0]?.reference ?? null);
  const plan = plans.find((item) => item.reference === selected);

  const download = (item: VisitPlan) => {
    const blob = new Blob([JSON.stringify({ ...item, estimate: createEstimate(item.deviceId, item.symptoms) }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${item.reference.toLowerCase()}-repair-plan.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const remove = (reference: string) => {
    removePlan(reference);
    const remaining = readPlans();
    setPlans(remaining);
    setSelected(remaining[0]?.reference ?? null);
  };

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="plans-dialog" ref={ref} role="dialog" aria-modal="true" aria-labelledby="plans-title">
      <div className="plans-header"><div><span className="eyebrow">Private to this browser</span><h2 id="plans-title">Saved repair plans.</h2></div><button type="button" className="modal-close" aria-label="Close saved plans" onClick={onClose}>×</button></div>
      {plans.length === 0 ? <div className="plans-empty"><span aria-hidden="true">✳</span><h3>Nothing on the bench yet.</h3><p>Build a repair estimate and save an illustrative visit preview to see it here.</p><button type="button" className="primary-action" onClick={onStart}>Start a repair →</button></div> : <div className="plans-layout"><div className="plans-list" aria-label="Saved plans">{plans.map((item) => <button type="button" key={item.reference} className={item.reference === selected ? "plan-list-item selected" : "plan-list-item"} aria-pressed={item.reference === selected} onClick={() => setSelected(item.reference)}><span>{item.reference}</span><strong>{devices.find((device) => device.id === item.deviceId)?.name}</strong><small>{serviceSlots.find((slot) => slot.id === item.slotId)?.date}</small></button>)}</div>
        {plan && <div className="plan-detail"><span className="eyebrow">PLAN / {plan.reference}</span><h3>{devices.find((device) => device.id === plan.deviceId)?.name}</h3><p>{plan.symptoms.map((id) => repairs.find((repair) => repair.id === id)?.title).join(" · ")}</p><div className="plan-stat"><span>Illustrative estimate</span><strong>{money(createEstimate(plan.deviceId, plan.symptoms).total)}</strong></div><div className="plan-stat"><span>Preferred demo window</span><strong>{serviceSlots.find((slot) => slot.id === plan.slotId)?.date} · {serviceSlots.find((slot) => slot.id === plan.slotId)?.time}</strong></div>{plan.notes && <p className="plan-notes">“{plan.notes}”</p>}<div className="plan-status"><span className="status-dot"/><div><strong>Saved as a draft</strong><small>This is a private preview. No appointment was requested or reserved.</small></div></div><div className="plan-detail-actions"><button type="button" className="primary-action" onClick={() => download(plan)}>Download plan ↓</button><button type="button" className="text-action" onClick={() => remove(plan.reference)}>Remove draft</button></div></div>}
      </div>}
    </div>
  </div>;
}
