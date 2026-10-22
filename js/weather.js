// js/weather.js
/**
 * Moduł danych meteorologicznych (IMGW REST API).
 * 
 * Endpoint API: https://danepubliczne.imgw.pl/api/data/synop/station/{stacja}
 * Domyślna stacja: 'krakow' (lub np. 'warszawa', 'wroclaw', 'gdansk')
 * 
 * Kluczowe pola w zwracanym obiekcie JSON:
 * - data.stacja              (np. "Kraków")
 * - data.temperatura         (np. "12.4")
 * - data.cisnienie           (np. "1024.2")
 * - data.predkosc_wiatru     (np. "3")
 * - data.wilgotnosc_wzgledna (np. "78.5")
 * 
 * Odpowiedzialność:
 * - Asynchroniczne pobranie danych dla wybranej stacji (fetch, async/await, weryfikacja response.ok)
 * - Obsługa stanu ładowania (loading state) oraz prezentacja błędów sieciowych w UI (bez blokującego alert())
 * - Bezpieczne wyrenderowanie danych pogodowych w dedykowanym kafelku DOM (Zero-XSS)
 */

export async function initWeather(city = "krakow") {
  const box = document.querySelector("#weather-box");

  box.textContent = "Ładowanie pogody...";

  try {
    const response = await fetch("https://danepubliczne.imgw.pl/api/data/synop/station/" + city);

    if (!response.ok) {
      throw new Error("Błąd serwera: " + response.status);
    }

    const data = await response.json();
    box.textContent = "";

    const stationEl = document.createElement("p");
    stationEl.textContent = data.stacja;
    stationEl.className = "weather-station";

    const tempEl = document.createElement("p");
    tempEl.textContent = data.temperatura + " °C";
    tempEl.className = "weather-temp";

    const pressureEl = document.createElement("p");
    pressureEl.textContent = "Ciśnienie: " + data.cisnienie + " hPa";

    const windEl = document.createElement("p");
    windEl.textContent = "Wiatr: " + data.predkosc_wiatru + " m/s";

    const humidityEl = document.createElement("p");
    humidityEl.textContent = "Wilgotność: " + data.wilgotnosc_wzgledna + " %";

    box.append(stationEl, tempEl, pressureEl, windEl, humidityEl);
  } catch (error) {
    box.textContent = "Nie udało się pobrać pogody. Spróbuj później.";
    box.classList.add("weather-error");
  }
}
