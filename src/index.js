const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const token = process.env.BCRA_TOKEN;

app.get("/tasas/:moneda", async (req, res) => {
  const moneda = req.params.moneda.toUpperCase();

  try {
    const response = await fetch(`https://api.bcra.gob.ar/tasas/${moneda}`, {
      headers: { "Authorization": `BEARER ${token}` }
    });

    if (!response.ok) throw new Error(`Error al obtener datos: ${response.status}`);

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo obtener la tasa" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
