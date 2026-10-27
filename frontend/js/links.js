// js/links.js

import { linksApi } from "./api.js";
import { onLoginSuccess, onLogoutSuccess } from "./auth.js";

/**
 * Moduł dynamicznego rejestru odnośników w panelu bocznym (<aside id="linki">).
 * 
 * Odpowiedzialność:
 * - Obsługa formularza dodawania odnośnika (zdarzenie 'submit', preventDefault)
 * - Walidacja danych (minimalna długość nazwy, weryfikacja poprawności URL za pomocą sanitizeUrl)
 * - Dynamiczne renderowanie listy wpisów w DOM (Zero-XSS: createElement, textContent, append, rel="noopener noreferrer")
 * - Obsługa usuwania elementów za pomocą delegacji zdarzeń (Event Delegation z użyciem e.target.closest)
 * - Zapewnienie trwałości rejestru linków w localStorage (JSON.parse / JSON.stringify)
 */

/**
 * Pomocnicza funkcja weryfikująca i sanityzująca adres URL wprowadzony przez użytkownika:
 * - Wymaga podania pełnego adresu z bezpiecznym protokołem (http: lub https:)
 * - Odrzuca adresy niepoprawne składniowo oraz niebezpieczne pseudoprotokoły (javascript:, data:)
 * - Zwraca znormalizowany, bezpieczny ciąg URL (href) lub null w przypadku nieprawidłowego adresu
 * @param {string} urlString
 * @returns {string|null}
 */
function sanitizeUrl(urlString) {
  // .trim() usuwa białe znaki (spacje, tabulatory, nowe linie) z początku i końca tekstu
  const trimmed = urlString.trim();
  if (!trimmed) return null;

  try {
    // Krok 1 (Weryfikacja składni): Natywny parser new URL() wymaga absolutnego adresu ze schematem.
    // Jeśli ciąg nie posiada protokołu (np. "onet.pl") lub zawiera błędy składniowe,
    // konstruktor rzuca wyjątek TypeError: Invalid URL, który bezpiecznie przechwytujemy w bloku catch.
    const parsed = new URL(trimmed);

    // Krok 2 (Biała lista protokołów / AppSec): Parser new URL() akceptuje każdy poprawny schemat URI,
    // w tym niebezpieczne dla bezpieczeństwa DOM wektory XSS (np. "javascript:alert(1)", "data:text/html,...").
    // Dlatego bezwzględnie weryfikujemy białą listę: dopuszczamy wyłącznie protokoły "http:" oraz "https:".
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }

    return null;
  } catch {
    // Przechwycenie błędu składniowego rzuconego przez new URL()
    return null;
  }
}


export function initLinks() {
  const form = document.getElementById("link-form");
  const nameInput = document.getElementById("link-name");
  const urlInput = document.getElementById("link-url");
  const errorEl = document.getElementById("link-error");
  const list = document.getElementById("saved-links");

  const panel = document.getElementById("linki");
  panel.classList.add("hidden");

  let links = [];
  async function loadLinks() {
    try {
      links = await linksApi.getAll();
      showLinks();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  }

  function showLinks() {
    list.textContent = "";

    for (let i = 0; i < links.length; i++) {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.href = links[i].url;
      a.textContent = links[i].title;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Usuń";
      button.className = "delete-btn";
      button.dataset.id = links[i].id;

      li.append(a, button);
      list.append(li);
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    errorEl.textContent = "";
    nameInput.classList.remove("invalid");
    urlInput.classList.remove("invalid");

    const name = nameInput.value.trim();
    const url = sanitizeUrl(urlInput.value);

    if (name.length < 3) {
      errorEl.textContent = "Nazwa musi mieć co najmniej 3 znaki.";
      nameInput.classList.add("invalid");
      return;
    }

    if (url === null) {
      errorEl.textContent = "Podaj poprawny adres zaczynający się od http:// lub https://";
      urlInput.classList.add("invalid");
      return;
    }

    try{
      await linksApi.create({ title: name, url });
      form.reset();
      await loadLinks();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  list.addEventListener("click", async function (event) {
    const button = event.target.closest(".delete-btn");
    if (!button) return;

    try {
      await linksApi.delete(button.dataset.id);
      await loadLinks();
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });

  onLoginSuccess(function () {
    panel.classList.remove("hidden");
    loadLinks();  
  });

  onLogoutSuccess(function () {
    links = [];
    list.textContent = "";
    panel.classList.add("hidden");
  });
}
