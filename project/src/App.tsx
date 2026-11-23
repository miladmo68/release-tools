import { useEffect, useMemo, useState } from "react";
import { devices, repairs, serviceSlots, type DeviceKind, type SymptomId } from "./domain/catalog";
import { createEstimate } from "./domain/estimate";
import { plansChangedEvent, readPlans, removePlan, savePlan, type VisitPlan } from "./domain/plans";
import { SavedPlansDialog } from "./components/SavedPlansDialog";
import { InfoDialog } from "./components/InfoDialog";

type Step = "device" | "issues" | "estimate" | "intake";
const money = (value: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);

export default function App() {
  const [step, setStep] = useState<Step>("device");
  const [kind, setKind] = useState<DeviceKind>("phone");
  const [deviceId, setDeviceId] = useState("phone-01");
  const [symptoms, setSymptoms] = useState<SymptomId[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const estimate = useMemo(() => symptoms.length ? createEstimate(deviceId, symptoms) : null, [deviceId, symptoms]);
  const chosenDevice = devices.find((device) => device.id === deviceId)!;
  const order: Step[] = ["device", "issues", "estimate", "intake"];
  const canGo = (target: Step) => order.indexOf(target) <= (symptoms.length ? 3 : 1);
  const toggleSymptom = (id: SymptomId) => setSymptoms((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return <div className="app-shell">
    <header className="site-header"><a className="brand" href="#home" onClick={() => setStep("device")} aria-label="Tandem home"><span className="brand-mark">t<span>•</span></span><span>TANDEM<span className="brand-sub">DEVICE STUDIO</span></span></a>
      <nav aria-label="Primary"><button type="button" onClick={() => { setStep("device"); document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth" }); }}>Start a repair</button><button type="button" onClick={() => setShowInfo(true)}>How it works</button><button type="button" onClick={() => setShowPlans(true)}>Saved plans</button><a href="#service">Our approach</a></nav>
      <span className="header-aside">Clear work. Considered care.</span></header>

    <main id="home"><section className="hero"><div className="hero-copy"><span className="eyebrow"><i /> A better way back to working</span><h1>Good things<br/><em>are worth fixing.</em></h1><p>Tell us what happened to your device. Build a clear, itemised repair plan and see the next available studio times.</p><button className="hero-cta" type="button" onClick={() => document.getElementById("workbench")?.scrollIntoView({ behavior: "smooth" })}>Explore your repair <span aria-hidden="true">→</span></button></div><div className="hero-art"><img src={`${import.meta.env.BASE_URL}images/repair-circuit.jpg`} alt="Disassembled phone circuit board and precision screwdriver on a repair mat" fetchPriority="high"/><div className="photo-stamp" aria-hidden="true"><span>01</span><strong>Every detail<br/>matters.</strong></div><span className="hero-art-caption">REPAIR, RECONSIDER, REUSE — 01</span></div></section>

    <section id="workbench" className="workbench" aria-labelledby="bench-title"><div className="bench-heading"><div><span className="eyebrow">01 / Your repair path</span><h2 id="bench-title">The workbench</h2></div><p>Start with the device in your hands. We’ll take it from there.</p></div>
      <div className="bench-grid"><aside className="step-rail" aria-label="Repair steps">{order.map((item, index) => <button key={item} type="button" className={step === item ? "step active" : "step"} disabled={!canGo(item)} onClick={() => setStep(item)} aria-current={step === item ? "step" : undefined}><span className="step-number">0{index + 1}</span><span>{item === "device" ? "Your device" : item === "issues" ? "What’s happening" : item === "estimate" ? "Your estimate" : "Plan a visit"}</span><span aria-hidden="true">→</span></button>)}<div className="rail-note"><span className="note-icon">✳</span><p>Thoughtful repair begins with a clear diagnosis.</p></div></aside>
      <div className="bench-panel">
        {step === "device" && <section aria-labelledby="device-title"><div className="panel-kicker">START HERE <span>01 / 04</span></div><h3 id="device-title">What needs a little care?</h3><p className="panel-intro">Choose a device family, then the closest match. These categories keep the first estimate useful without needing a serial number.</p><div className="segmented" role="group" aria-label="Device family">{(["phone", "laptop", "tablet"] as const).map((value) => <button key={value} type="button" className={kind === value ? "selected" : ""} aria-pressed={kind === value} onClick={() => { setKind(value); setDeviceId(devices.find((device) => device.kind === value)!.id); setSymptoms([]); }}>{value === "phone" ? "Phone" : value === "laptop" ? "Laptop" : "Tablet"}</button>)}</div><div className="device-grid">{devices.filter((device) => device.kind === kind).map((device) => <button type="button" key={device.id} className={deviceId === device.id ? "device-card selected" : "device-card"} onClick={() => { setDeviceId(device.id); setSymptoms([]); }} aria-pressed={deviceId === device.id}><span className="device-icon" style={{ background: device.accent }} aria-hidden="true"/><strong>{device.name}</strong><small>{device.generation}</small><span>{device.description}</span><b aria-hidden="true">→</b></button>)}</div><button className="primary-action" type="button" onClick={() => setStep("issues")}>Continue to symptoms <span aria-hidden="true">→</span></button></section>}
        {step === "issues" && <section aria-labelledby="issues-title"><div className="panel-kicker">DIAGNOSE <span>02 / 04</span></div><h3 id="issues-title">What’s going on?</h3><p className="panel-intro">Select everything you’ve noticed. Your estimate will combine parts and labour for the selected issues.</p><div className="issue-grid">{repairs.filter((repair) => repair.eligible.includes(chosenDevice.kind)).map((repair) => <button key={repair.id} type="button" aria-pressed={symptoms.includes(repair.id)} className={symptoms.includes(repair.id) ? "issue-card selected" : "issue-card"} onClick={() => toggleSymptom(repair.id)}><span className="issue-check" aria-hidden="true">{symptoms.includes(repair.id) ? "✓" : "+"}</span><strong>{repair.title}</strong><small>{repair.detail}</small></button>)}</div><div className="panel-actions"><button type="button" className="text-action" onClick={() => setStep("device")}>← Back</button><button className="primary-action" type="button" disabled={!symptoms.length} onClick={() => setStep("estimate")}>See my estimate <span aria-hidden="true">→</span></button></div></section>}
        {step === "estimate" && estimate && <section aria-labelledby="estimate-title"><div className="panel-kicker">YOUR ESTIMATE <span>03 / 04</span></div><h3 id="estimate-title">A clearer picture.</h3><p className="panel-intro">An early view of the work for your {chosenDevice.name.toLowerCase()}. Final pricing follows an in-studio inspection.</p><div className="estimate-sheet"><div className="sheet-top"><span>REPAIR PLAN / {chosenDevice.generation.toUpperCase()}</span><span>CAD</span></div>{estimate.lines.map((line) => <div className="estimate-line" key={line.title}><div><strong>{line.title}</strong><small>Parts {money(line.parts)} · Labour {money(line.labour)}</small></div><span>{money(line.parts + line.labour)}</span></div>)}<div className="estimate-totals"><div><span>Subtotal</span><span>{money(estimate.subtotal)}</span></div><div><span>Estimated HST</span><span>{money(estimate.tax)}</span></div><div className="total"><strong>Illustrative total</strong><strong>{money(estimate.total)}</strong></div></div></div><p className="estimate-note">{estimate.note}</p><div className="panel-actions"><button type="button" className="text-action" onClick={() => setStep("issues")}>← Edit issues</button><button className="primary-action" type="button" onClick={() => setStep("intake")}>Plan a visit <span aria-hidden="true">→</span></button></div></section>}
        {step === "intake" && estimate && <IntakePanel deviceId={deviceId} symptoms={symptoms} total={estimate.total} onBack={() => setStep("estimate")}/>}
      </div></div></section>

    <section id="service" className="service-band"><div className="service-intro"><div><span className="eyebrow">Why repair with care</span><h2>Less mystery.<br/><em>More life.</em></h2></div><img src={`${import.meta.env.BASE_URL}images/repair-detail.jpg`} alt="Close detail of an unbranded circuit board and precision tool" loading="lazy"/></div><div className="service-points"><div><span>01</span><h3>Know the work</h3><p>Itemised parts and labour help you understand the likely repair before making a plan.</p></div><div><span>02</span><h3>Choose the timing</h3><p>See illustrative visit windows and select what fits your day.</p></div><div><span>03</span><h3>Keep it going</h3><p>A thoughtful repair can give a familiar device more useful years.</p></div></div></section></main>
    <footer><strong>TANDEM <span>DEVICE STUDIO</span></strong><p>An illustrative repair planning experience. No booking, payment or repair service is created here.</p><button type="button" onClick={() => { setStep("device"); document.getElementById("workbench")?.scrollIntoView(); }}>Back to the workbench ↑</button></footer>
    {showInfo && <InfoDialog onClose={() => setShowInfo(false)} />}
    {showPlans && <SavedPlansDialog onClose={() => setShowPlans(false)} onStart={() => { setShowPlans(false); setStep("device"); document.getElementById("workbench")?.scrollIntoView(); }}/>} 
  </div>;
}

function IntakePanel({ deviceId, symptoms, total, onBack }: { deviceId: string; symptoms: SymptomId[]; total: number; onBack: () => void }) {
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [saved, setSaved] = useState<VisitPlan | null>(null);
  const [plans, setPlans] = useState<VisitPlan[]>(() => readPlans());
  useEffect(() => {
    const refresh = () => setPlans(readPlans());
    window.addEventListener(plansChangedEvent, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(plansChangedEvent, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const plan = savePlan({ deviceId, symptoms, slotId, name: name.trim(), email: email.trim(), notes: notes.trim() });
      setSaved(plan); setPlans(readPlans()); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save this plan."); }
  };
  return <section aria-labelledby="intake-title"><div className="panel-kicker">NEXT STEP <span>04 / 04</span></div><h3 id="intake-title">Make room for repair.</h3><p className="panel-intro">Choose an illustrative visit window, then save a private plan in this browser. Nothing is sent to a real shop.</p>
    {saved ? <div className="confirmation" role="status"><span className="confirm-symbol">✓</span><h4>Your plan is ready.</h4><p>Reference <strong>{saved.reference}</strong> is saved only in this browser. No visit has been booked and no message has been sent.</p><button type="button" className="primary-action" onClick={() => { setSaved(null); setName(""); setEmail(""); setNotes(""); setSlotId(""); }}>Plan another repair →</button></div> : <>
    <div className="slots" role="group" aria-label="Illustrative visit windows">{serviceSlots.map((slot) => { const remaining = Math.max(0, slot.remaining - plans.filter((plan) => plan.slotId === slot.id).length); return <button type="button" key={slot.id} disabled={!remaining} aria-pressed={slot.id === slotId} className={slot.id === slotId ? "slot selected" : "slot"} onClick={() => { setSlotId(slot.id); setError(""); }}><strong>{slot.date}</strong><span>{slot.time}</span><small>{remaining ? `${remaining} demo openings` : "Full in demo"}</small></button>; })}</div>
    <form className="intake-form" onSubmit={submit} noValidate><div className="form-row"><label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={80} placeholder="Alex Morgan" /></label><label>Email for this draft<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} placeholder="alex@example.com" /></label></div><label>Anything else we should know? <span>(optional)</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={3} placeholder="Tell us when the issue began…" /></label>{error && <p className="form-error" role="alert">{error}</p>}<div className="panel-actions"><button className="text-action" type="button" onClick={onBack}>← Back to estimate</button><button type="submit" className="primary-action">Save visit preview <span aria-hidden="true">→</span></button></div><p className="intake-hint">{slotId ? `Selected window · ${money(total)} estimate` : "Select a window to save your plan"}</p></form></>}
    {plans.length > 0 && <div className="saved-plans"><h4>Saved in this browser</h4>{removeError && <p className="form-error" role="alert">{removeError}</p>}{plans.map((plan) => <div className="saved-plan" key={plan.reference}><div><strong>{plan.reference}</strong><small>{devices.find((device) => device.id === plan.deviceId)?.name} · {serviceSlots.find((slot) => slot.id === plan.slotId)?.date} {serviceSlots.find((slot) => slot.id === plan.slotId)?.time}</small></div><button type="button" onClick={() => { try { removePlan(plan.reference); setPlans(readPlans()); setRemoveError(""); if (saved?.reference === plan.reference) setSaved(null); } catch { setRemoveError("Could not remove this draft. Check browser storage and try again."); } }} aria-label={`Remove plan ${plan.reference}`}>Remove</button></div>)}</div>}
  </section>;
}
