const { performance } = require("perf_hooks");
const {ventas, ventasDiarias} = require("./datos");
const generarVentas = require("./generador");
const { catalogo } = require("./catalogo");
const {
    ventaMayor,
    totalVendido,
    unidadesVendidas,
    ticketPromedio,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    ventasDelDia,
    productoEstrellaPorCiudad,
    comboRegalo,
    primerClienteUnico,
    totalesPorDia,
    mejorSemana
} = require("./analitica");
const { clientesRecurrentesSet} = require("./optimizadas");

const VALOR_TARJETA = 87000;
const DIAS_SEMANA = 7;
const MAX_FILAS = 5;

let formatear = (precio) => precio.toLocaleString("es-CO");

// Devuelve copias con la propiedad formateada: no modifica las ventas originales
let formatearPropiedad = (ventas, propiedad) => {
    if (!Array.isArray(ventas)) throw new Error("Se esperaba un array.");

    return ventas.map((venta) => {
        if (!venta.hasOwnProperty(propiedad)) return venta;
        return { ...venta, [propiedad]: `$${formatear(venta[propiedad])}` };
    });
};

let encabezado = (texto) => {
    console.log("");
    console.log(`--- ${texto} ---`);
};

let mostrarFilas = (filas) => {
    if (filas.length === 0) {
        console.log("(sin registros)");
        return;
    }
    console.table(filas.slice(0, MAX_FILAS));
    if (filas.length > MAX_FILAS) {
        console.log(`... mostrando ${MAX_FILAS} de ${formatear(filas.length)} registros`);
    }
};

function generarReporte(ventas, diasMes, motor = {}) {
    const recurrentesDe = motor.clientesRecurrentes ?? clientesRecurrentesSet;
    const mejorSemanaDe = motor.mejorSemana ?? mejorSemana;
    const comboDe = motor.comboRegalo ?? comboRegalo;
    // Resumen General
    encabezado("Resumen General");
    console.log("1. Total ventas: $", formatear(totalVendido(ventas)));
    console.log("2. Unidades vendidas:", unidadesVendidas(ventas));
    console.log("3. Ticket promedio: $", formatear(ticketPromedio(ventas)));
    console.log("4. Venta mayor: ");
    console.table(formatearPropiedad([ventaMayor(ventas)], "precio"));

    // Ventas por ciudad
    encabezado("Ventas por ciudad");
    const totalCiudades = totalPorCiudad(ventas);
    Object.keys(totalCiudades).forEach(function (ciudad) {
        totalCiudades[ciudad] = `$${formatear(totalCiudades[ciudad])}`;
    });
    console.table(totalCiudades);

    // Unidades por producto
    encabezado("Unidades por producto");
    console.table(unidadesPorProducto(ventas));

    // Top 3 de productos por valor
    encabezado("Top 3 de productos");
    console.table(topProductosPorValor(ventas, 3).map((top) => ({
        ...top,
        total: `$${formatear(top.total)}`
    })));

    // Ventas del día
    encabezado("Ventas del día");
    for (const dia of ["2026-09-05", "2026-11-06"]) {
        console.log(`> Día: ${dia}`);
        mostrarFilas(formatearPropiedad(ventasDelDia(ventas, dia), "precio"));
    }

    // Clientes recurrentes
    encabezado("Clientes recurrentes");
    const recurrentes = recurrentesDe(ventas);
    console.log(`Clientes con 2 o más compras: ${formatear(recurrentes.length)}`);
    console.log("Primeros:", recurrentes.slice(0, MAX_FILAS).join(", ") || "ninguno");

    // Producto estrella por ciudad
    encabezado("Producto estrella por ciudad");
    console.table(productoEstrellaPorCiudad(ventas));

    // Combo de regalo
    encabezado(`Combo de regalo ($${formatear(VALOR_TARJETA)})`);
    const combo = comboDe(catalogo, VALOR_TARJETA);
    if (combo) console.table(combo);
    else console.log("No hay combinación posible.");

    // Cliente para el cupón
    encabezado("Cliente para el cupón");
    console.log("Primer cliente que compró una sola vez:", primerClienteUnico(ventas) ?? "ninguno");

    // Mejor semana
    encabezado("Mejor semana de septiembre");
    const semana = mejorSemanaDe(diasMes, DIAS_SEMANA);
    if (semana) {
        console.log(`Del día ${semana.inicio + 1} al ${semana.inicio + DIAS_SEMANA}: $${formatear(semana.total)}`);
    } else {
        console.log("No hay suficientes días para calcularla.");
    }
}

function main() {
    const arg = process.argv[2];
    let datos;
    let diasMes;
    let descripcion;
    let msGeneracion = 0;

    if (arg === undefined) {
        datos = ventas;
        diasMes = ventasDiarias.map((miles) => miles * 1000); // la serie está en miles de pesos
        descripcion = `datos reales del Día 1 (${ventas.length} ventas)`;
    } else {
        const n = Number(arg);
        if (!Number.isInteger(n) || n < 1) {
            console.log("Uso: node src/reporte.js [n]");
            console.log("  sin n: datos reales del Día 1");
            console.log("  n:     n ventas generadas al azar (ej. node src/reporte.js 100000)");
            process.exit(1);
        }
        const inicioGeneracion = performance.now();
        datos = generarVentas(n);
        diasMes = totalesPorDia(datos);
        msGeneracion = performance.now() - inicioGeneracion;
        descripcion = `${formatear(n)} ventas generadas al azar`;
    }

    console.log(`REPORTE CAFÉ ORIGEN v1.0 - ${descripcion}`);

    const inicio = performance.now();
    generarReporte(datos, diasMes);
    const msReporte = performance.now() - inicio;

    console.log("");
    if (arg !== undefined) console.log(`Generación de datos: ${msGeneracion.toFixed(1)} ms`);
    console.log(`Tiempo del reporte:  ${msReporte.toFixed(1)} ms`);
}

if (require.main === module) main();

module.exports = { generarReporte };