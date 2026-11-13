export type Room = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  longDescription: string;
  sizeSqm: number;
  beds: string;
  maxGuests: number;
  nightlyRate: number;
  inventory: number;
  features: string[];
  accent: string;
  illustration: "arch" | "terrace" | "suite" | "studio" | "loft" | "garden";
  unavailable: string[];
};

export type Extra = { id: string; name: string; description: string; price: number; unit: "stay" | "night" };
export type StaySearch = { checkIn: string; checkOut: string; guests: number };
export type StaySelection = StaySearch & { roomId: string; extraIds: string[] };
export type StayQuote = { nights: number; roomSubtotal: number; extrasSubtotal: number; taxes: number; total: number; nightlyRates: number[] };
export type BookingPreview = StaySelection & { id: string; guestName: string; guestEmail: string; createdAt: string; quote: StayQuote };
