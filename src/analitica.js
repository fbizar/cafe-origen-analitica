const ventas = require("./datos");

const valorVenta = (venta) => venta.cantidad * venta.precio;
// Coloca el texto en minúscula, le quita espacios antes y después, y remueve las tildes y ñ.
const normalizar = (texto) =>
    String(texto ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

/** 
##################################
     Funciones con ciclos
################################## 
**/

// Devuelve el registro completo, no solo el valor
function ventaMayor(ventas) {
    let registroMayor = null;
    let valorMayor = -Infinity;

    for (const venta of ventas) {
        if (venta.cantidad <= 0) continue;

        const valorActual = valorVenta(venta);
        if (valorActual > valorMayor) {
            valorMayor = valorActual;
            registroMayor = venta;
        }
    }
    return registroMayor;
}


function totalVendido(ventas) {
    let total = 0;
    for (const venta of ventas) {
        if (venta.cantidad <= 0) continue;

        total += valorVenta(venta);
    }
    return total;
}

function unidadesVendidas(ventas) {
    let totalUnidades = 0;
    for (const venta of ventas) {
        if (venta.cantidad <= 0) continue;

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
            validas++;
        }
    }
    return validas === 0 ? null : total / validas;
}

// Ignora mayúsculas y espacios sobrantes
function ventasPorCiudad(ventas, ciudad) {
    const ciudadBuscada = normalizar(ciudad);
    let total = 0
    for (const venta of ventas) {

        if (venta.cantidad <= 0) continue;

        if (normalizar(venta.ciudad) === ciudadBuscada) {
            total += valorVenta(venta);
        }
    }

    return total
}

/** 
##################################
     Funciones con métodos de Array
################################## 
**/

function totalVendidoM(ventas) {
    return ventas
        .filter((venta) => venta.cantidad > 0)
        .reduce((total, venta) => total + valorVenta(venta), 0);
}

function unidadesVendidasM(ventas) {
    return ventas
        .filter((venta) => venta.cantidad > 0)
        .reduce((total, venta) => total + venta.cantidad, 0);
}

function ventasPorCiudadM(ventas, ciudad) {
    const ciudadBuscada = normalizar(ciudad);
    return ventas
        .filter((venta) => (venta.cantidad > 0 && normalizar(venta.ciudad) === ciudadBuscada))
        .reduce((total, venta) => total + valorVenta(venta), 0);
}

function totalPorCiudad(ventas) {
    return ventas
        .filter((venta) => venta.cantidad > 0)
        .reduce((totales, venta) => {
            const ciudad = normalizar(venta.ciudad);
            totales[ciudad] = (totales[ciudad] ?? 0) + valorVenta(venta);
            return totales;
        }, {});
}

function unidadesPorProducto(ventas) {
    return ventas
        .filter((venta) => venta.cantidad > 0)
        .reduce((unidades, venta) => {
            unidades[venta.producto] = (unidades[venta.producto] ?? 0) + venta.cantidad;
            return unidades;
        }, {});
}

function topProductosPorValor(ventas, k) {

    const topProductos = ventas
        .reduce((valores, venta) => {
            if (venta.cantidad > 0){
                valores[venta.producto] = (valores[venta.producto] ?? 0) + valorVenta(venta);
            }
            return valores;
        }, {});


    return Object.entries(topProductos).map(([producto, total]) => ({ producto, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, k);
}

function ventasDelDia(ventas, fecha) {
    if (!Array.isArray(ventas)) return [];

    const fechaBuscada = String(fecha ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaBuscada)) {
        throw new Error(`Formato de fecha inválido: "${fecha}". Usa AAAA-MM-DD.`);
    }

    return ventas.filter((venta) => String(venta.fecha ?? "").trim() === fechaBuscada);
}


module.exports = {
    valorVenta,
    normalizar,
    ventaMayor,
    totalVendido,
    unidadesVendidas,
    ventasPorCiudad,
    ticketPromedio,
    totalVendidoM,
    unidadesVendidasM,
    ventasPorCiudadM,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    ventasDelDia
};

// console.table(totalPorCiudad([]));
// console.table(unidadesPorProducto(ventas));
// console.table(topProductosPorValor(ventas, 5));
// console.log(ventaMayor(ventas));
// console.log("Total ventas: $", totalVendido(ventas))
// console.log("Unidades vendidas:", unidadesVendidas(ventas))
// console.log("Ticket promedio:", ticketPromedio(ventas))
// console.log("Ventas en Medellín: $", ventasPorCiudad(ventas, "medellín"))