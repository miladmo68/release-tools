export type RSVP = "attending" | "pending" | "declined";
export type Meal = "garden" | "coast" | "hearth";
export type Side = "Avery" | "Jules" | "Friends";

export interface Guest {
  id: string;
  name: string;
  party: string;
  side: Side;
  rsvp: RSVP;
  meal: Meal;
  note: string;
}

export interface ReceptionTable {
  id: string;
  name: string;
  capacity: number;
  x: number;
  y: number;
  shape: "round" | "long";
}

export type Assignments = Record<string, string | null>;

export interface SeatingPlan {
  assignments: Assignments;
  savedAt: string | null;
}
