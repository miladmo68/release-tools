export interface Slot { iso: string; label: string }

const TIMES = ["09:30", "11:00", "13:30", "15:00", "17:30"];

/** Next six open days (Sundays have a shorter schedule) from a reference date. */
export function openDays(from: Date): { key: string; label: string; times: string[] }[] {
  const days: { key: string; label: string; times: string[] }[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  while (days.length < 6) {
    const sunday = d.getDay() === 0;
    days.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" }),
      times: sunday ? TIMES.slice(1, 4) : TIMES
    });
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function reference(stock: string, day: string, time: string): string {
  let h = 0;
  for (const c of `${stock}${day}${time}`) h = (h * 31 + c.charCodeAt(0)) % 99991;
  return `KV-${String(h).padStart(5, "0")}`;
}

export function icsFile(title: string, day: string, time: string, ref: string): string {
  const [y, m, d] = day.split("-");
  const [hh, mm] = time.split(":");
  const start = `${y}${m}${d}T${hh}${mm}00`;
  const endH = String(Number(hh) + 1).padStart(2, "0");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Kestrel Motor Co//Test drive//EN", "BEGIN:VEVENT", `UID:${ref}@kestrel.example`,
    `DTSTART:${start}`, `DTEND:${y}${m}${d}T${endH}${mm}00`, `SUMMARY:${title}`, "LOCATION:1180 Dufferin Works Road\\, Toronto", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}
