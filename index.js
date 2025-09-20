const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(express.json());

// Render asigna su propio puerto automáticamente
const PORT = process.env.PORT || 3000;
// Token del BCRA desde variables de entorno en Render
const token = process.env.BCRA_TOKEN;

// Endpoint para obtener tasas del BCRA
app.get("/tasas/:moneda", async (req, res) => {
  const moneda = req.params.moneda.toUpperCase();

  try {
    const response = await fetch(`https://api.bcra.gob.ar/tasas/${moneda}`, {
      headers: { Authorization: `BEARER ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "No se pudo obtener la tasa" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
