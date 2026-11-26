const {normalizar, valorVenta} = require("./analitica")

function ventaMayorC(ventas,c) {
    let registroMayor = null;
    let valorMayor = -Infinity;

    for (const venta of ventas) {
        c.ops++;
        c.ops++;
        if (venta.cantidad <= 0) continue;

        const valorActual = valorVenta(venta);
        c.ops++;
        if (valorActual > valorMayor) {
            valorMayor = valorActual;
            registroMayor = venta;
        }
    }
    return registroMayor;
}


function totalVendidoC(ventas,c) {
    let total = 0;
    for (const venta of ventas) {
        c.ops++;
        c.ops++;
        if (venta.cantidad <= 0) continue;
        total += valorVenta(venta);
    }
    return total;
}

function totalPorCiudadC(ventas,c) {
    return ventas.reduce((totales, venta) => {
        c.ops++;
        c.ops++;
        if (venta.cantidad > 0) {
            const ciudad = normalizar(venta.ciudad);
            totales[ciudad] = (totales[ciudad] ?? 0) + valorVenta(venta);
        }
        return totales;
    }, {});
}

function primeraVentaC(ventas,c){
    c.ops++;
    return ventas[0];
}

module.exports = {ventaMayorC,totalVendidoC,totalPorCiudadC,primeraVentaC}