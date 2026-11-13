import { useState } from "react";
import extrasData from "../data/extras.json";
import type { BookingPreview, Extra, Room, StaySearch } from "../domain/types";
import { isRoomAvailable, money, quoteStay, validateSearch } from "../../shared/stay.js";

const extras = extrasData as Extra[];

export function StayPlanner({ room, search, onSave }: { room: Room; search: StaySearch; onSave: (preview: BookingPreview) => void }) {
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const validStay = !validateSearch(search) && isRoomAvailable(room, search);
  const selection = { ...search, roomId: room.id, extraIds };
  const quote = validStay ? quoteStay(room, extras, selection) : null;

  function toggleExtra(id: string) {
    setExtraIds(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
    setSaved(false);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchError = validateSearch(search);
    if (searchError) { setError(searchError); return; }
    if (!isRoomAvailable(room, search)) { setError("This room is unavailable for your dates and party. Try another room or change your dates."); return; }
    if (guestName.trim().length < 2) { setError("Enter a name with at least two characters."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) { setError("Enter a valid email address."); return; }
    const preview: BookingPreview = { ...selection, id: crypto.randomUUID(), guestName: guestName.trim(), guestEmail: guestEmail.trim().toLowerCase(), createdAt: new Date().toISOString(), quote: quoteStay(room, extras, selection) };
    onSave(preview); setError(""); setSaved(true);
  }

  return <form className="stay-planner" onSubmit={submit} noValidate>
    <div className="stay-planner-top"><span className="eyebrow">MAKE IT YOURS</span><h4>Build a stay preview</h4><p>{search.checkIn} → {search.checkOut} · {search.guests} {search.guests === 1 ? "guest" : "guests"}</p></div>
    <fieldset><legend>Add a little more</legend>{extras.map(extra => <label className="extra-row" key={extra.id}><input type="checkbox" checked={extraIds.includes(extra.id)} onChange={() => toggleExtra(extra.id)}/><span><strong>{extra.name}</strong><small>{extra.description}</small></span><b>+{money(extra.price)}{extra.unit === "night" ? "/guest/night" : ""}</b></label>)}</fieldset>
    <div className="guest-fields"><label>Your name<input value={guestName} onChange={e => {setGuestName(e.target.value); setSaved(false);}} autoComplete="name" maxLength={80}/></label><label>Email address<input value={guestEmail} onChange={e => {setGuestEmail(e.target.value); setSaved(false);}} type="email" autoComplete="email" maxLength={160}/></label></div>
    {quote && <div className="quote-breakdown"><div><span>Room · {quote.nights} {quote.nights === 1 ? "night" : "nights"}</span><strong>{money(quote.roomSubtotal)}</strong></div><div><span>Extras</span><strong>{money(quote.extrasSubtotal)}</strong></div><div><span>Estimated tax (13%)</span><strong>{money(quote.taxes)}</strong></div><div className="quote-total"><span>Illustrative total</span><strong>{money(quote.total)}</strong></div></div>}
    {!validStay && <p className="form-error">This room is not available for the selected dates and party. Change your search to continue.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {saved && <p className="save-confirmation" role="status">Preview saved in this browser. No reservation or payment was made.</p>}
    <button className="save-button" type="submit" disabled={!validStay}>Save stay preview ↗</button>
  </form>;
}
