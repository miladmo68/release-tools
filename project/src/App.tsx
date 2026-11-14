import { useEffect, useMemo, useState } from "react";
import roomsData from "./data/rooms.json";
import type { BookingPreview, Room, StaySearch } from "./domain/types";
import { availableRooms, money, validateSearch } from "../shared/stay.js";
import { RoomVisual } from "./components/RoomVisual";
import { StayPlanner } from "./components/StayPlanner";

const rooms = roomsData as Room[];
const localDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = localDate(new Date());
const offsetDate = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return localDate(date); };
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
const storageKey = "sable-sky-previews-v1";

export default function App() {
  const [draft, setDraft] = useState<StaySearch>({ checkIn: offsetDate(1), checkOut: offsetDate(3), guests: 2 });
  const [search, setSearch] = useState<StaySearch | null>(null);
  const [searchError, setSearchError] = useState("");
  const [sort, setSort] = useState("featured");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previews, setPreviews] = useState<BookingPreview[]>(() => {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(value) ? value : []; }
    catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(previews)); } catch { /* The current visit still works without storage. */ } }, [previews]);
  useEffect(() => { if (selectedId) requestAnimationFrame(() => document.getElementById("detail-title")?.focus()); }, [selectedId]);
  const visible = useMemo(() => {
    const found = search ? availableRooms(rooms, search) : [...rooms];
    if (sort === "price") return found.sort((a, b) => a.nightlyRate - b.nightlyRate);
    if (sort === "space") return found.sort((a, b) => b.sizeSqm - a.sizeSqm);
    return found;
  }, [search, sort]);
  const selected = rooms.find(room => room.id === selectedId);

  function findRooms(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateSearch(draft, today);
    if (error) { setSearchError(error); return; }
    setSearchError(""); setSearch({ ...draft }); setSelectedId(null);
    scrollTo("rooms");
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><a className="brand" href="#top" aria-label="Sable and Sky home"><span className="brand-mark">S<span>/</span>S</span><span className="brand-name">Sable <i>&</i> Sky</span></a><nav aria-label="Main navigation"><a href="#rooms">Our rooms</a><a href="#house">The house</a><a href="#saved-stays">Saved stays</a><a className="nav-cta" href="#stay-finder">Plan your stay ↗</a></nav></header>
    <main id="main">
      <section id="top" className="hero" aria-labelledby="hero-title"><div className="hero-copy"><div className="eyebrow light">AN ORIGINAL COASTAL RETREAT — 01 / 06</div><h1 id="hero-title">Stay a little<br/><em>longer.</em></h1><p>Considered rooms, sea air, and space to find your own pace.</p><a className="hero-link" href="#stay-finder">Explore your stay ↗</a></div><div className="hero-art" aria-hidden="true"><div className="hero-sun"/><div className="building building-back"><i/><i/><i/><i/></div><div className="building building-front"><i/><i/><i/><i/><i/><i/></div><div className="hero-water"/></div><div className="hero-bottom">THE COAST, REIMAGINED <span>SCROLL TO DISCOVER ↓</span></div></section>
      <section id="stay-finder" className="finder-wrap" aria-labelledby="finder-title"><div className="section-intro"><span className="eyebrow">01 / YOUR ARRIVAL</span><h2 id="finder-title">Make room for <em>somewhere new.</em></h2><p>Choose your dates to see which spaces suit your stay.</p></div><form className="finder" onSubmit={findRooms} noValidate><label>CHECK IN<input type="date" min={today} value={draft.checkIn} onChange={e => setDraft({ ...draft, checkIn: e.target.value })}/></label><label>CHECK OUT<input type="date" min={draft.checkIn || today} value={draft.checkOut} onChange={e => setDraft({ ...draft, checkOut: e.target.value })}/></label><label>GUESTS<select value={draft.guests} onChange={e => setDraft({ ...draft, guests: Number(e.target.value) })}>{[1,2,3,4].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label><button className="finder-button" type="submit">Find a room <span aria-hidden="true">→</span></button></form><p className="form-error" role="alert">{searchError}</p></section>
      <section id="rooms" className="rooms-section" aria-labelledby="rooms-title"><div className="section-header"><div><span className="eyebrow">02 / THE COLLECTION</span><h2 id="rooms-title">Rooms with <em>room to breathe.</em></h2></div><div className="results-controls"><span aria-live="polite">{search ? `${visible.length} rooms for your stay` : "Six ways to stay"}</span><label>Sort <select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price">Price: low to high</option><option value="space">Most space</option></select></label></div></div>{visible.length ? <div className="room-grid">{visible.map((room, index) => <article className="room-card" key={room.id}><RoomVisual room={room}/><div className="room-card-content"><div className="room-number">0{index+1} — {room.eyebrow}</div><h3>{room.name}</h3><p>{room.description}</p><div className="room-meta"><span>{room.sizeSqm} m²</span><span>{room.beds}</span><span>Up to {room.maxGuests}</span></div><div className="room-card-bottom"><span>From <strong>{money(room.nightlyRate)}</strong> / night</span><button id={`room-button-${room.id}`} type="button" onClick={() => {setSelectedId(room.id); requestAnimationFrame(() => scrollTo("room-detail"));}}>Explore room ↗</button></div></div></article>)}</div> : <div className="empty-state"><h3>No rooms for this stay</h3><p>Try different dates or fewer guests to see more spaces.</p><button type="button" onClick={() => { setSearch(null); setSearchError(""); }}>See all rooms</button></div>}{selected && <section id="room-detail" className="room-detail" aria-labelledby="detail-title"><RoomVisual room={selected}/><div><span className="eyebrow">A CLOSER LOOK</span><h3 id="detail-title" tabIndex={-1}>{selected.name}</h3><p>{selected.longDescription}</p><ul>{selected.features.map(feature => <li key={feature}>{feature}</li>)}</ul><a href="#stay-finder">Change dates ↗</a><StayPlanner key={selected.id} room={selected} search={search || draft} onSave={preview => setPreviews(current => [preview, ...current])}/><button className="detail-close" type="button" onClick={() => { const id = selected.id; setSelectedId(null); requestAnimationFrame(() => document.getElementById(`room-button-${id}`)?.focus()); }}>Close details</button></div></section>}</section>
      <section id="saved-stays" className="saved-section" aria-labelledby="saved-title"><div><span className="eyebrow">04 / YOUR NOTES</span><h2 id="saved-title">Stays worth <em>keeping.</em></h2><p>Saved previews live only in this browser and do not reserve a room.</p></div>{previews.length ? <div className="saved-list">{previews.map(preview => <article key={preview.id}><div><small>{preview.checkIn} → {preview.checkOut} · {preview.guests} guests</small><h3>{rooms.find(room => room.id === preview.roomId)?.name || "Room"}</h3><span>{preview.guestName} · {money(preview.quote.total)} illustrative total</span></div><button type="button" onClick={() => setPreviews(current => current.filter(item => item.id !== preview.id))} aria-label={`Remove preview for ${preview.guestName}`}>Remove</button></article>)}</div> : <div className="saved-empty"><h3>No stays saved yet</h3><p>Explore a room, add your details, and save a private preview here.</p><a href="#rooms">Explore rooms ↗</a></div>}</section>
      <section id="house" className="house-section"><div><span className="eyebrow light">03 / THE HOUSE</span><h2>Not just a room.<br/><em>A change of rhythm.</em></h2></div><div><p>At Sable & Sky, the best moments rarely need a plan. A long breakfast. A walk with no destination. The afternoon light finding its way into your room.</p><p>Our fictional coastal house is imagined for travellers who want to feel the place, not rush through it.</p><a href="#stay-finder">Find your space ↗</a></div></section>
    </main><footer><span className="brand-name">Sable <i>&</i> Sky</span><span>Illustrative rooms, rates, and availability. No actual reservation is made.</span><a href="#top">Back to top ↑</a></footer>
  </>;
}
