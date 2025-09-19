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

const API_KEY = "5a32de71cc0454cfd6b0060"; 
let chartMoneda = null;

// Tasas simuladas
const tasasSimuladas = {
  USD: { USD: 1, EUR: 0.85, ARS: 1474, BRL: 5.3, CNY: 7.1, MXN: 18, CLP: 953, COP: 3872, PEN: 3.48, UYU: 40, BOB: 6.9, PYG: 7122, VES: 165 },
  EUR: { USD: 1.18, EUR: 1, ARS: 1735, BRL: 6.2, CNY: 8.3, MXN: 21.5, CLP: 1140, COP: 4630, PEN: 4.1, UYU: 46.5, BOB: 8, PYG: 8280, VES: 192 },
  ARS: { USD: 0.00068, EUR: 0.00058, ARS: 1, BRL: 0.0036, CNY: 0.0048, MXN: 0.012, CLP: 0.62, COP: 2.63, PEN: 0.0023, UYU: 0.027, BOB: 0.004, PYG: 4.84, VES: 0.11 },
};

// Cargar monedas
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

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${origen}`);
    const data = await res.json();

    let tasa;
    if (res.ok && data.conversion_rates && data.conversion_rates[destino]) {
      tasa = data.conversion_rates[destino];
    } else {
      console.warn("API no disponible, usando tasa simulada");
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

  } catch (error) {
    cargando.style.display = "none";
    console.error(error);
    const tasa = (tasasSimuladas[origen] && tasasSimuladas[origen][destino]) || 1;
    const total = monto * tasa;
    const textoResultado = `${listaMonedas.find(m => m.code === origen).flag} ${monto} ${origen} = ${listaMonedas.find(m => m.code === destino).flag} ${total.toFixed(2)} ${destino} (simulado)`;
    resultado.innerText = textoResultado;
    guardarHistorial(textoResultado);
    mostrarGrafico(destino);
  }
}

// Gráfico simulado últimos 7 días
function mostrarGrafico(moneda) {
  const fechas = [];
  const tasas = [];
  const hoy = new Date();
  const base = (tasasSimuladas["USD"] && tasasSimuladas["USD"][moneda]) || 1;

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date();
    fecha.setDate(hoy.getDate() - i);
    const dd = String(fecha.getDate()).padStart(2, "0");
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    fechas.push(`${dd}/${mm}`);

    // Generar pequeñas variaciones aleatorias para simular la evolución
    const variacion = base * (1 + (Math.random() - 0.5) / 20); 
    tasas.push(parseFloat(variacion.toFixed(2)));
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
