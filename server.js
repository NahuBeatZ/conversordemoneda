require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para obtener tasas
app.get("/api/tasas", async (req, res) => {
  try {
    // fetch global de Node 22+
    const response = await fetch('https://dolarapi.com/v1/dolares/oficial');
    const data = await response.json();

    // Tasas base (USD real, las demás aproximadas)
    const tasas = {
      USD: data.venta,
      ARS: 1,
      EUR: data.venta * 1.1,
      BRL: data.venta * 0.18,
      GBP: data.venta * 1.25,
      JPY: data.venta * 0.012
    };

    // Histórico simulado 7 días
    const historico = [];
    for (let i = 6; i >= 0; i--) {
      historico.push({
        fecha: `Día -${i}`,
        USD: data.venta - i * 5,
        EUR: (data.venta - i * 5) * 1.1,
        BRL: (data.venta - i * 5) * 0.18,
        GBP: (data.venta - i * 5) * 1.25,
        JPY: (data.venta - i * 5) * 0.012
      });
    }

    res.json({ tasas, historico });

  } catch (err) {
    console.error("Error obteniendo tasas:", err.message);
    res.status(500).json({ error: "No se pudo obtener la tasa" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
