let usuarioActual = "";
let baseGastos = JSON.parse(localStorage.getItem("baseGastos")) || {};
let gastoPendienteEliminar = null;
let grafico = null;
let temporizadorInactividad;

// 🔐 Control de sesión e inactividad
function iniciarContadorInactividad() {
  const reiniciar = () => {
    clearTimeout(temporizadorInactividad);
    temporizadorInactividad = setTimeout(cerrarSesionPorInactividad, 5 * 60 * 1000); // 5 min
  };
  document.addEventListener("mousemove", reiniciar);
  document.addEventListener("keydown", reiniciar);
  reiniciar();
}

function cerrarSesionPorInactividad() {
  alert("Tu sesión ha sido cerrada por inactividad.");
  localStorage.removeItem("usuarioActual");
  location.reload();
}

// ✔️ Login y carga inicial
function verificarLogin() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const documento = document.getElementById("documento").value.trim();

  if (!nombre || !apellido || !/^\d{4,}$/.test(documento)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  usuarioActual = documento;
  if (!baseGastos[usuarioActual]) baseGastos[usuarioActual] = [];

  localStorage.setItem("usuarioActual", usuarioActual);
  localStorage.setItem("baseGastos", JSON.stringify(baseGastos));

  document.getElementById("login").style.display = "none";
  document.querySelector("main").style.display = "block";
  document.getElementById("bienvenida").textContent = `👋Bienvenido ${nombre}, a tu Gestor de Finanzas`;

  renderizarGastos();
  actualizarTotales();
  actualizarGrafico();
  iniciarContadorInactividad();
}

document.getElementById("formulario").addEventListener("submit", (e) => {
  e.preventDefault();

  const descripcion = document.getElementById("descripcion").value.trim();
  const monto = parseFloat(document.getElementById("monto").value);
  const tipo = document.getElementById("tipo").value;
  const categoria = document.getElementById("categoria").value;

  if (!descripcion || isNaN(monto) || monto <= 0 || !tipo || !categoria) return;

  const nuevoMovimiento = {
    id: Date.now(),
    descripcion,
    monto,
    tipo,
    categoria
  };

  baseGastos[usuarioActual].push(nuevoMovimiento);
  guardarTodo();
  renderizarGastos();
  actualizarTotales();
  actualizarGrafico();
  e.target.reset();
});

function renderizarGastos() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  baseGastos[usuarioActual].forEach((mov) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${mov.descripcion}</td>
      <td>$${mov.monto.toFixed(2)}</td>
      <td>${mov.tipo}</td>
      <td>${mov.categoria}</td>
      <td><button onclick="eliminarGasto(${mov.id})">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function actualizarTotales() {
  const ingresos = baseGastos[usuarioActual].filter(m => m.tipo === "Ingreso");
  const egresos = baseGastos[usuarioActual].filter(m => m.tipo === "Egreso");

  const totalIngresos = ingresos.reduce((acc, m) => acc + m.monto, 0);
  const totalEgresos = egresos.reduce((acc, m) => acc + m.monto, 0);

  document.getElementById("totalIngresos").textContent = totalIngresos.toFixed(2);
  document.getElementById("totalEgresos").textContent = totalEgresos.toFixed(2);
}

function actualizarGrafico() {
  const datos = {};
  baseGastos[usuarioActual].forEach(mov => {
    const clave = `${mov.tipo} - ${mov.categoria}`;
    datos[clave] = (datos[clave] || 0) + mov.monto;
  });

  const etiquetas = Object.keys(datos);
  const valores = Object.values(datos);
  const ctx = document.getElementById("graficoCategorias").getContext("2d");

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "pie",
    data: {
      labels: etiquetas,
      datasets: [{
        data: valores,
        backgroundColor: [
          "#2ecc71", "#f39c12", "#e67e22", "#3498db",
          "#9b59b6", "#e74c3c", "#1abc9c", "#34495e"
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function eliminarGasto(id) {
  gastoPendienteEliminar = id;
  document.getElementById("claveEliminar").value = "";
  document.getElementById("modal-eliminar").style.display = "flex";
}

document.getElementById("confirmarEliminar").addEventListener("click", () => {
  const clave = document.getElementById("claveEliminar").value.trim();

  if (!gastoPendienteEliminar) return;

  if (clave !== usuarioActual.slice(-4)) {
    alert("Contraseña incorrecta.");
    return;
  }

  baseGastos[usuarioActual] = baseGastos[usuarioActual].filter(
    m => m.id !== gastoPendienteEliminar
  );
  guardarTodo();
  renderizarGastos();
  actualizarTotales();
  actualizarGrafico();
  document.getElementById("modal-eliminar").style.display = "none";
  gastoPendienteEliminar = null;
});

document.getElementById("cancelarEliminar").addEventListener("click", () => {
  document.getElementById("modal-eliminar").style.display = "none";
  gastoPendienteEliminar = null;
});

document.getElementById("cerrarSesion").addEventListener("click", () => {
  document.getElementById("modal-cerrar").style.display = "flex";
});

document.getElementById("cancelarCerrar").addEventListener("click", () => {
  document.getElementById("modal-cerrar").style.display = "none";
});

document.getElementById("confirmarCerrar").addEventListener("click", () => {
  localStorage.removeItem("usuarioActual");
  location.reload();
});

// 👉 No cargar datos automáticamente al refrescar
window.addEventListener("DOMContentLoaded", () => {
  document.querySelector("main").style.display = "none";
});

function guardarTodo() {
  localStorage.setItem("baseGastos", JSON.stringify(baseGastos));
}