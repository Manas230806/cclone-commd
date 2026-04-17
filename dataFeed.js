const axios = require("axios");
const cheerio = require("cheerio");

// CACHE
let cache = {
  KLC: {},
  CBOT: {},
  CRUDE: {},
  USDINR: 83,
  lastUpdated: null
};

// 🔥 GENERIC SCRAPER
async function scrapeInvesting(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const $ = cheerio.load(data);

    const price = $('[data-test="instrument-price-last"]').text().trim();
    const change = $('[data-test="instrument-price-change"]').text().trim();

    if (!price) throw "No price";

    return {
      price,
      change
    };

  } catch (err) {
    console.log("❌ Scrape failed:", url);
    return { price: "-", change: "-" };
  }
}

// 🔥 USD → INR
async function getUSDINR() {
  try {
    const res = await axios.get("https://api.exchangerate-api.com/v4/latest/USD");
    return res.data.rates.INR;
  } catch {
    return cache.USDINR;
  }
}

// 🔥 MAIN REFRESH
async function refreshData() {
  console.log("🔄 Fetching Investing data...");

  cache = {
    KLC: {
      MAY: await scrapeInvesting("https://www.investing.com/commodities/palm-oil"),
      JUN: await scrapeInvesting("https://www.investing.com/commodities/palm-oil"),
      JULY: await scrapeInvesting("https://www.investing.com/commodities/palm-oil"),
      AUG: await scrapeInvesting("https://www.investing.com/commodities/palm-oil"),
      SEP: await scrapeInvesting("https://www.investing.com/commodities/palm-oil")
    },

    CBOT: {
      MAY: await scrapeInvesting("https://www.investing.com/commodities/us-soybean-oil"),
      JULY: await scrapeInvesting("https://www.investing.com/commodities/us-soybean-oil"),
      AUG: await scrapeInvesting("https://www.investing.com/commodities/us-soybean-oil"),
      SEP: await scrapeInvesting("https://www.investing.com/commodities/us-soybean-oil")
    },

    CRUDE: {
      LIVE: await scrapeInvesting("https://www.investing.com/commodities/crude-oil")
    },

    USDINR: await getUSDINR(),

    lastUpdated: new Date()
  };

  console.log("✅ Updated:", cache);
}

// AUTO REFRESH
function startAutoRefresh() {
  refreshData();
  setInterval(refreshData, 15000); // 15 sec (safe)
}

// EXPORT
function getData() {
  return cache;
}

module.exports = {
  startAutoRefresh,
  getData
};
