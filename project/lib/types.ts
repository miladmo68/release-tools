export type Body = "sedan" | "suv" | "hatch" | "coupe" | "wagon" | "truck";
export type Fuel = "Petrol" | "Hybrid" | "Electric" | "Diesel";

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body: Body;
  fuel: Fuel;
  price: number;
  mileage: number;
  paint: string;
  paintHex: string;
  power: number; // horsepower
  economy: string;
  seats: number;
  stock: string;
  inspected: number; // points passed
  features: string[];
  note: string;
}

export interface Filters {
  budget: number; // max monthly payment
  body: Body | "all";
  fuel: Fuel | "all";
  query: string;
  sort: "payment" | "price" | "mileage" | "year";
}

export interface FinanceTerms {
  down: number;
  months: number;
  apr: number;
  tradeIn: number;
}
