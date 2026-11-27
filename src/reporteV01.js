const {
    ventaMayor,
    totalVendido,
    unidadesVendidas,
    ticketPromedio,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    ventasDelDia
} = require("./analitica");

let formatear = (precio) => precio.toLocaleString("es-CO");
let formatearPropiedad = (ventas, propiedad) => {
    if (!Array.isArray(ventas)) throw new Error("Se esperaba un array.")

    ventas.map((venta) => {
        if (venta.hasOwnProperty(propiedad)) {
            venta[propiedad] = `\$${formatear(venta[propiedad])}`;
        }
        return venta;
    });
    return ventas;
};

function generarReporteV01(ventas) {
    // Resumen General
    console.log("");
    console.log("#########################");
    console.log("   Resumen General");
    console.log("#########################");

    console.log("1. Total ventas: $", formatear(totalVendido(ventas)));
    console.log("2. Unidades vendidas:", unidadesVendidas(ventas));
    console.log("3. Ticket promedio: $", formatear(ticketPromedio(ventas)));
    console.log("4. Venta mayor: ");
    console.table(formatearPropiedad([ventaMayor(ventas)], 'precio'));

    // Ventas por ciudad
    console.log("");
    console.log("#########################");
    console.log("   Ventas por ciudad")
    console.log("#########################");

    const totalCiudades = totalPorCiudad(ventas);
    Object.keys(totalCiudades).forEach(function (ciudad) {
        totalCiudades[ciudad] = `\$${formatear(totalCiudades[ciudad])}`
    });

    console.table(totalCiudades);

    // Unidades por producto
    console.log("");
    console.log("#########################");
    console.log("  Unidades por producto")
    console.log("#########################");

    console.table(unidadesPorProducto(ventas));

    // Top 3 de productos por valor
    console.log("");
    console.log("#########################");
    console.log("   Top 3 de productos")
    console.log("#########################");


    console.table(topProductosPorValor(ventas, 3).map((top) => {
        top["total"] = `\$${formatear(top["total"])}`;
        return top;
    }));

    // Ventas del día
    console.log("");
    console.log("#########################");
    console.log("   Ventas del día")
    console.log("#########################");

    console.log("> Día: 2026-09-05")
    console.table(formatearPropiedad(ventasDelDia(ventas, "2026-09-05"), 'precio'));

    console.log("> Día: 2026-11-06");
    console.table(formatearPropiedad(ventasDelDia(ventas, "2026-11-06"), 'precio'));
}

module.exports = { generarReporteV01 };