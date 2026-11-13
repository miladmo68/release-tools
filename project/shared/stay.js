const DAY = 86_400_000;

/** @param {string} iso */
export function dateNumber(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN;
  const value = Date.parse(`${iso}T00:00:00.000Z`);
  return Number.isFinite(value) && new Date(value).toISOString().slice(0, 10) === iso ? value : NaN;
}

/** @param {string} checkIn @param {string} checkOut */
export function nightsBetween(checkIn, checkOut) {
  return (dateNumber(checkOut) - dateNumber(checkIn)) / DAY;
}

/** @param {{checkIn:string,checkOut:string,guests:number}} search @param {string} today */
export function validateSearch(search, today = new Date().toISOString().slice(0, 10)) {
  const start = dateNumber(search.checkIn);
  const end = dateNumber(search.checkOut);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "Choose valid arrival and departure dates.";
  if (start < dateNumber(today)) return "Arrival must be today or later.";
  if (end <= start) return "Departure must be after arrival.";
  if ((end - start) / DAY > 28) return "Choose a stay of 28 nights or fewer.";
  if (!Number.isInteger(search.guests) || search.guests < 1 || search.guests > 4) return "Choose between one and four guests.";
  return null;
}

/** @param {string} checkIn @param {string} checkOut */
export function stayDates(checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  if (!Number.isInteger(nights) || nights <= 0 || nights > 28) return [];
  return Array.from({ length: nights }, (_, index) => new Date(dateNumber(checkIn) + index * DAY).toISOString().slice(0, 10));
}

/** @param {{maxGuests:number,unavailable:string[],inventory:number}} room @param {{checkIn:string,checkOut:string,guests:number}} search */
export function isRoomAvailable(room, search) {
  const dates = stayDates(search.checkIn, search.checkOut);
  return dates.length > 0 && search.guests <= room.maxGuests && room.inventory > 0 && dates.every(date => !room.unavailable.includes(date));
}

/** @param {Array<{maxGuests:number,unavailable:string[],inventory:number}>} rooms @param {{checkIn:string,checkOut:string,guests:number}} search */
export function availableRooms(rooms, search) {
  return rooms.filter(room => isRoomAvailable(room, search));
}

/** @param {{nightlyRate:number}} room @param {Array<{id:string,price:number,unit:string}>} extras @param {{checkIn:string,checkOut:string,extraIds:string[],guests:number}} selection */
export function quoteStay(room, extras, selection) {
  const dates = stayDates(selection.checkIn, selection.checkOut);
  if (!dates.length) throw new Error("Choose a valid stay before requesting a quote.");
  const nightlyRates = dates.map(date => {
    const day = new Date(`${date}T00:00:00Z`).getUTCDay();
    return Math.round(room.nightlyRate * (day === 5 || day === 6 ? 1.12 : 1));
  });
  const roomSubtotal = Math.round(nightlyRates.reduce((sum, rate) => sum + rate, 0) * (dates.length >= 5 ? 0.92 : 1));
  const chosen = extras.filter(extra => selection.extraIds.includes(extra.id));
  const extrasSubtotal = chosen.reduce((sum, extra) => sum + extra.price * (extra.unit === "night" ? dates.length * selection.guests : 1), 0);
  const taxes = Math.round((roomSubtotal + extrasSubtotal) * 0.13);
  return { nights: dates.length, nightlyRates, roomSubtotal, extrasSubtotal, taxes, total: roomSubtotal + extrasSubtotal + taxes };
}

/** @param {number} amount */
export function money(amount) { return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(amount); }
