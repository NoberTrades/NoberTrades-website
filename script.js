// ==========================================
// NOBERTRADES — DYNAMIC WEBSITE ENGINE
// ==========================================

const API_URL = "https://nobertrades-api.nobertrades.workers.dev";

// ---------- BASIC HELPERS ----------

function n(id) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value) || 0 : 0;
}

function money(v) {
  return "$" + Number(v).toFixed(2);
}

// ---------- RISK CALCULATOR ----------

function calcRisk() {
  const balance = n("bal");
  const risk = n("risk");
  const sl = n("sl");
  const pip = n("pip");

  if (!sl || !pip) {
    document.getElementById("riskResult").textContent = "0.00 lots";
    return;
  }

  const lot = (balance * risk / 100) / (sl * pip);

  document.getElementById("riskResult").textContent =
    Math.max(0, lot).toFixed(2) + " lots";
}

// ---------- RISK / REWARD ----------

function calcRR() {
  const entry = n("entry");
  const stop = n("stop");
  const tp = n("tp");

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(tp - entry);

  document.getElementById("rrResult").textContent =
    "R:R " + (risk ? (reward / risk).toFixed(2) : "0.00");
}

// ---------- COMPOUNDING ----------

function calcCompound() {
  const start = n("start");
  const ret = n("ret");
  const periods = n("periods");

  const value =
    start * Math.pow(1 + ret / 100, periods);

  document.getElementById("compoundResult").textContent =
    money(value);
}

// ---------- PROFIT / LOSS ----------

function calcPL() {
  const points = n("points");
  const lots = n("lots");
  const pointval = n("pointval");

  const value = points * lots * pointval;

  document.getElementById("plResult").textContent =
    money(value);
}

// ---------- LIVE MARKET DATA ----------

async function getQuote(symbol) {
  try {
    const response = await fetch(
      `${API_URL}/quote?symbol=${encodeURIComponent(symbol)}`
    );

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return await response.json();

  } catch (error) {
    console.error(`Failed to load ${symbol}:`, error);
    return null;
  }
}


// ---------- UPDATE MARKET TERMINAL ----------

async function updateMarkets() {

  const symbols = [
    "XAUUSD",
    "US100",
    "USOIL",
    "EURUSD",
    "GBPUSD"
  ];

  const results = await Promise.all(
    symbols.map(symbol => getQuote(symbol))
  );

  results.forEach((data, index) => {

    if (!data || data.success !== true || !data.data) {
      return;
    }

    const symbol = symbols[index];
    const quote = data.data;

    const price =
      Number(quote.close || quote.price || 0);

    const change =
      Number(quote.percent_change || quote.change_percent || 0);

    updateQuoteCard(symbol, price, change);
  });

  updateLastMarketUpdate();
}


// ---------- UPDATE QUOTE CARDS ----------

function updateQuoteCard(symbol, price, change) {

  const quoteCards =
    document.querySelectorAll(".quotes > div");

  quoteCards.forEach(card => {

    const name =
      card.querySelector("b");

    if (!name) return;

    const text =
      name.textContent.trim().toUpperCase();

    let match = false;

    if (symbol === "XAUUSD" && text === "XAUUSD")
      match = true;

    if (symbol === "US100" && text === "US100")
      match = true;

    if (symbol === "USOIL" && text === "USOIL")
      match = true;

    if (!match) return;

    const priceElement =
      card.querySelector("strong");

    if (priceElement) {
      priceElement.textContent =
        formatPrice(symbol, price);
    }
  });

  // Update hero price for XAUUSD
  if (symbol === "XAUUSD") {

    const heroPrice =
      document.querySelector(".terminal .price");

    if (heroPrice) {

      heroPrice.innerHTML =
        `$${price.toFixed(2)} <small>${change >= 0 ? "+" : ""}${change.toFixed(2)}%</small>`;
    }
  }
}


// ---------- PRICE FORMAT ----------

function formatPrice(symbol, price) {

  if (symbol === "XAUUSD") {
    return price.toFixed(2);
  }

  if (symbol === "US100") {
    return price.toFixed(2);
  }

  if (symbol === "USOIL") {
    return price.toFixed(2);
  }

  return price.toFixed(5);
}


// ---------- LIVE TICKER ----------

function updateTicker() {

  const ticker =
    document.querySelector(".ticker");

  if (!ticker) return;

  ticker.dataset.live = "true";
}


// ---------- LAST UPDATE ----------

function updateLastMarketUpdate() {

  let indicator =
    document.getElementById("marketStatus");

  if (!indicator) {

    indicator =
      document.createElement("div");

    indicator.id = "marketStatus";

    indicator.style.fontSize = "12px";
    indicator.style.opacity = "0.6";
    indicator.style.marginTop = "8px";

    const terminal =
      document.querySelector(".terminal");

    if (terminal) {
      terminal.appendChild(indicator);
    }
  }

  indicator.textContent =
    "● Live market data • Updated " +
    new Date().toLocaleTimeString();
}


// ---------- MOBILE MENU ----------

function setupMenu() {

  const menu =
    document.querySelector(".menu");

  const nav =
    document.querySelector(".nav nav");

  if (!menu || !nav) return;

  menu.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}


// ---------- INITIALIZE ----------

function initializeNoberTrades() {

  // Calculators
  calcRisk();
  calcRR();
  calcCompound();
  calcPL();

  // Navigation
  setupMenu();

  // Market data
  updateMarkets();

  // Refresh market data every 15 seconds
  setInterval(updateMarkets, 15000);

  // Mark ticker as dynamic
  updateTicker();

  console.log(
    "NoberTrades dynamic engine initialized."
  );
}


// ---------- START ----------

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    initializeNoberTrades
  );

} else {

  initializeNoberTrades();

}
