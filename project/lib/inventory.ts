import type { Filters, FinanceTerms, Vehicle } from "./types";
import { monthlyPayment } from "./finance";

export const VEHICLES: Vehicle[] = [
  { id: "norvik-lumen-s", year: 2022, make: "Norvik", model: "Lumen", trim: "S Long Range", body: "sedan", fuel: "Electric", price: 38900, mileage: 28400, paint: "Glacier White", paintHex: "#e8ebe9", power: 283, economy: "480 km range", seats: 5, stock: "KM-2041", inspected: 164, features: ["Heat pump", "Adaptive cruise", "Panoramic roof", "Wireless charging"], note: "Single owner, service history on file." },
  { id: "aldren-ridge-sport", year: 2021, make: "Aldren", model: "Ridge", trim: "Sport AWD", body: "suv", fuel: "Hybrid", price: 34500, mileage: 46200, paint: "Basalt Grey", paintHex: "#4b5358", power: 219, economy: "5.9 L/100 km", seats: 5, stock: "KM-2038", inspected: 164, features: ["Tow package", "Heated seats", "360 camera", "Roof rails"], note: "New tires fitted at 45,000 km." },
  { id: "tessaro-pico-city", year: 2023, make: "Tessaro", model: "Pico", trim: "City", body: "hatch", fuel: "Petrol", price: 19900, mileage: 12100, paint: "Signal Yellow", paintHex: "#e9c222", power: 118, economy: "5.4 L/100 km", seats: 5, stock: "KM-2052", inspected: 164, features: ["Phone mirroring", "Lane assist", "Rear camera", "Keyless entry"], note: "Nearly new, factory warranty remaining." },
  { id: "ferrow-vanta-gt", year: 2020, make: "Ferrow", model: "Vanta", trim: "GT 3.0T", body: "coupe", fuel: "Petrol", price: 48800, mileage: 31900, paint: "Midnight Blue", paintHex: "#14233f", power: 382, economy: "9.6 L/100 km", seats: 4, stock: "KM-2017", inspected: 164, features: ["Sport exhaust", "Launch control", "Carbon trim", "Performance brakes"], note: "Garage kept, never tracked." },
  { id: "aldren-haul-pro", year: 2022, make: "Aldren", model: "Haul", trim: "Pro Crew Cab", body: "truck", fuel: "Diesel", price: 52400, mileage: 38800, paint: "Forest Green", paintHex: "#27412f", power: 305, economy: "9.1 L/100 km", seats: 5, stock: "KM-2029", inspected: 164, features: ["Bed liner", "Trailer brake", "Locking diff", "Tow 4,100 kg"], note: "Work-ready, with a clean inspection report." },
  { id: "norvik-stride-wagon", year: 2021, make: "Norvik", model: "Stride", trim: "Touring Wagon", body: "wagon", fuel: "Hybrid", price: 31200, mileage: 52100, paint: "Sand Dune", paintHex: "#b9a98a", power: 196, economy: "4.8 L/100 km", seats: 5, stock: "KM-2044", inspected: 164, features: ["Power tailgate", "Roof box mounts", "Heated wheel", "Blind-spot alert"], note: "Family car, immaculate cargo area." },
  { id: "tessaro-aura-ev", year: 2023, make: "Tessaro", model: "Aura", trim: "Edition EV", body: "hatch", fuel: "Electric", price: 33800, mileage: 9800, paint: "Coral Pink", paintHex: "#d9857a", power: 201, economy: "390 km range", seats: 5, stock: "KM-2060", inspected: 164, features: ["Fast charging", "Heated seats", "Digital key", "Vegan interior"], note: "Includes a home charger." },
  { id: "ferrow-orbit-suv", year: 2022, make: "Ferrow", model: "Orbit", trim: "Premium", body: "suv", fuel: "Petrol", price: 41900, mileage: 33300, paint: "Pearl Silver", paintHex: "#b7bcc1", power: 261, economy: "8.2 L/100 km", seats: 7, stock: "KM-2035", inspected: 164, features: ["Third row", "Air suspension", "Head-up display", "Massage seats"], note: "Seven seats, one careful owner." },
  { id: "norvik-lumen-base", year: 2020, make: "Norvik", model: "Lumen", trim: "Standard Range", body: "sedan", fuel: "Electric", price: 27900, mileage: 61400, paint: "Ruby Red", paintHex: "#8a1f2b", power: 201, economy: "350 km range", seats: 5, stock: "KM-2009", inspected: 164, features: ["Driver assist", "Glass roof", "Dash camera", "Heated rear seats"], note: "Battery health report included." },
  { id: "aldren-ridge-trail", year: 2019, make: "Aldren", model: "Ridge", trim: "Trail", body: "suv", fuel: "Petrol", price: 24800, mileage: 78900, paint: "Moss Olive", paintHex: "#5c6240", power: 187, economy: "9.4 L/100 km", seats: 5, stock: "KM-1988", inspected: 164, features: ["Skid plates", "All-terrain tires", "Hill descent", "Roof rack"], note: "Great value, fully serviced." },
  { id: "tessaro-pico-sport", year: 2021, make: "Tessaro", model: "Pico", trim: "Sport", body: "hatch", fuel: "Petrol", price: 16400, mileage: 41500, paint: "Racing Red", paintHex: "#c7352c", power: 140, economy: "6.1 L/100 km", seats: 5, stock: "KM-2006", inspected: 164, features: ["Sport seats", "Manual gearbox", "Alloy wheels", "Cruise control"], note: "A proper small hot hatch." },
  { id: "ferrow-vanta-base", year: 2019, make: "Ferrow", model: "Vanta", trim: "2.0T", body: "coupe", fuel: "Petrol", price: 29500, mileage: 58200, paint: "Carbon Black", paintHex: "#1b1d20", power: 255, economy: "8.0 L/100 km", seats: 4, stock: "KM-1994", inspected: 164, features: ["Sport seats", "Limited slip", "Premium audio", "Adaptive dampers"], note: "Clean title, tidy cosmetic condition." },
  { id: "norvik-stride-diesel", year: 2018, make: "Norvik", model: "Stride", trim: "Estate TDI", body: "wagon", fuel: "Diesel", price: 18700, mileage: 96500, paint: "Slate Blue", paintHex: "#4f6a7e", power: 174, economy: "5.2 L/100 km", seats: 5, stock: "KM-1950", inspected: 164, features: ["Dual-zone climate", "Tow bar", "Parking sensors", "Satellite navigation"], note: "Highway miles, full records." },
  { id: "aldren-haul-base", year: 2020, make: "Aldren", model: "Haul", trim: "Work Cab", body: "truck", fuel: "Petrol", price: 28400, mileage: 71200, paint: "Arctic White", paintHex: "#ecefef", power: 275, economy: "11.2 L/100 km", seats: 3, stock: "KM-1999", inspected: 164, features: ["Bed liner", "Tow hitch", "Vinyl floor", "Rear camera"], note: "Fleet maintained, ready to work." },
  { id: "ferrow-orbit-hybrid", year: 2023, make: "Ferrow", model: "Orbit", trim: "Hybrid Limited", body: "suv", fuel: "Hybrid", price: 47600, mileage: 15200, paint: "Copper Dusk", paintHex: "#a0603a", power: 296, economy: "6.4 L/100 km", seats: 5, stock: "KM-2058", inspected: 164, features: ["Heated and cooled seats", "Hands-free driving", "Premium audio", "Sunshade"], note: "Demonstrator with low mileage." },
  { id: "tessaro-aura-city", year: 2022, make: "Tessaro", model: "Aura", trim: "City EV", body: "hatch", fuel: "Electric", price: 24900, mileage: 22600, paint: "Mint Frost", paintHex: "#9fc7b4", power: 134, economy: "310 km range", seats: 4, stock: "KM-2047", inspected: 164, features: ["Compact turning circle", "Heated seats", "Fast charging", "Cabin pre-heat"], note: "Ideal for city commuting." }
];

export function applyFilters(list: Vehicle[], f: Filters, terms: FinanceTerms): Vehicle[] {
  const q = f.query.trim().toLowerCase();
  const out = list.filter(v => {
    if (f.body !== "all" && v.body !== f.body) return false;
    if (f.fuel !== "all" && v.fuel !== f.fuel) return false;
    if (q && !`${v.year} ${v.make} ${v.model} ${v.trim} ${v.paint}`.toLowerCase().includes(q)) return false;
    return monthlyPayment(v.price, terms) <= f.budget;
  });
  const pay = (v: Vehicle) => monthlyPayment(v.price, terms);
  const sorters: Record<Filters["sort"], (a: Vehicle, b: Vehicle) => number> = {
    payment: (a, b) => pay(a) - pay(b),
    price: (a, b) => a.price - b.price,
    mileage: (a, b) => a.mileage - b.mileage,
    year: (a, b) => b.year - a.year
  };
  return out.sort(sorters[f.sort]);
}

export function findVehicle(id: string): Vehicle | undefined {
  return VEHICLES.find(v => v.id === id);
}
