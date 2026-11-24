"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CarArt } from "./CarArt";
import { TERMS, financed, money, monthlyPayment, totalInterest, clampTerms } from "@/lib/finance";
import { icsFile, openDays, reference } from "@/lib/booking";
import type { FinanceTerms, Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle | null;
  terms: FinanceTerms;
  setTerms: (t: FinanceTerms) => void;
  compared: boolean;
  onCompare: () => void;
  onClose: () => void;
}

export function VehicleDialog({ vehicle, terms, setTerms, compared, onCompare, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"finance" | "visit">("finance");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [booked, setBooked] = useState<{ ref: string; day: string; time: string; label: string } | null>(null);
  const days = useMemo(() => openDays(new Date()), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (vehicle && !el.open) {
      el.showModal();
      setTab("finance"); setBooked(null); setError(""); setTime(""); setDay(days[0].key);
    }
    if (!vehicle && el.open) el.close();
  }, [vehicle, days]);

  const v = vehicle;
  const t = v ? clampTerms(terms, v.price) : terms;
  const monthly = v ? monthlyPayment(v.price, t) : 0;
  const interest = v ? totalInterest(v.price, t) : 0;
  const principal = v ? financed(v.price, t) : 0;
  const slots = days.find(d => d.key === day)?.times ?? [];
  const upfront = v ? Math.min(v.price, t.down + t.tradeIn) : 0;
  const pct = v ? Math.round((upfront / v.price) * 100) : 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v) return;
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Please enter a valid email address.");
    if (!time) return setError("Choose a time slot for your visit.");
    setError("");
    const label = days.find(d => d.key === day)?.label ?? day;
    setBooked({ ref: reference(v.stock, day, time), day, time, label });
  }

  function downloadIcs() {
    if (!v || !booked) return;
    const blob = new Blob([icsFile(`Test drive: ${v.year} ${v.make} ${v.model}`, booked.day, booked.time, booked.ref)], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kestrel-test-drive-${booked.ref}.ics`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const num = (k: keyof FinanceTerms) => (e: React.ChangeEvent<HTMLInputElement>) => setTerms({ ...terms, [k]: Number(e.target.value) });

  return (
    <dialog ref={ref} className="vdialog" aria-labelledby="vd-title" onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}>
      {v && (
        <div className="vd-body">
          <button className="vd-close" type="button" onClick={onClose} aria-label="Close vehicle details">×</button>
          <div className="vd-left">
            <div className="vd-art" style={{ ["--paint" as string]: v.paintHex }}>
              <CarArt body={v.body} paint={v.paintHex} label={`${v.paint} ${v.year} ${v.make} ${v.model}`} />
              <span className="stock mono">{v.stock} · {v.paint}</span>
            </div>
            <h2 id="vd-title">{v.year} {v.make} {v.model}</h2>
            <p className="trim">{v.trim} · {v.note}</p>
            <dl className="vd-specs mono">
              <div><dt>Price</dt><dd>{money(v.price)}</dd></div>
              <div><dt>Odometer</dt><dd>{v.mileage.toLocaleString("en-CA")} km</dd></div>
              <div><dt>Power</dt><dd>{v.power} hp</dd></div>
              <div><dt>Economy</dt><dd>{v.economy}</dd></div>
              <div><dt>Fuel</dt><dd>{v.fuel}</dd></div>
              <div><dt>Seats</dt><dd>{v.seats}</dd></div>
            </dl>
            <ul className="feat">{v.features.map(f => <li key={f}>{f}</li>)}</ul>
            <p className="insp"><b>{v.inspected}</b> points inspected · 7-day return window</p>
          </div>

          <div className="vd-right">
            <div className="vd-tabs" role="tablist" aria-label="Finance or visit">
              <button role="tab" id="tab-fin" aria-selected={tab === "finance"} aria-controls="pane-fin" onClick={() => setTab("finance")}>Finance it</button>
              <button role="tab" id="tab-visit" aria-selected={tab === "visit"} aria-controls="pane-visit" onClick={() => setTab("visit")}>Book a test drive</button>
            </div>

            {tab === "finance" ? (
              <div role="tabpanel" id="pane-fin" aria-labelledby="tab-fin" className="pane">
                <p className="big-pay"><b>{money(Math.round(monthly))}</b><span>/mo for {t.months} months</span></p>
                <div className="split" role="img" aria-label={`${pct}% paid up front, ${100 - pct}% financed`}>
                  <i style={{ width: `${pct}%` }} />
                </div>
                <p className="split-cap mono"><span>Up front {money(upfront)}</span><span>Financed {money(principal)}</span></p>
                <div className="sliders">
                  <label>Down payment <output>{money(t.down)}</output>
                    <input aria-label="Down payment" type="range" min={0} max={Math.min(v.price, 20000)} step={500} value={t.down} onChange={num("down")} />
                  </label>
                  <label>Trade-in value <output>{money(t.tradeIn)}</output>
                    <input aria-label="Trade-in value" type="range" min={0} max={Math.min(v.price, 15000)} step={500} value={t.tradeIn} onChange={num("tradeIn")} />
                  </label>
                  <label>Interest rate (APR) <output>{t.apr.toFixed(1)}%</output>
                    <input aria-label="Interest rate (APR)" type="range" min={0} max={12} step={0.1} value={t.apr} onChange={num("apr")} />
                  </label>
                </div>
                <fieldset className="seg light">
                  <legend>Term</legend>
                  {TERMS.map(m => <button key={m} type="button" aria-pressed={t.months === m} onClick={() => setTerms({ ...terms, months: m })}>{m} mo</button>)}
                </fieldset>
                <dl className="sum mono">
                  <div><dt>Amount financed</dt><dd>{money(principal)}</dd></div>
                  <div><dt>Total interest</dt><dd>{money(Math.round(interest))}</dd></div>
                  <div><dt>Total cost</dt><dd>{money(Math.round(principal + interest + upfront))}</dd></div>
                </dl>
                <p className="fine-dark">Estimate before tax and licensing. Illustrative rates only.</p>
              </div>
            ) : booked ? (
              <div role="tabpanel" id="pane-visit" aria-labelledby="tab-visit" className="pane confirm">
                <p className="eyebrow dark">Booked</p>
                <h3 role="status">You&apos;re on the schedule.</h3>
                <p>{booked.label} at {booked.time}. We&apos;ll have the {v.model} warmed up and the paperwork ready. A confirmation was prepared for {email}.</p>
                <p className="refno mono">Reference {booked.ref}</p>
                <div className="actions">
                  <button className="btn btn-ink" type="button" onClick={downloadIcs}>Add to calendar</button>
                  <button className="btn btn-line" type="button" onClick={() => setBooked(null)}>Change time</button>
                </div>
              </div>
            ) : (
              <form role="tabpanel" id="pane-visit" aria-labelledby="tab-visit" className="pane" onSubmit={submit} noValidate>
                <fieldset className="days">
                  <legend>Pick a day</legend>
                  {days.map(d => (
                    <button key={d.key} type="button" aria-pressed={day === d.key} onClick={() => { setDay(d.key); setTime(""); }}>{d.label}</button>
                  ))}
                </fieldset>
                <fieldset className="days times">
                  <legend>Pick a time</legend>
                  {slots.map(s => <button key={s} type="button" className="mono" aria-pressed={time === s} onClick={() => setTime(s)}>{s}</button>)}
                </fieldset>
                <label className="txt">Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
                <label className="txt">Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
                {error && <p className="err" role="alert">{error}</p>}
                <button className="btn btn-ink wide" type="submit">Reserve this test drive</button>
              </form>
            )}

            <button className="btn btn-line wide" type="button" aria-pressed={compared} onClick={onCompare}>
              {compared ? "Remove from compare" : "Add to compare"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
