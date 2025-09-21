require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Token de BCRA desde variables de entorno
const token = process.env.BCRA_TOKEN;

// Tasas simuladas para fallback
const tasasSimuladas = {
  USD: { compra: 250, venta: 255 },
  EUR: { compra: 270, venta: 275 },
  BRL: { compra: 45, venta: 50 }
};

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
    console.error(`Error BCRA, usando tasas simuladas: ${err.message}`);
    if (tasasSimuladas[moneda]) {
      res.json(tasasSimuladas[moneda]);
    } else {
      res.status(500).json({ error: "No se pudo obtener la tasa" });
    }
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
