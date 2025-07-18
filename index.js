const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

app.all("*", async (req, res) => {
  // 🔐 Tilføj adgangskodebeskyttelse
  const accessKey = req.headers["x-proxy-key"];
  if (accessKey !== process.env.PROXY_KEY) {
    return res.status(403).send("Access denied");
  }

  try {
    // 🔗 Opbyg måladresse (ændr til den API du bruger)
    const targetUrl = "https://services.datafordeler.dk" + req.originalUrl;

    // 🔁 Videresend kaldet til det rigtige API
    const response = await fetch(targetUrl, {
      method: req.method,
headers: {
  "Content-Type": "application/json",
  // Fjern headers der kan skabe problemer
  ...Object.fromEntries(
    Object.entries(req.headers).filter(
      ([key]) =>
        !["host", "x-forwarded-for", "x-forwarded-proto", "x-real-ip"].includes(
          key.toLowerCase()
        )
    )
  ),
},

      body: ["GET", "HEAD"].includes(req.method) ? null : JSON.stringify(req.body),
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy lytter på port ${PORT}`));
