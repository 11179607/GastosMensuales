let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

document.addEventListener("DOMContentLoaded", () => {
  renderizarGastos();
  actualizarTotal();
});

document.getElementById("formulario").addEventListener("submit", e => {
  e.preventDefault();
  const descripcion = document.getElementById("descripcion").value.trim();
  const monto = parseFloat(document.getElementById("monto").value);

  if (!descripcion || isNaN(monto) || monto <= 0) return;

  const nuevoGasto = { id: Date.now(), descripcion, monto };
  gastos.push(nuevoGasto);
  guardarGastos();
  renderizarGastos();
  actualizarTotal();

  e.target.reset();
});

function renderizarGastos() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";
  gastos.forEach(gasto => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${gasto.descripcion}</td>
      <td>$${gasto.monto.toFixed(2)}</td>
      <td><button onclick="eliminarGasto(${gasto.id})">Eliminar</button></td>
    `;
    tbody.appendChild(fila);
  });
}

function actualizarTotal() {
  const total = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);
  document.getElementById("total").textContent = total.toFixed(2);
}

function guardarGastos() {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

function eliminarGasto(id) {
  const password = prompt("Introduce la contraseña para eliminar este gasto:");
  if (password !== "5370") {
    alert("Contraseña incorrecta. No se ha eliminado el gasto.");
    return;
  }

  gastos = gastos.filter(g => g.id !== id);
  guardarGastos();
  renderizarGastos();
  actualizarTotal();
}