const express = require("express");
const fetch = require("node-fetch"); // Importar fetch
const app = express();

// Render define automáticamente PORT, si no existe usamos 3000 en local
const PORT = process.env.PORT || 3000;

// Token del BCRA desde variable de entorno
const BCRA_API_KEY = process.env.BCRA_API_KEY;

app.use(express.json());

// Endpoint para obtener tasas del BCRA
app.get("/tasas/:moneda", async (req, res) => {
  const moneda = req.params.moneda.toUpperCase();

  try {
    const response = await fetch(`https://api.estadisticasbcra.com/${moneda}`, {
      headers: {
        Authorization: `BEARER ${BCRA_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo obtener la tasa" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
