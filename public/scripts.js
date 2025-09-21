let historial = [];
let tasas = {};
let miGrafico;

// Obtener tasas y actualizar gráfico
async function obtenerTasas() {
  try {
    const response = await fetch('/api/tasas');
    const data = await response.json();
    tasas = data.tasas;
    actualizarGrafico(data.historico);
  } catch (err) {
    console.error('Error al obtener tasas:', err);
    tasas = {
      USD: 1515, ARS: 1, EUR: 1666.5, BRL: 272.7, GBP: 1893.75, JPY: 18.18
    };
  }
}

// Función de conversión
function convertir() {
  const monto = parseFloat(document.getElementById("monto").value);
  const monedaOrigen = document.getElementById("monedaOrigen").value;
  const monedaDestino = document.getElementById("monedaDestino").value;
  const resultadoElem = document.getElementById("resultado");
  const cargando = document.getElementById("cargando");

  if (isNaN(monto) || monto <= 0) {
    alert("Ingrese un monto válido");
    return;
  }

  cargando.style.display = "block";
  resultadoElem.textContent = "";

  if (!tasas[monedaOrigen] || !tasas[monedaDestino]) {
    resultadoElem.textContent = "No se pudo obtener la tasa de alguna moneda.";
    cargando.style.display = "none";
    return;
  }

  const montoARS = monto * tasas[monedaOrigen];
  const resultado = (montoARS / tasas[monedaDestino]).toFixed(2);

  resultadoElem.textContent = `${monto} ${monedaOrigen} = ${resultado} ${monedaDestino}`;
  resultadoElem.classList.add("animar");
  setTimeout(() => resultadoElem.classList.remove("animar"), 300);

  historial.unshift(`${monto} ${monedaOrigen} → ${resultado} ${monedaDestino}`);
  actualizarHistorial();

  cargando.style.display = "none";
}

// Historial
function actualizarHistorial() {
  const historialElem = document.getElementById("historial");
  historialElem.innerHTML = "";
  historial.slice(0, 10).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historialElem.appendChild(li);
  });
}

// Inicializa selectores
function initMonedas() {
  const monedas = ["USD","ARS","EUR","BRL","GBP","JPY"];
  const selectOrigen = document.getElementById("monedaOrigen");
  const selectDestino = document.getElementById("monedaDestino");

  selectOrigen.innerHTML = "";
  selectDestino.innerHTML = "";

  monedas.forEach(moneda => {
    const option1 = document.createElement("option");
    option1.value = moneda;
    option1.textContent = moneda;
    selectOrigen.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = moneda;
    option2.textContent = moneda;
    selectDestino.appendChild(option2);
  });

  selectOrigen.value = "USD";
  selectDestino.value = "ARS";
}

// Gráfico multimoneda
function actualizarGrafico(historico) {
  if (!historico || historico.length === 0) return;

  const labels = historico.map(h => h.fecha);
  const ctx = document.getElementById("graficoMoneda").getContext("2d");

  if (miGrafico) miGrafico.destroy();

  miGrafico = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: "USD → ARS", data: historico.map(h => h.USD), borderColor: "#007BFF", backgroundColor: "rgba(0,123,255,0.2)", tension: 0.3 },
        { label: "EUR → ARS", data: historico.map(h => h.EUR), borderColor: "#28a745", backgroundColor: "rgba(40,167,69,0.2)", tension: 0.3 },
        { label: "BRL → ARS", data: historico.map(h => h.BRL), borderColor: "#ffc107", backgroundColor: "rgba(255,193,7,0.2)", tension: 0.3 },
        { label: "GBP → ARS", data: historico.map(h => h.GBP), borderColor: "#6f42c1", backgroundColor: "rgba(111,66,193,0.2)", tension: 0.3 },
        { label: "JPY → ARS", data: historico.map(h => h.JPY), borderColor: "#fd7e14", backgroundColor: "rgba(253,126,20,0.2)", tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: { x: { title: { display: true, text: "Días" } }, y: { title: { display: true, text: "Valor (ARS)" } } }
    }
  });
}

// Inicialización
window.addEventListener("DOMContentLoaded", async () => {
  initMonedas();
  await obtenerTasas();
});
