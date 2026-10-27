// js/calendar.js
/**
 * Moduł kartki z kalendarza.
 * 
 * Odpowiedzialność:
 * - Pobranie bieżącej daty systemowej (new Date())
 * - Sformatowanie dnia tygodnia, dnia i miesiąca w języku polskim
 *   (Wskazówka: new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }))
 * - Bezpieczne wstrzyknięcie sformatowanej treści do dedykowanego slotu DOM (Zero-XSS)
 */



export function initCalendar() {
  const box = document.getElementById("calendar-box");

  const text = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  const parts = text.split(" ");

  const yearEl = document.createElement("p");
  yearEl.textContent = parts[3];
  yearEl.className = "calendar-year";

  const dayEl = document.createElement("p");
  dayEl.textContent = parts[1];
  dayEl.className = "calendar-day";

  const monthEl = document.createElement("p");
  monthEl.textContent = parts[2];
  monthEl.className = "calendar-month";

  const weekdayEl = document.createElement("p");
  weekdayEl.textContent = parts[0].replace(",", "");
  weekdayEl.className = "calendar-weekday";

  box.append(yearEl, dayEl, monthEl, weekdayEl);
}
