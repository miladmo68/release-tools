"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { initialPlan, tables } from "@/lib/seed";
import { backupJson, cateringCsv, guestCsv } from "@/lib/export";
import { parseBackup } from "@/lib/backup";
import { assignGuest, assignParty, normalizePlan, openSeats, planRoster, planStats, seatRemaining, suggestTable, tableGuests, updateGuest } from "@/lib/seating";
import type { Guest, SeatingPlan } from "@/lib/types";

const storageKey = "ivory-arc-plan-v1";
const receptionImage = `${process.env.NEXT_PUBLIC_ASSET_BASE ?? ""}/images/reception.jpg`;

export default function Studio() {
  const [plan, setPlan] = useState<SeatingPlan>(initialPlan);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState("t1");
  const [view, setView] = useState<"room" | "roster">("room");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<"all" | Guest["rsvp"]>("all");
  const [side, setSide] = useState<"all" | Guest["side"]>("all");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const exportDialog = useRef<HTMLDialogElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) setPlan(normalizePlan(JSON.parse(raw)));
    } catch { setNotice("Your saved plan could not be opened. The sample arrangement is ready instead."); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(plan)); }
    catch { setNotice("This browser could not keep your changes. Export a copy before leaving."); }
  }, [plan, ready]);

  const roster = useMemo(() => planRoster(plan), [plan]);
  const stats = useMemo(() => planStats(plan, roster), [plan, roster]);
  const selectedGuest = roster.find((guest) => guest.id === selectedGuestId) ?? null;
  const selectedTable = tables.find((table) => table.id === selectedTableId) ?? tables[0];
  const filteredGuests = useMemo(() => roster.filter((guest) => `${guest.name} ${guest.party} ${guest.note}`.toLowerCase().includes(query.trim().toLowerCase()) && (response === "all" || guest.rsvp === response) && (side === "all" || guest.side === side)), [query, response, side, roster]);

  function apply(result: ReturnType<typeof assignGuest>) {
    if (result.ok) { setPlan(result.plan); setNotice("The room plan has been updated in this browser."); }
    else setNotice(result.reason);
  }
  function selectGuest(guest: Guest) {
    setSelectedGuestId(guest.id);
    if (view === "roster") setView("room");
    setNotice(`${guest.name} selected. Choose a table to place them.`);
  }
  function seatSelected() {
    if (!selectedGuest) { setNotice("Select a guest from the roster first."); return; }
    apply(assignGuest(plan, selectedGuest.id, selectedTable.id));
  }
  function seatParty() {
    if (!selectedGuest) { setNotice("Select a guest from the roster first."); return; }
    apply(assignParty(plan, selectedGuest.party, selectedTable.id));
  }
  function seatSuggested() {
    if (!selectedGuest) return;
    const table = suggestTable(plan, selectedGuest.id);
    if (!table) { setNotice("No suitable open table is available for this guest."); return; }
    setSelectedTableId(table.id);
    apply(assignGuest(plan, selectedGuest.id, table.id));
  }
  function seatAll() {
    const result = seatRemaining(plan);
    if (result.count) setPlan(result.plan);
    setNotice(result.count ? `${result.count} attending guests placed at open tables. Review their positions before saving.` : "No open seats are available for the remaining attending guests.");
  }
  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) { setNotice("Choose a plan backup smaller than 1 MB."); exportDialog.current?.close(); return; }
    try {
      const result = parseBackup(await file.text());
      if (!result.ok) { setNotice(result.reason); exportDialog.current?.close(); return; }
      setPlan(result.plan); setSelectedGuestId(null); setSelectedTableId("t1");
      setNotice("The backup was restored in this browser. Review the room before continuing.");
      exportDialog.current?.close();
    } catch { setNotice("The backup could not be read. The current plan has not changed."); exportDialog.current?.close(); }
  }
  function resetPlan() {
    setPlan(structuredClone(initialPlan)); setSelectedGuestId(null); setSelectedTableId("t1");
    setQuery(""); setResponse("all"); setSide("all"); setView("room");
    setNotice("The fictional sample arrangement has been restored in this browser.");
    resetDialog.current?.close();
  }
  function download(filename: string, content: string, mime: string) {
    try {
      const url = URL.createObjectURL(new Blob([content], { type: mime }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(`${filename} downloaded. It contains fictional planning data only.`);
      exportDialog.current?.close();
    } catch { setNotice("The file could not be downloaded in this browser. Try another browser or export format."); }
  }

  return <>
    <a className="skip" href="#studio">Skip to seating studio</a>
    <header className="site-header"><a className="brand" href="#top" aria-label="Ivory Arc home"><span className="brand-mark">I<span>·</span>A</span><span>IVORY ARC<small>THE WEDDING STUDIO</small></span></a><nav aria-label="Main navigation"><a href="#story">The story</a><a href="#studio">Seating studio</a><a href="#details">The details</a></nav><a className="header-action" href="#studio">Open the plan ↗︎</a></header>
    <main id="top">
      <section className="hero" id="story"><div className="hero-copy"><p className="eyebrow">A MORE THOUGHTFUL WAY TO GATHER</p><h1>Every seat<br /><em>tells a story.</em></h1><p>Build a room that feels like everyone belongs. Keep the people close, the conversations flowing, and the details beautifully in hand.</p><a className="primary-link" href="#studio">Enter the seating studio <span aria-hidden="true">↗︎</span></a><div className="hero-meta"><span>01 / THE ROOM</span><span>Avery & Jules · Fictional celebration</span></div></div><div className="hero-visual" style={{ backgroundImage: `url(${receptionImage})` }} role="img" aria-label="Wedding reception tables in a softly lit venue"><div className="photo-overlay"><span>THE CELEBRATION</span><strong>September 26<br />at The Glasshouse</strong><span>TORONTO · 2027</span></div></div></section>
      <section className="intro" id="details"><div><p className="eyebrow">THE PLAN AT A GLANCE</p><h2>A room for<br /><em>every connection.</em></h2></div><p>Move guests with intention, keep parties together, and see every open seat as the plan comes together. All records here are illustrative and stay in your browser.</p><div className="intro-count"><b>{stats.attending}</b><span>ATTENDING GUESTS</span></div></section>
      <section className="studio" id="studio"><div className="studio-heading"><div><p className="eyebrow">02 / THE SEATING STUDIO</p><h2>Shape the room.</h2><p>A beautifully practical place for the people who matter.</p></div><div className="save-indicator" aria-live="polite"><span className="status-dot" />{plan.savedAt ? `Plan marked saved ${new Date(plan.savedAt).toLocaleDateString("en-CA")}` : "Changes kept in this browser"}</div></div>
        <div className="stats-row" aria-label="Plan summary"><div><b>{stats.seated}<small> / {stats.attending}</small></b><span>SEATED</span></div><div><b>{stats.unseated}</b><span>NEED A SEAT</span></div><div><b>{stats.pending}</b><span>AWAITING RSVP</span></div><div><b>{stats.capacity}</b><span>TOTAL SEATS</span></div></div>
        <div className="studio-tabs" role="tablist" aria-label="Studio view" onKeyDown={(event) => { if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) { event.preventDefault(); const next = event.key === "Home" ? "room" : event.key === "End" ? "roster" : view === "room" ? "roster" : "room"; setView(next); const tabs = event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]"); tabs[next === "room" ? 0 : 1]?.focus(); } }}><button id="tab-room" role="tab" aria-controls="studio-panel" aria-selected={view === "room"} tabIndex={view === "room" ? 0 : -1} onClick={() => setView("room")}>Room plan</button><button id="tab-roster" role="tab" aria-controls="studio-panel" aria-selected={view === "roster"} tabIndex={view === "roster" ? 0 : -1} onClick={() => setView("roster")}>Guest roster <span>{roster.length}</span></button></div>
        <div id="studio-panel" role="tabpanel" aria-labelledby={view === "room" ? "tab-room" : "tab-roster"} className={`workbench ${view === "roster" ? "roster-view" : ""}`}>
          <aside className="roster-panel" aria-label="Guest roster"><div className="panel-title"><span>THE GUEST LIST</span><strong>{filteredGuests.length} PEOPLE</strong></div><label className="search-label" htmlFor="guest-search">Search guests</label><div className="search-wrap"><span aria-hidden="true">⌕</span><input id="guest-search" type="search" placeholder="Name, party or note" value={query} onChange={(event) => setQuery(event.target.value)} /></div><div className="filters"><label>Response<select value={response} onChange={(event) => setResponse(event.target.value as typeof response)}><option value="all">All responses</option><option value="attending">Attending</option><option value="pending">Pending</option><option value="declined">Declined</option></select></label><label>Circle<select value={side} onChange={(event) => setSide(event.target.value as typeof side)}><option value="all">Everyone</option><option value="Avery">Avery</option><option value="Jules">Jules</option><option value="Friends">Friends</option></select></label></div><div className="guest-list">{filteredGuests.length ? filteredGuests.map((guest) => <button className={`guest-row ${guest.id === selectedGuestId ? "selected" : ""}`} key={guest.id} onClick={() => selectGuest(guest)} aria-pressed={guest.id === selectedGuestId}><span className="avatar" aria-hidden="true">{guest.name.split(" ").map((word) => word[0]).join("")}</span><span className="guest-main"><strong>{guest.name}</strong><small>{guest.party} · {guest.rsvp === "attending" ? plan.assignments[guest.id] ? tables.find((table) => table.id === plan.assignments[guest.id])?.name : "Unseated" : guest.rsvp}</small></span><span aria-hidden="true">↗︎</span></button>) : <div className="empty">No guests match those filters. <button onClick={() => { setQuery(""); setResponse("all"); setSide("all"); }}>Clear filters</button></div>}</div></aside>
          {view === "room" && <><div className="floor-panel"><div className="panel-title"><span>THE GLASSHOUSE / FLOOR PLAN</span><strong>6 TABLES</strong></div><div className="floor-canvas" aria-label="Interactive reception floor plan"><div className="floor-top">GARDEN WINDOWS</div>{tables.map((table) => { const count = tableGuests(table.id, plan.assignments, roster).length; return <button key={table.id} style={{ left: `${table.x}%`, top: `${table.y}%` }} className={`table-node ${table.shape} ${selectedTableId === table.id ? "active" : ""}`} onClick={() => setSelectedTableId(table.id)} aria-pressed={selectedTableId === table.id} aria-label={`${table.name}, ${count} of ${table.capacity} seats filled`}><span>{table.id === "head" ? "A + J" : table.name.replace("Table ", "")}</span><small>{count}/{table.capacity}</small></button>; })}<div className="dance-floor"><span>DANCE<br />FLOOR</span></div><div className="floor-bottom">ENTRANCE · BAR</div></div><div className="floor-legend"><span><i className="legend-table" /> Table</span><span><i className="legend-active" /> Selected</span><span>Tap any table to see who is there</span></div></div>
          <aside className="inspector" aria-label="Selected table details"><div className="panel-title"><span>TABLE DETAILS</span><span>↗︎</span></div><div className="inspector-head"><span className="table-number">{selectedTable.id === "head" ? "A+J" : selectedTable.name.slice(-2)}</span><div><p className="eyebrow">THE ROOM / {selectedTable.name.toUpperCase()}</p><h3>{selectedTable.name}</h3><span>{openSeats(selectedTable, plan.assignments, roster)} open of {selectedTable.capacity} seats</span></div></div><div className="occupancy"><span style={{ width: `${(tableGuests(selectedTable.id, plan.assignments, roster).length / selectedTable.capacity) * 100}%` }} /></div><div className="inspector-section"><div className="section-heading"><strong>AT THIS TABLE</strong><span>{tableGuests(selectedTable.id, plan.assignments, roster).length} GUESTS</span></div>{tableGuests(selectedTable.id, plan.assignments, roster).length ? tableGuests(selectedTable.id, plan.assignments, roster).map((guest) => <div className="seated-person" key={guest.id}><span className="avatar" aria-hidden="true">{guest.name.split(" ").map((word) => word[0]).join("")}</span><span><strong>{guest.name}</strong><small>{guest.meal} menu</small></span><button title={`Remove ${guest.name} from table`} aria-label={`Remove ${guest.name} from table`} onClick={() => apply(assignGuest(plan, guest.id, null))}>×</button></div>) : <p className="quiet">No one seated here yet. Select an attending guest to begin.</p>}</div><div className="inspector-section assign-section"><div className="section-heading"><strong>PLACE A GUEST</strong></div>{selectedGuest ? <div className="selected-person"><strong>{selectedGuest.name}</strong><span>{selectedGuest.party} · {selectedGuest.rsvp}</span></div> : <p className="quiet">Choose a person from the guest list.</p>}{selectedGuest && <div className="guest-edit"><label>Response<select aria-label={`${selectedGuest.name} response`} value={selectedGuest.rsvp} onChange={(event) => apply(updateGuest(plan, selectedGuest.id, { rsvp: event.target.value as Guest["rsvp"] }))}><option value="attending">Attending</option><option value="pending">Pending</option><option value="declined">Declined</option></select></label><label>Menu choice<select aria-label={`${selectedGuest.name} menu choice`} value={selectedGuest.meal} onChange={(event) => apply(updateGuest(plan, selectedGuest.id, { meal: event.target.value as Guest["meal"] }))}><option value="garden">Garden</option><option value="coast">Coast</option><option value="hearth">Hearth</option></select></label></div>}<button className="assign-button" onClick={seatSelected} disabled={!selectedGuest || selectedGuest.rsvp !== "attending"}>Seat selected guest <span>→</span></button><button className="party-button" onClick={seatParty} disabled={!selectedGuest || selectedGuest.rsvp !== "attending"}>Seat their attending party together</button><button className="party-button" onClick={seatSuggested} disabled={!selectedGuest || selectedGuest.rsvp !== "attending"}>Suggest the best open table</button></div></aside></>}
          {view === "roster" && <div className="roster-summary"><p className="eyebrow">THE PEOPLE</p><h3>Gathered with intention.</h3><p>Select any guest to place them in the room. Search by name, party or note, then narrow by response or circle.</p><div className="meal-summary"><div><strong>{stats.meals.garden}</strong><span>Garden menu</span></div><div><strong>{stats.meals.coast}</strong><span>Coast menu</span></div><div><strong>{stats.meals.hearth}</strong><span>Hearth menu</span></div></div><button className="assign-button" onClick={() => setView("room")}>Return to room plan <span>→</span></button></div>}
        </div><div className="studio-footer"><p role="status" aria-live="polite">{notice || "Select a guest, then a table. Changes are saved in this browser."}</p><div className="footer-actions"><button onClick={() => window.print()}>Print room plan</button><button onClick={() => exportDialog.current?.showModal()}>Export plan</button><button onClick={seatAll} disabled={!stats.unseated}>Seat remaining guests</button><button onClick={() => { setPlan({ ...plan, savedAt: new Date().toISOString() }); setNotice("Plan marked saved. This is a private browser preview, not a venue booking."); }}>Mark plan saved</button></div></div>
      </section>
      <dialog className="export-dialog" ref={exportDialog} aria-labelledby="export-title"><form method="dialog"><button className="dialog-close" aria-label="Close export options">×</button></form><p className="eyebrow">KEEP THE DETAILS CLOSE</p><h2 id="export-title">Take the plan with you.</h2><p>Download a guest roster, a per-table menu tally, or a JSON backup. These files contain fictional details from this browser only.</p><div className="export-options"><button onClick={() => download("ivory-arc-guests.csv", "\uFEFF" + guestCsv(plan), "text/csv;charset=utf-8")}>Guest roster <span>CSV ↗︎</span></button><button onClick={() => download("ivory-arc-catering.csv", "\uFEFF" + cateringCsv(plan), "text/csv;charset=utf-8")}>Catering tally <span>CSV ↗︎</span></button><button onClick={() => download("ivory-arc-plan.json", backupJson(plan), "application/json")}>Plan backup <span>JSON ↗︎</span></button></div><div className="manage-options"><input ref={backupInput} type="file" accept=".json,application/json" hidden onChange={importBackup} aria-label="Choose Ivory Arc backup" /><button onClick={() => backupInput.current?.click()}>Restore JSON backup</button><button onClick={() => { exportDialog.current?.close(); resetDialog.current?.showModal(); }}>Reset sample plan</button></div></dialog><dialog className="reset-dialog" ref={resetDialog} aria-labelledby="reset-title"><p className="eyebrow">START FRESH</p><h2 id="reset-title">Restore the sample room?</h2><p>This replaces all guest responses, menu choices and seating changes in this browser. Export a backup first if you want to keep them.</p><div><button onClick={() => resetDialog.current?.close()}>Keep my plan</button><button onClick={resetPlan}>Reset sample</button></div></dialog>
      <footer><span className="brand-mark">I<span>·</span>A</span><p>Make room for what matters.<br /><small>A fictional wedding planning experience. No invitations are sent.</small></p><a href="#top">Back to top ↑</a></footer>
    </main>
  </>;
}
