let usuarioActual = "";
let baseGastos = JSON.parse(localStorage.getItem("baseGastos")) || {};
let gastoPendienteEliminar = null;

function verificarLogin() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const documento = document.getElementById("documento").value.trim();

  if (!nombre || !apellido || !/^\d{4,}$/.test(documento)) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  usuarioActual = documento;
  if (!baseGastos[usuarioActual]) {
    baseGastos[usuarioActual] = [];
  }

  localStorage.setItem("usuarioActual", usuarioActual);
  localStorage.setItem("baseGastos", JSON.stringify(baseGastos));

  document.getElementById("login").style.display = "none";
  document.querySelector("main").style.display = "block";
  document.getElementById("bienvenida").textContent = `👋Bienvenido ${nombre}, a tu Gestor de Gastos Mensuales👋`;

  renderizarGastos();
  actualizarTotal();
}

document.getElementById("formulario").addEventListener("submit", (e) => {
  e.preventDefault();

  const descripcion = document.getElementById("descripcion").value.trim();
  const monto = parseFloat(document.getElementById("monto").value);
  const categoria = document.getElementById("categoria").value;

  if (!descripcion || isNaN(monto) || monto <= 0 || !categoria) return;

  const nuevoGasto = {
    id: Date.now(),
    descripcion,
    monto,
    categoria
  };

  baseGastos[usuarioActual].push(nuevoGasto);
  guardarTodo();
  renderizarGastos();
  actualizarTotal();
  e.target.reset();
});

function renderizarGastos() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  baseGastos[usuarioActual].forEach((gasto) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${gasto.descripcion}</td>
      <td>$${gasto.monto.toFixed(2)}</td>
      <td>${gasto.categoria}</td>
      <td><button onclick="eliminarGasto(${gasto.id})">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function actualizarTotal() {
  const total = baseGastos[usuarioActual].reduce((acc, g) => acc + g.monto, 0);
  document.getElementById("total").textContent = total.toFixed(2);
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

  baseGastos[usuarioActual] = baseGastos[usuarioActual].filter((g) => g.id !== gastoPendienteEliminar);
  guardarTodo();
  renderizarGastos();
  actualizarTotal();
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

window.addEventListener("DOMContentLoaded", () => {
  const almacenado = localStorage.getItem("usuarioActual");
  if (almacenado && baseGastos[almacenado]) {
    usuarioActual = almacenado;
    document.getElementById("login").style.display = "none";
    document.querySelector("main").style.display = "block";
    document.getElementById("bienvenida").textContent = `👋Bienvenido de nuevo a tu Gestor de Gastos Mensuales👋`;
    renderizarGastos();
    actualizarTotal();
  }
});

function guardarTodo() {
  localStorage.setItem("baseGastos", JSON.stringify(baseGastos));
}