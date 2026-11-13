import { useMemo, useState } from "react";
import roomsData from "./data/rooms.json";
import type { Room, StaySearch } from "./domain/types";
import { availableRooms, money, validateSearch } from "../shared/stay.js";
import { RoomVisual } from "./components/RoomVisual";

const rooms = roomsData as Room[];
const today = new Date().toISOString().slice(0, 10);
const offsetDate = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

export default function App() {
  const [draft, setDraft] = useState<StaySearch>({ checkIn: offsetDate(1), checkOut: offsetDate(3), guests: 2 });
  const [search, setSearch] = useState<StaySearch | null>(null);
  const [searchError, setSearchError] = useState("");
  const [sort, setSort] = useState("featured");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
  }

  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><a className="brand" href="#top" aria-label="Sable and Sky home"><span className="brand-mark">S<span>/</span>S</span><span className="brand-name">Sable <i>&</i> Sky</span></a><nav aria-label="Main navigation"><a href="#rooms">Our rooms</a><a href="#house">The house</a><a className="nav-cta" href="#stay-finder">Plan your stay ↗</a></nav></header>
    <main id="main">
      <section id="top" className="hero" aria-labelledby="hero-title"><div className="hero-copy"><div className="eyebrow light">AN ORIGINAL COASTAL RETREAT — 01 / 06</div><h1 id="hero-title">Stay a little<br/><em>longer.</em></h1><p>Considered rooms, sea air, and space to find your own pace.</p><a className="hero-link" href="#stay-finder">Explore your stay ↗</a></div><div className="hero-art" aria-hidden="true"><div className="hero-sun"/><div className="building building-back"><i/><i/><i/><i/></div><div className="building building-front"><i/><i/><i/><i/><i/><i/></div><div className="hero-water"/></div><div className="hero-bottom">THE COAST, REIMAGINED <span>SCROLL TO DISCOVER ↓</span></div></section>
      <section id="stay-finder" className="finder-wrap" aria-labelledby="finder-title"><div className="section-intro"><span className="eyebrow">01 / YOUR ARRIVAL</span><h2 id="finder-title">Make room for <em>somewhere new.</em></h2><p>Choose your dates to see which spaces suit your stay.</p></div><form className="finder" onSubmit={findRooms} noValidate><label>CHECK IN<input type="date" min={today} value={draft.checkIn} onChange={e => setDraft({ ...draft, checkIn: e.target.value })}/></label><label>CHECK OUT<input type="date" min={draft.checkIn || today} value={draft.checkOut} onChange={e => setDraft({ ...draft, checkOut: e.target.value })}/></label><label>GUESTS<select value={draft.guests} onChange={e => setDraft({ ...draft, guests: Number(e.target.value) })}>{[1,2,3,4].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label><button className="finder-button" type="submit">Find a room <span aria-hidden="true">→</span></button></form><p className="form-error" role="alert">{searchError}</p></section>
      <section id="rooms" className="rooms-section" aria-labelledby="rooms-title"><div className="section-header"><div><span className="eyebrow">02 / THE COLLECTION</span><h2 id="rooms-title">Rooms with <em>room to breathe.</em></h2></div><div className="results-controls"><span aria-live="polite">{search ? `${visible.length} rooms for your stay` : "Six ways to stay"}</span><label>Sort <select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="price">Price: low to high</option><option value="space">Most space</option></select></label></div></div>{visible.length ? <div className="room-grid">{visible.map((room, index) => <article className="room-card" key={room.id}><RoomVisual room={room}/><div className="room-card-content"><div className="room-number">0{index+1} — {room.eyebrow}</div><h3>{room.name}</h3><p>{room.description}</p><div className="room-meta"><span>{room.sizeSqm} m²</span><span>{room.beds}</span><span>Up to {room.maxGuests}</span></div><div className="room-card-bottom"><span>From <strong>{money(room.nightlyRate)}</strong> / night</span><button type="button" onClick={() => {setSelectedId(room.id); requestAnimationFrame(() => document.getElementById("room-detail")?.scrollIntoView({ behavior: "smooth", block: "center" }));}}>Explore room ↗</button></div></div></article>)}</div> : <div className="empty-state"><h3>No rooms for this stay</h3><p>Try different dates or fewer guests to see more spaces.</p><button type="button" onClick={() => { setSearch(null); setSearchError(""); }}>See all rooms</button></div>}{selected && <section id="room-detail" className="room-detail" aria-labelledby="detail-title"><RoomVisual room={selected}/><div><span className="eyebrow">A CLOSER LOOK</span><h3 id="detail-title">{selected.name}</h3><p>{selected.longDescription}</p><ul>{selected.features.map(feature => <li key={feature}>{feature}</li>)}</ul><a href="#stay-finder">Check your dates ↗</a><button className="detail-close" type="button" onClick={() => setSelectedId(null)}>Close details</button></div></section>}</section>
      <section id="house" className="house-section"><div><span className="eyebrow light">03 / THE HOUSE</span><h2>Not just a room.<br/><em>A change of rhythm.</em></h2></div><div><p>At Sable & Sky, the best moments rarely need a plan. A long breakfast. A walk with no destination. The afternoon light finding its way into your room.</p><p>Our fictional coastal house is imagined for travellers who want to feel the place, not rush through it.</p><a href="#stay-finder">Find your space ↗</a></div></section>
    </main><footer><span className="brand-name">Sable <i>&</i> Sky</span><span>Illustrative rooms, rates, and availability. No actual reservation is made.</span><a href="#top">Back to top ↑</a></footer>
  </>;
}
