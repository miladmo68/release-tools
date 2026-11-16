import type { Guest, ReceptionTable, SeatingPlan } from "./types";

const person = (id: string, name: string, party: string, side: Guest["side"], rsvp: Guest["rsvp"], meal: Guest["meal"], note = ""): Guest => ({ id, name, party, side, rsvp, meal, note });

export const guests: Guest[] = [
  person("g01", "Avery Rowan", "The couple", "Avery", "attending", "garden"),
  person("g02", "Jules Mercer", "The couple", "Jules", "attending", "coast"),
  person("g03", "Elena Rowan", "Rowan family", "Avery", "attending", "garden", "Mother of Avery"),
  person("g04", "Daniel Rowan", "Rowan family", "Avery", "attending", "hearth", "Father of Avery"),
  person("g05", "Mina Rowan", "Rowan family", "Avery", "attending", "coast"),
  person("g06", "Nico Rowan", "Rowan family", "Avery", "attending", "garden"),
  person("g07", "Margot Mercer", "Mercer family", "Jules", "attending", "hearth", "Mother of Jules"),
  person("g08", "Theo Mercer", "Mercer family", "Jules", "attending", "coast", "Father of Jules"),
  person("g09", "Iris Mercer", "Mercer family", "Jules", "attending", "garden"),
  person("g10", "Felix Mercer", "Mercer family", "Jules", "attending", "hearth"),
  person("g11", "Leila Moore", "Old friends", "Friends", "attending", "garden"),
  person("g12", "Rafi Moore", "Old friends", "Friends", "attending", "coast"),
  person("g13", "Cora Ives", "Old friends", "Friends", "attending", "garden"),
  person("g14", "Ben Ives", "Old friends", "Friends", "attending", "hearth"),
  person("g15", "Sana Malik", "Studio friends", "Friends", "attending", "coast"),
  person("g16", "Owen Malik", "Studio friends", "Friends", "attending", "garden"),
  person("g17", "June Park", "Studio friends", "Friends", "attending", "hearth"),
  person("g18", "Ellis Park", "Studio friends", "Friends", "attending", "coast"),
  person("g19", "Amara Bell", "Neighbours", "Friends", "attending", "garden"),
  person("g20", "Miles Bell", "Neighbours", "Friends", "attending", "coast"),
  person("g21", "Noor Ellis", "Neighbours", "Friends", "attending", "hearth"),
  person("g22", "Talia Reed", "Neighbours", "Friends", "attending", "garden"),
  person("g23", "Arlo Reed", "Neighbours", "Friends", "attending", "coast"),
  person("g24", "Priya Sen", "Art school", "Friends", "attending", "garden"),
  person("g25", "Luca Sen", "Art school", "Friends", "attending", "hearth"),
  person("g26", "Remy Vale", "Art school", "Friends", "attending", "coast"),
  person("g27", "Harper Vale", "Art school", "Friends", "pending", "garden"),
  person("g28", "Mae Calder", "Extended family", "Avery", "pending", "hearth"),
  person("g29", "Sofia Calder", "Extended family", "Avery", "pending", "garden"),
  person("g30", "Samir Noor", "Extended family", "Jules", "declined", "coast")
];

export const tables: ReceptionTable[] = [
  { id: "head", name: "The couple", capacity: 2, x: 50, y: 16, shape: "long" },
  { id: "t1", name: "Table 01", capacity: 6, x: 22, y: 40, shape: "round" },
  { id: "t2", name: "Table 02", capacity: 6, x: 50, y: 40, shape: "round" },
  { id: "t3", name: "Table 03", capacity: 6, x: 78, y: 40, shape: "round" },
  { id: "t4", name: "Table 04", capacity: 6, x: 35, y: 75, shape: "round" },
  { id: "t5", name: "Table 05", capacity: 6, x: 65, y: 75, shape: "round" }
];

export const initialPlan: SeatingPlan = {
  assignments: Object.fromEntries(guests.map((guest, index) => [guest.id, index < 2 ? "head" : index < 6 ? "t1" : index < 10 ? "t2" : index < 14 ? "t3" : index < 18 ? "t4" : index < 22 ? "t5" : null])),
  savedAt: null
};
