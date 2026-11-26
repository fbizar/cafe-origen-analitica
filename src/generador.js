const {productos,ciudades} = require("./datos");

const azar = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generarVentas(n) {
  const clientes = Math.max(1, Math.floor(n / 3));
  const ventas = [];
  for (let i = 1; i <= n; i++) {
    const p = productos[azar(0, productos.length - 1)];
    ventas.push({
      id: i, fecha: "2026-09-" + String(azar(1, 30)).padStart(2, "0"),
      cliente: "C" + String(azar(1, clientes)).padStart(2, "0"),
      producto: p.producto, ciudad: ciudades[azar(0, ciudades.length - 1)],
      cantidad: azar(1, 5), precio: p.precio
    });
  }
  return ventas;
}

module.exports = generarVentas;