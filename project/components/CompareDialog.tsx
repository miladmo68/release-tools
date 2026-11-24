"use client";

import { useEffect, useRef } from "react";
import { CarArt } from "./CarArt";
import { money, monthlyPayment } from "@/lib/finance";
import type { FinanceTerms, Vehicle } from "@/lib/types";

type Row = { label: string; value: (v: Vehicle) => string; score?: (v: Vehicle) => number; best?: "min" | "max" };

export function CompareDialog({ open, vehicles, terms, onClose, onRemove }: { open: boolean; vehicles: Vehicle[]; terms: FinanceTerms; onClose: () => void; onRemove: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const rows: Row[] = [
    { label: "Monthly payment", value: v => money(Math.round(monthlyPayment(v.price, terms))), score: v => monthlyPayment(v.price, terms), best: "min" },
    { label: "Price", value: v => money(v.price), score: v => v.price, best: "min" },
    { label: "Odometer", value: v => `${v.mileage.toLocaleString("en-CA")} km`, score: v => v.mileage, best: "min" },
    { label: "Year", value: v => String(v.year), score: v => v.year, best: "max" },
    { label: "Power", value: v => `${v.power} hp`, score: v => v.power, best: "max" },
    { label: "Fuel", value: v => v.fuel },
    { label: "Economy", value: v => v.economy },
    { label: "Seats", value: v => String(v.seats), score: v => v.seats, best: "max" }
  ];

  return (
    <dialog ref={ref} className="vdialog cdialog" aria-labelledby="cmp-title" onClose={onClose} onClick={e => { if (e.target === ref.current) onClose(); }}>
      <div className="cd-body">
        <button className="vd-close" type="button" onClick={onClose} aria-label="Close comparison">×</button>
        <h2 id="cmp-title">Compare</h2>
        {vehicles.length === 0 ? (
          <p className="fine-dark">Nothing to compare yet. Add up to three cars from the inventory.</p>
        ) : (
          <div className="cmp-scroll">
            <table className="cmp">
              <thead>
                <tr><th scope="col"><span className="sr">Spec</span></th>
                  {vehicles.map(v => (
                    <th scope="col" key={v.id}>
                      <CarArt body={v.body} paint={v.paintHex} label={`${v.year} ${v.make} ${v.model}`} />
                      <strong>{v.year} {v.make} {v.model}</strong>
                      <button type="button" className="link" onClick={() => onRemove(v.id)}>Remove</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const scores = r.score ? vehicles.map(r.score) : [];
                  const target = r.best === "min" ? Math.min(...scores) : Math.max(...scores);
                  return (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {vehicles.map((v, i) => {
                        const win = vehicles.length > 1 && r.score && scores[i] === target && new Set(scores).size > 1;
                        return <td key={v.id} className={`mono${win ? " win" : ""}`}>{r.value(v)}{win && <span className="sr"> (best)</span>}</td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </dialog>
  );
}
