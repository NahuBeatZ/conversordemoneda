const monedaOrigen = document.getElementById("monedaOrigen");
const monedaDestino = document.getElementById("monedaDestino");
const resultado = document.getElementById("resultado");
const cargando = document.getElementById("cargando");
const historialUL = document.getElementById("historial");
const graficoCanvas = document.getElementById("graficoMoneda");

const listaMonedas = [
  { code: "USD", flag: "🇺🇸" },
  { code: "EUR", flag: "🇪🇺" },
  { code: "ARS", flag: "🇦🇷" },
  { code: "BRL", flag: "🇧🇷" },
  { code: "CNY", flag: "🇨🇳" },
  { code: "MXN", flag: "🇲🇽" },
  { code: "CLP", flag: "🇨🇱" },
  { code: "COP", flag: "🇨🇴" },
  { code: "PEN", flag: "🇵🇪" },
  { code: "UYU", flag: "🇺🇾" },
  { code: "BOB", flag: "🇧🇴" },
  { code: "PYG", flag: "🇵🇾" },
  { code: "VES", flag: "🇻🇪" }
];

const API_KEY = "5a32de71cc0454cfd6b0060"; // Tu clave de ExchangeRate-API
let chartMoneda = null;

// Tasas simuladas como respaldo
const tasasSimuladas = {
  USD: { USD: 1, EUR: 0.85, ARS: 1474, BRL: 5.3, CNY: 7.1, MXN: 18, CLP: 953, COP: 3872, PEN: 3.48, UYU: 40, BOB: 6.9, PYG: 7122, VES: 165 },
  EUR: { USD: 1.18, EUR: 1, ARS: 1735, BRL: 6.2, CNY: 8.3, MXN: 21.5, CLP: 1140, COP: 4630, PEN: 4.1, UYU: 46.5, BOB: 8, PYG: 8280, VES: 192 },
  ARS: { USD: 0.00068, EUR: 0.00058, ARS: 1, BRL: 0.0036, CNY: 0.0048, MXN: 0.012, CLP: 0.62, COP: 2.63, PEN: 0.0023, UYU: 0.027, BOB: 0.004, PYG: 4.84, VES: 0.11 },
  BRL: { USD: 0.19, EUR: 0.16, ARS: 277, BRL: 1, CNY: 1.34, MXN: 3.39, CLP: 180, COP: 730, PEN: 0.66, UYU: 7.5, BOB: 1.3, PYG: 939, VES: 21.2 },
  CNY: { USD: 0.14, EUR: 0.12, ARS: 205, BRL: 0.75, CNY: 1, MXN: 2.53, CLP: 135, COP: 550, PEN: 0.5, UYU: 5.2, BOB: 0.9, PYG: 712, VES: 16.5 },
  MXN: { USD: 0.055, EUR: 0.047, ARS: 18.5, BRL: 0.31, CNY: 0.40, MXN: 1, CLP: 53, COP: 220, PEN: 0.19, UYU: 2.1, BOB: 0.36, PYG: 103, VES: 2.3 },
  CLP: { USD: 0.0010, EUR: 0.00088, ARS: 0.97, BRL: 0.0056, CNY: 0.0074, MXN: 0.019, CLP: 1, COP: 4.15, PEN: 0.0036, UYU: 0.039, BOB: 0.0069, PYG: 1.95, VES: 0.044 },
  COP: { USD: 0.00026, EUR: 0.00022, ARS: 0.38, BRL: 0.0014, CNY: 0.0018, MXN: 0.0045, CLP: 0.24, COP: 1, PEN: 0.00087, UYU: 0.009, BOB: 0.0036, PYG: 0.47, VES: 0.011 },
  PEN: { USD: 0.29, EUR: 0.24, ARS: 425, BRL: 1.51, CNY: 1.99, MXN: 5.2, CLP: 278, COP: 1140, PEN: 1, UYU: 12, BOB: 2.0, PYG: 143, VES: 3.4 },
  UYU: { USD: 0.025, EUR: 0.021, ARS: 37, BRL: 0.13, CNY: 0.19, MXN: 0.48, CLP: 26, COP: 106, PEN: 0.083, UYU: 1, BOB: 0.17, PYG: 12, VES: 0.29 },
  BOB: { USD: 0.14, EUR: 0.12, ARS: 210, BRL: 0.77, CNY: 1.1, MXN: 2.8, CLP: 152, COP: 620, PEN: 0.50, UYU: 5.9, BOB: 1, PYG: 72, VES: 1.7 },
  PYG: { USD: 0.00014, EUR: 0.00012, ARS: 0.21, BRL: 0.0011, CNY: 0.0014, MXN: 0.0097, CLP: 0.51, COP: 2.0, PEN: 0.007, UYU: 0.083, BOB: 0.014, PYG: 1, VES: 0.024 },
  VES: { USD: 0.0061, EUR: 0.0052, ARS: 9.0, BRL: 0.047, CNY: 0.061, MXN: 0.26, CLP: 14, COP: 57, PEN: 0.29, UYU: 3.4, BOB: 0.59, PYG: 41.7, VES: 1 }
};

// Cargar monedas en los selects
function cargarMonedas() {
  listaMonedas.forEach(moneda => {
    const option1 = document.createElement("option");
    option1.value = moneda.code;
    option1.textContent = `${moneda.flag} ${moneda.code}`;
    monedaOrigen.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = moneda.code;
    option2.textContent = `${moneda.flag} ${moneda.code}`;
    monedaDestino.appendChild(option2);
  });

  monedaOrigen.value = "USD";
  monedaDestino.value = "ARS";
  cargarHistorial();
}

// Historial
function guardarHistorial(texto) {
  let historial = JSON.parse(localStorage.getItem("historialConversiones") || "[]");
  if (!Array.isArray(historial)) historial = [];
  historial.unshift(texto);
  if (historial.length > 5) historial.pop();
  localStorage.setItem("historialConversiones", JSON.stringify(historial));
  mostrarHistorial(historial);
}

function mostrarHistorial(historial) {
  historialUL.innerHTML = "";
  historial.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historialUL.appendChild(li);
  });
  historialUL.scrollTop = 0;
}

function cargarHistorial() {
  const historial = JSON.parse(localStorage.getItem("historialConversiones") || "[]");
  if (!Array.isArray(historial)) return;
  mostrarHistorial(historial);
}

// Conversión
async function convertir() {
  const monto = parseFloat(document.getElementById("monto").value);
  const origen = monedaOrigen.value;
  const destino = monedaDestino.value;

  if (isNaN(monto)) {
    resultado.innerText = "Ingrese un número válido";
    return;
  }
  if (origen === destino) {
    resultado.innerText = "Seleccione dos monedas diferentes";
    return;
  }

  cargando.style.display = "block";
  resultado.innerText = "";

  let tasa;
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${origen}`);
    const data = await res.json();

    if (res.ok && data.conversion_rates && data.conversion_rates[destino]) {
      tasa = data.conversion_rates[destino];
    } else {
      console.warn("API no disponible, usando tasa simulada");
      tasa = (tasasSimuladas[origen] && tasasSimuladas[origen][destino]) || 1;
    }

  } catch (error) {
    console.error("Error API:", error);
    tasa = (tasasSimuladas[origen] && tasasSimuladas[origen][destino]) || 1;
  }

  const total = monto * tasa;
  cargando.style.display = "none";

  const textoResultado = `${listaMonedas.find(m => m.code === origen).flag} ${monto} ${origen} = ${listaMonedas.find(m => m.code === destino).flag} ${total.toFixed(2)} ${destino}`;
  resultado.innerText = textoResultado;
  resultado.classList.remove("animar");
  void resultado.offsetWidth;
  resultado.classList.add("animar");

  guardarHistorial(textoResultado);
  mostrarGrafico(destino);
}

// Gráfico simple
function mostrarGrafico(moneda) {
  const fechas = [];
  const tasas = [];
  const hoy = new Date();

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(hoy.getDate() - i);
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    fechas.push(`${dd}/${mm}`);

    const tasa = (tasasSimuladas["USD"] && tasasSimuladas["USD"][moneda]) || 1;
    tasas.push(tasa);
  }

  if (chartMoneda) chartMoneda.destroy();

  chartMoneda = new Chart(graficoCanvas, {
    type: 'line',
    data: {
      labels: fechas,
      datasets: [{
        label: `${moneda} vs USD`,
        data: tasas,
        borderColor: '#007BFF',
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      }
    }
  });
}

window.onload = cargarMonedas;
