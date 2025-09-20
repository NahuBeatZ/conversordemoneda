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

let chartMoneda = null;

// Detectar si estamos en local o en producción (Render)
const API_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000/tasas"
  : "https://conversordemoneda.onrender.com/tasas";

// Tasas simuladas completas
const tasasSimuladas = {
  USD: { USD:1, EUR:0.85, ARS:1474, BRL:5.3, CNY:7.1, MXN:18, CLP:953, COP:3872, PEN:3.48, UYU:40, BOB:6.9, PYG:7122, VES:165 },
  EUR: { USD:1.18, EUR:1, ARS:1735, BRL:6.2, CNY:8.3, MXN:21.5, CLP:1140, COP:4630, PEN:4.1, UYU:46.5, BOB:8, PYG:8280, VES:192 },
  ARS: { USD:0.00068, EUR:0.00058, ARS:1, BRL:0.0036, CNY:0.0048, MXN:0.012, CLP:0.62, COP:2.63, PEN:0.0023, UYU:0.027, BOB:0.004, PYG:4.84, VES:0.11 },
  BRL: { USD:0.19, EUR:0.16, ARS:277, BRL:1, CNY:1.34, MXN:3.45, CLP:180, COP:730, PEN:0.66, UYU:7.5, BOB:1.28, PYG:931, VES:28 },
  CNY: { USD:0.14, EUR:0.12, ARS:207, BRL:0.75, CNY:1, MXN:2.58, CLP:134, COP:544, PEN:0.49, UYU:5.6, BOB:0.95, PYG:693, VES:20.9 },
  MXN: { USD:0.056, EUR:0.047, ARS:81, BRL:0.29, CNY:0.39, MXN:1, CLP:52, COP:212, PEN:0.19, UYU:2.2, BOB:0.37, PYG:145, VES:4.4 },
  CLP: { USD:0.00105, EUR:0.00088, ARS:1.55, BRL:0.0055, CNY:0.0075, MXN:0.019, CLP:1, COP:4.1, PEN:0.0036, UYU:0.043, BOB:0.0071, PYG:2.78, VES:0.084 },
  COP: { USD:0.00026, EUR:0.00022, ARS:0.38, BRL:0.00137, CNY:0.0018, MXN:0.0047, CLP:0.24, COP:1, PEN:0.00087, UYU:0.011, BOB:0.0017, PYG:0.49, VES:0.020 },
  PEN: { USD:0.29, EUR:0.24, ARS:430, BRL:1.5, CNY:1.1, MXN:5.3, CLP:278, COP:1147, PEN:1, UYU:6.1, BOB:1.85, PYG:913, VES:21 },
  UYU: { USD:0.025, EUR:0.021, ARS:37, BRL:0.13, CNY:0.18, MXN:0.45, CLP:23, COP:91, PEN:0.16, UYU:1, BOB:0.3, PYG:150, VES:3.6 },
  BOB: { USD:0.14, EUR:0.125, ARS:242, BRL:0.78, CNY:0.94, MXN:2.7, CLP:147, COP:580, PEN:0.54, UYU:3.33, BOB:1, PYG:495, VES:11 },
  PYG: { USD:0.00014, EUR:0.00012, ARS:0.21, BRL:0.0011, CNY:0.0014, MXN:0.0069, CLP:0.36, COP:2.03, PEN:0.0011, UYU:0.0067, BOB:0.002, PYG:1, VES:0.022 },
  VES: { USD:0.006, EUR:0.0052, ARS:0.006, BRL:0.036, CNY:0.048, MXN:0.23, CLP:11.9, COP:50, PEN:0.048, UYU:0.28, BOB:0.09, PYG:45, VES:1 }
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
  historial.unshift(texto);
  if(historial.length > 5) historial.pop();
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
}

function cargarHistorial() {
  const historial = JSON.parse(localStorage.getItem("historialConversiones") || "[]");
  mostrarHistorial(historial);
}

// Conversión usando servidor BCRA o simulada
async function convertir() {
  const monto = parseFloat(document.getElementById("monto").value);
  const origen = monedaOrigen.value;
  const destino = monedaDestino.value;

  if(isNaN(monto)){ resultado.innerText="Ingrese un número válido"; return; }
  if(origen===destino){ resultado.innerText="Seleccione dos monedas diferentes"; return; }

  cargando.style.display="block";
  resultado.innerText="";

  try {
    const res = await fetch(`/tasas/${origen}`);
    
    const data = await res.json();

    const tasa = data[destino] || (tasasSimuladas[origen][destino] || 1);
    const total = monto * tasa;

    cargando.style.display="none";

    const textoResultado = `${listaMonedas.find(m=>m.code===origen).flag} ${monto} ${origen} = ${listaMonedas.find(m=>m.code===destino).flag} ${total.toFixed(2)} ${destino}`;
    resultado.innerText = textoResultado;

    resultado.classList.remove("animar");
    void resultado.offsetWidth;
    resultado.classList.add("animar");

    guardarHistorial(textoResultado);
    mostrarGrafico(origen, destino, data);

  } catch(err) {
    console.error(err);
    cargando.style.display="none";

    const total = monto * (tasasSimuladas[origen][destino] || 1);
    const textoResultado = `${listaMonedas.find(m=>m.code===origen).flag} ${monto} ${origen} = ${listaMonedas.find(m=>m.code===destino).flag} ${total.toFixed(2)} ${destino} (simulado)`;
    resultado.innerText = textoResultado;
    guardarHistorial(textoResultado);
    mostrarGrafico(origen, destino);
  }
}

// Gráfico de últimos 7 días
function mostrarGrafico(origen, destino, data=null){
  const fechas=[], tasas=[];
  if(data && Array.isArray(data.historial)){
    data.historial.slice(-7).forEach(item => {
      fechas.push(item.fecha);
      tasas.push(item.valor);
    });
  } else {
    const hoy=new Date();
    for(let i=6;i>=0;i--){
      const f=new Date();
      f.setDate(hoy.getDate()-i);
      fechas.push(`${String(f.getDate()).padStart(2,'0')}/${String(f.getMonth()+1).padStart(2,'0')}`);
      tasas.push(tasasSimuladas[origen]?.[destino] || 1);
    }
  }

  if(chartMoneda) chartMoneda.destroy();
  chartMoneda=new Chart(graficoCanvas,{
    type:'line',
    data:{ labels:fechas, datasets:[{ label:`${destino} vs ${origen}`, data:tasas, borderColor:'#007BFF', backgroundColor:'rgba(0,123,255,0.2)', tension:0.3, fill:true }] },
    options:{ responsive:true, plugins:{ legend:{display:true} } }
  });
}

window.onload = cargarMonedas;
