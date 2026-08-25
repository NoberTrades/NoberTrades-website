// ==========================================
// NOBERTRADES — DYNAMIC WEBSITE ENGINE
// ==========================================

const API_URL = "https://nobertrades-api.nobertrades.workers.dev";

// ==========================================
// BASIC HELPERS
// ==========================================

function n(id) {
  const el = document.getElementById(id);
  return el ? parseFloat(el.value) || 0 : 0;
}

function money(v) {
  return "$" + Number(v || 0).toFixed(2);
}


// ==========================================
// RISK CALCULATOR
// ==========================================

function calcRisk() {
  const balance = n("bal");
  const risk = n("risk");
  const sl = n("sl");
  const pip = n("pip");

  const result = document.getElementById("riskResult");

  if (!result) return;

  if (!sl || !pip) {
    result.textContent = "0.00 lots";
    return;
  }

  const lot = (balance * risk / 100) / (sl * pip);

  result.textContent =
    Math.max(0, lot).toFixed(2) + " lots";
}


// ==========================================
// RISK / REWARD CALCULATOR
// ==========================================

function calcRR() {
  const entry = n("entry");
  const stop = n("stop");
  const tp = n("tp");

  const result = document.getElementById("rrResult");

  if (!result) return;

  const risk = Math.abs(entry - stop);
  const reward = Math.abs(tp - entry);

  result.textContent =
    "R:R " + (risk ? (reward / risk).toFixed(2) : "0.00");
}


// ==========================================
// COMPOUNDING CALCULATOR
// ==========================================

function calcCompound() {
  const start = n("start");
  const ret = n("ret");
  const periods = n("periods");

  const result = document.getElementById("compoundResult");

  if (!result) return;

  const value =
    start * Math.pow(1 + ret / 100, periods);

  result.textContent = money(value);
}


// ==========================================
// PROFIT / LOSS CALCULATOR
// ==========================================

function calcPL() {
  const points = n("points");
  const lots = n("lots");
  const pointval = n("pointval");

  const result = document.getElementById("plResult");

  if (!result) return;

  const value = points * lots * pointval;

  result.textContent = money(value);
}


// ==========================================
// MARKET SYMBOL MAPPING
// Website Symbol -> API Symbol
// ==========================================

const MARKET_SYMBOLS = {
  XAUUSD: "XAU/USD",
  EURUSD: "EUR/USD",
  GBPUSD: "GBP/USD",

  // These may depend on the symbols
  // supported by your Worker/API
  US100: "NDX",
  USOIL: "WTI/USD"
};


// ==========================================
// GET LIVE QUOTE
// ==========================================

async function getQuote(displaySymbol) {

  try {

    // Convert website symbol to API symbol
    const apiSymbol =
      MARKET_SYMBOLS[displaySymbol] ||
      displaySymbol;

    console.log(
      `Fetching ${displaySymbol} as ${apiSymbol}`
    );

    const response = await fetch(
      `${API_URL}/quote?symbol=${encodeURIComponent(apiSymbol)}`,
      {
        cache: "no-store"
      }
    );

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status}`
      );
    }

    const result = await response.json();

    console.log(
      `Market data for ${displaySymbol}:`,
      result
    );

    return result;

  } catch (error) {

    console.error(
      `Failed to load ${displaySymbol}:`,
      error
    );

    return null;
  }
}


// ==========================================
// UPDATE MARKET TERMINAL
// ==========================================

async function updateMarkets() {

  const symbols = [
    "XAUUSD",
    "US100",
    "USOIL",
    "EURUSD",
    "GBPUSD"
  ];

  try {

    const results =
      await Promise.all(
        symbols.map(symbol => getQuote(symbol))
      );

    let successfulUpdates = 0;

    results.forEach((data, index) => {

      if (
        !data ||
        data.success !== true ||
        !data.data
      ) {
        console.warn(
          `No valid data for ${symbols[index]}`
        );

        return;
      }

      const symbol = symbols[index];
      const quote = data.data;

      // Twelve Data / Worker response
      const price = Number(
        quote.close ??
        quote.price ??
        quote.last ??
        0
      );

      const change = Number(
        quote.percent_change ??
        quote.change_percent ??
        quote.changePercentage ??
        0
      );

      if (!price || Number.isNaN(price)) {

        console.warn(
          `Invalid price received for ${symbol}`,
          quote
        );

        return;
      }

      updateQuoteCard(
        symbol,
        price,
        change
      );

      successfulUpdates++;

    });

    updateLastMarketUpdate(successfulUpdates);

  } catch (error) {

    console.error(
      "Market update failed:",
      error
    );

    updateLastMarketUpdate(0);

  }
}


// ==========================================
// UPDATE QUOTE CARDS
// ==========================================

function updateQuoteCard(
  symbol,
  price,
  change
) {

  const quoteCards =
    document.querySelectorAll(
      ".quotes > div"
    );

  quoteCards.forEach(card => {

    const name =
      card.querySelector("b");

    if (!name) return;

    const text =
      name.textContent
        .trim()
        .toUpperCase()
        .replace("/", "")
        .replace(" ", "");

    const normalizedSymbol =
      symbol
        .toUpperCase()
        .replace("/", "")
        .replace(" ", "");

    // Symbol aliases
    const aliases = {

      XAUUSD: [
        "XAUUSD",
        "GOLD",
        "XAU"
      ],

      US100: [
        "US100",
        "NAS100",
        "NASDAQ",
        "NAS100USD",
        "NDX"
      ],

      USOIL: [
        "USOIL",
        "WTI",
        "CRUDEOIL",
        "USOILUSD"
      ],

      EURUSD: [
        "EURUSD"
      ],

      GBPUSD: [
        "GBPUSD"
      ]

    };

    const validNames =
      aliases[normalizedSymbol] ||
      [normalizedSymbol];

    const match =
      validNames.includes(text);

    if (!match) return;

    // Update price
    const priceElement =
      card.querySelector("strong");

    if (priceElement) {

      priceElement.textContent =
        formatPrice(symbol, price);

      // Small visual flash
      priceElement.classList.remove(
        "price-up",
        "price-down"
      );

      void priceElement.offsetWidth;

      priceElement.classList.add(
        change >= 0
          ? "price-up"
          : "price-down"
      );
    }

    // Try to update percentage if it exists
    const smallElement =
      card.querySelector("small");

    if (smallElement) {

      smallElement.textContent =
        `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

      smallElement.classList.remove(
        "positive",
        "negative"
      );

      smallElement.classList.add(
        change >= 0
          ? "positive"
          : "negative"
      );
    }

  });


  // ==========================================
  // UPDATE HERO PRICE FOR XAUUSD
  // ==========================================

  if (symbol === "XAUUSD") {

    const heroPrice =
      document.querySelector(
        ".terminal .price"
      );

    if (heroPrice) {

      heroPrice.innerHTML =
        `$${price.toFixed(2)}
        <small class="${
          change >= 0
            ? "positive"
            : "negative"
        }">
          ${change >= 0 ? "+" : ""}
          ${change.toFixed(2)}%
        </small>`;
    }
  }
}


// ==========================================
// PRICE FORMATTING
// ==========================================

function formatPrice(symbol, price) {

  if (
    price === null ||
    price === undefined ||
    Number.isNaN(Number(price))
  ) {
    return "--";
  }

  const value = Number(price);

  switch (symbol) {

    case "XAUUSD":
      return value.toFixed(2);

    case "US100":
      return value.toFixed(2);

    case "USOIL":
      return value.toFixed(2);

    case "EURUSD":
      return value.toFixed(5);

    case "GBPUSD":
      return value.toFixed(5);

    default:
      return value.toFixed(2);

  }
}


// ==========================================
// LIVE TICKER
// ==========================================

function updateTicker() {

  const ticker =
    document.querySelector(".ticker");

  if (!ticker) return;

  ticker.dataset.live = "true";
}


// ==========================================
// MARKET STATUS
// ==========================================

function updateLastMarketUpdate(
  successfulUpdates = 0
) {

  let indicator =
    document.getElementById(
      "marketStatus"
    );

  if (!indicator) {

    indicator =
      document.createElement("div");

    indicator.id =
      "marketStatus";

    indicator.style.fontSize =
      "12px";

    indicator.style.opacity =
      "0.7";

    indicator.style.marginTop =
      "8px";

    const terminal =
      document.querySelector(
        ".terminal"
      );

    if (terminal) {
      terminal.appendChild(
        indicator
      );
    }
  }

  if (successfulUpdates > 0) {

    indicator.textContent =
      `● Live market data • ${successfulUpdates} markets updated • ` +
      new Date().toLocaleTimeString();

  } else {

    indicator.textContent =
      "● Waiting for market data...";

  }
}


// ==========================================
// MOBILE MENU
// ==========================================

function setupMenu() {

  const menu =
    document.querySelector(
      ".menu"
    );

  const nav =
    document.querySelector(
      ".nav nav"
    );

  if (!menu || !nav) return;

  menu.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "open"
      );

    }
  );
}


// ==========================================
// INITIALIZE NOBERTRADES
// ==========================================

function initializeNoberTrades() {

  // Calculators
  calcRisk();
  calcRR();
  calcCompound();
  calcPL();

  // Mobile navigation
  setupMenu();

  // Initial market data load
  updateMarkets();

  // Refresh every 15 seconds
  setInterval(
    updateMarkets,
    15000
  );

  // Mark ticker as live
  updateTicker();

  console.log(
    "NoberTrades Dynamic Engine Initialized."
  );
}


// ==========================================
// START ENGINE
// ==========================================

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeNoberTrades
  );

} else {

  initializeNoberTrades();

}
