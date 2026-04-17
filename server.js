const express = require("express");
const cors = require("cors");
const path = require("path");

const { startAutoRefresh, getData } = require("./dataFeed");

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* SERVE FRONTEND */
app.use(express.static(path.join(__dirname)));

/* START DATA ENGINE */
startAutoRefresh();

/* ROOT → OPEN FRONTEND */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* MAIN API */
app.get("/api/prices", (req, res) => {
  try {
    const data = getData();

    if (!data || !data.KLC || !data.CBOT) {
      return res.json({
        KLC: {},
        CBOT: {},
        CRUDE: {},
        USDINR: 0,
        lastUpdated: null
      });
    }

    res.json(data);

  } catch (err) {
    console.log("❌ API error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* PORT CONFIG (IMPORTANT FOR RENDER) */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
