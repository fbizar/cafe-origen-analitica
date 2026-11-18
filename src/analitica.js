const ventas = require("./datos");

const valorVenta = (venta) => venta.cantidad * venta.precio;
const normalizar = (texto) => texto.trim().toLowerCase();

// Devuelve el registro completo, no solo el valor
function ventaMayor(ventas) {

    let valorMayor = 0;
    let registroMayor = {};

    for (const venta of ventas) {
        const valorVentaActual = valorVenta(venta);
        if (valorVentaActual > valorMayor) {
            valorMayor = valorVenta(venta);
            registroMayor = venta;
        }
    }
    return registroMayor;
}
function totalVendido(ventas) {
    let total = 0;
    for (const venta of ventas) {
        total += valorVenta(venta);
    }
    return total;
}

function unidadesVendidas(ventas) {
    let totalUnidades = 0;
    for (const venta of ventas) {
        totalUnidades += venta.cantidad;
    }
    return totalUnidades;
}


// Total ÷ cantidad de ventas válidas (cantidad > 0)
function ticketPromedio(ventas) {
    let validas = 0;
    let total = 0;
    for (const venta of ventas) {
        if (venta.cantidad > 0) {
            total += valorVenta(venta);
            validas++
        };
    }
    return validas === 0 ? 0 :total / validas;
}

// Ignora mayúsculas y espacios sobrantes
function ventasPorCiudad(ventas, ciudad) {
    let ciudadBuscada = normalizar(ciudad);
    let total = 0
    for (const venta of ventas) {
        if (normalizar(venta.ciudad) === ciudadBuscada) {
            total += valorVenta(venta);
        }
    }

    let ventaCiudad = {}
    ventaCiudad[ciudadBuscada] = total;
    return ventaCiudad;
}

console.log(ventaMayor(ventas));
console.log("Total ventas: $", totalVendido(ventas))
console.log("Unidades vendidas:", unidadesVendidas(ventas))
console.log("Ticket promedio:", ticketPromedio(ventas))
console.log("Ventas en Medellín: $", ventasPorCiudad([], "medellín"))