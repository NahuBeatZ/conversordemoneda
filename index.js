const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Render asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint para obtener tasas del BCRA
app.get("/tasas/:moneda", async (req, res) => {
  const moneda = req.params.moneda.toUpperCase();
  const token = process.env.BCRA_TOKEN; // Variable de entorno

  if (!token) {
    return res.status(500).json({ error: "Token BCRA no configurado" });
  }

  try {
    const response = await fetch(`https://api.bcra.gob.ar/tasas/${moneda}`, {
      headers: {
        "Authorization": `BEARER ${token}`
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

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
