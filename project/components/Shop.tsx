"use client";

import { useEffect, useMemo, useState } from "react";
import { CarArt } from "./CarArt";
import { applyFilters, VEHICLES } from "@/lib/inventory";
import { DEFAULT_TERMS, TERMS, money, monthlyPayment } from "@/lib/finance";
import type { Body, Filters, FinanceTerms, Fuel, Vehicle } from "@/lib/types";

const BODIES: { id: Body | "all"; label: string }[] = [
  { id: "all", label: "All" }, { id: "sedan", label: "Sedan" }, { id: "suv", label: "SUV" }, { id: "hatch", label: "Hatch" },
  { id: "coupe", label: "Coupe" }, { id: "wagon", label: "Wagon" }, { id: "truck", label: "Truck" }
];
const FUELS: (Fuel | "all")[] = ["all", "Petrol", "Hybrid", "Electric", "Diesel"];
const STORE = "kestrel-shop-v1";

export function Shop() {
  const [filters, setFilters] = useState<Filters>({ budget: 450, body: "all", fuel: "all", query: "", sort: "payment" });
  const [terms, setTerms] = useState<FinanceTerms>(DEFAULT_TERMS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.filters) setFilters(f => ({ ...f, ...saved.filters }));
        if (saved.terms) setTerms(t => ({ ...t, ...saved.terms }));
      }
    } catch { /* storage unavailable */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORE, JSON.stringify({ filters, terms })); } catch { /* ignore */ }
  }, [filters, terms]);

  const results = useMemo(() => applyFilters(VEHICLES, filters, terms), [filters, terms]);
  const featured: Vehicle | undefined = useMemo(
    () => [...applyFilters(VEHICLES, { ...filters, body: "all", fuel: "all", query: "" }, terms)].sort((a, b) => b.price - a.price)[0],
    [filters, terms]
  );
  const lowest = useMemo(() => Math.min(...VEHICLES.map(v => monthlyPayment(v.price, terms))), [terms]);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters(f => ({ ...f, [k]: v }));
  const reset = () => setFilters(f => ({ ...f, body: "all", fuel: "all", query: "", sort: "payment" }));
  const fits = applyFilters(VEHICLES, { ...filters, body: "all", fuel: "all", query: "" }, terms).length;

  return (
    <>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Certified pre-owned · Toronto</p>
            <h1 id="hero-title">Shop by the <em>monthly</em> payment, not the sticker.</h1>
            <p className="lede">Every car on our lot passed a 164-point inspection. Set what you want to pay each month and we show only what fits.</p>

            <form className="budget" onSubmit={e => e.preventDefault()} aria-label="Monthly budget">
              <div className="budget-top">
                <label htmlFor="budget">My monthly budget</label>
                <output htmlFor="budget" className="budget-val">{money(filters.budget)}<small>/mo</small></output>
              </div>
              <input id="budget" type="range" min={150} max={900} step={10} value={filters.budget} onChange={e => set("budget", Number(e.target.value))} />
              <div className="range-scale" aria-hidden="true"><span>$150</span><span>$900</span></div>
              <div className="budget-row">
                <fieldset className="seg">
                  <legend>Term</legend>
                  {TERMS.map(m => (
                    <button key={m} type="button" aria-pressed={terms.months === m} onClick={() => setTerms(t => ({ ...t, months: m }))}>{m} mo</button>
                  ))}
                </fieldset>
                <label className="field">
                  <span>Down payment</span>
                  <select value={terms.down} onChange={e => setTerms(t => ({ ...t, down: Number(e.target.value) }))}>
                    {[0, 1000, 3000, 5000, 8000, 12000].map(d => <option key={d} value={d}>{money(d)}</option>)}
                  </select>
                </label>
              </div>
              <p className="fit" role="status" aria-live="polite">
                <b>{fits}</b> {fits === 1 ? "car fits" : "cars fit"} your budget · lowest {money(Math.round(lowest))}/mo at {terms.apr}% APR
              </p>
              <a className="btn btn-volt" href="#inventory">See the {fits} {fits === 1 ? "match" : "matches"}</a>
            </form>
          </div>

          <div className="hero-stage" aria-live="polite">
            <div className="stage-grid" aria-hidden="true" />
            {featured ? (
              <figure key={featured.id} className="stage-car">
                <CarArt body={featured.body} paint={featured.paintHex} label={`${featured.year} ${featured.make} ${featured.model}`} />
                <figcaption>
                  <span className="tag">Best match for {money(filters.budget)}/mo</span>
                  <strong>{featured.year} {featured.make} {featured.model}</strong>
                  <span className="mono">{money(Math.round(monthlyPayment(featured.price, terms)))}/mo · {featured.mileage.toLocaleString("en-CA")} km</span>
                </figcaption>
              </figure>
            ) : (
              <p className="stage-empty">Nothing fits that budget yet. Slide it up a little.</p>
            )}
          </div>
        </div>
      </section>

      <section className="inventory" id="inventory" aria-labelledby="inv-title">
        <div className="wrap">
          <div className="inv-head">
            <div>
              <p className="eyebrow dark">On the lot now</p>
              <h2 id="inv-title">Inventory</h2>
            </div>
            <p className="count" role="status" aria-live="polite">{results.length} of {VEHICLES.length} vehicles</p>
          </div>

          <div className="toolbar">
            <label className="search">
              <span className="sr">Search inventory</span>
              <input type="search" placeholder="Search make, model or colour" value={filters.query} onChange={e => set("query", e.target.value)} />
            </label>
            <div className="chips" role="group" aria-label="Body style">
              {BODIES.map(b => (
                <button key={b.id} type="button" aria-pressed={filters.body === b.id} onClick={() => set("body", b.id)}>{b.label}</button>
              ))}
            </div>
            <label className="field inline">
              <span>Fuel</span>
              <select value={filters.fuel} onChange={e => set("fuel", e.target.value as Fuel | "all")}>
                {FUELS.map(f => <option key={f} value={f}>{f === "all" ? "Any" : f}</option>)}
              </select>
            </label>
            <label className="field inline">
              <span>Sort</span>
              <select value={filters.sort} onChange={e => set("sort", e.target.value as Filters["sort"])}>
                <option value="payment">Lowest payment</option>
                <option value="price">Lowest price</option>
                <option value="mileage">Lowest mileage</option>
                <option value="year">Newest year</option>
              </select>
            </label>
          </div>

          {results.length === 0 ? (
            <div className="empty">
              <h3>No cars match those filters.</h3>
              <p>Try a higher monthly budget, a longer term, or clear the filters.</p>
              <button className="btn btn-ink" type="button" onClick={() => { reset(); set("budget", 900); }}>Clear filters and raise budget</button>
            </div>
          ) : (
            <ul className="grid">
              {results.map(v => (
                <li key={v.id}>
                  <article className="card">
                    <div className="card-art" style={{ ["--paint" as string]: v.paintHex }}>
                      <CarArt body={v.body} paint={v.paintHex} label={`${v.paint} ${v.year} ${v.make} ${v.model}`} />
                      <span className="stock mono">{v.stock}</span>
                    </div>
                    <div className="card-body">
                      <h3>{v.year} {v.make} {v.model}</h3>
                      <p className="trim">{v.trim}</p>
                      <p className="pay"><b>{money(Math.round(monthlyPayment(v.price, terms)))}</b><span>/mo · {terms.months} mo</span></p>
                      <dl className="specs mono">
                        <div><dt>Price</dt><dd>{money(v.price)}</dd></div>
                        <div><dt>Odometer</dt><dd>{v.mileage.toLocaleString("en-CA")} km</dd></div>
                        <div><dt>Fuel</dt><dd>{v.fuel}</dd></div>
                        <div><dt>Power</dt><dd>{v.power} hp</dd></div>
                      </dl>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
