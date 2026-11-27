import { ventaMayorC, totalVendidoC, totalPorCiudadC, primeraVentaC } from "./instrumentadas.js"
import generarVentas from "./generador.js"
import {
    totalVendido, unidadesVendidas, ventaMayor, ticketPromedio, ventasPorCiudad,
    totalVendidoM, unidadesVendidasM, ventasPorCiudadM,
    totalPorCiudad, unidadesPorProducto, topProductosPorValor,
    ventasDelDia, clientesRecurrentes,
    totalCiudadCadena, totalCiudadUnaPasada, primeraVenta,
    mejorSemanaBruta, mejorSemana
} from "./analitica.js";
import { clientesRecurrentesSet, clientesRecurrentesMap } from "./optimizadas.js";
import {ventas} from "./datos.js";


// Mediciones de número de operaciones
const numeros = [100,1000,10000,100000]
const funciones = [
    {funcion: ventaMayorC, contador: {ops: 0}},
    {funcion: totalVendidoC, contador: {ops: 0}},
    {funcion: totalPorCiudadC, contador: {ops: 0}},
    {funcion: primeraVentaC, contador: {ops: 0}}]
    
    const resultado = []
for (const n of numeros) {
    const ventasG = generarVentas(n)
    const itemResultado = {n: n}
    for (const f of funciones) {
        f.contador.ops = 0;
        f.funcion(ventasG,f.contador);
        itemResultado[f.funcion.name] = f.contador.ops;
    }
    resultado.push(itemResultado);
}


console.log("=================================")
console.log("Mediciones")
console.log("=================================")
console.log("> Número de operaciones: ")
console.table(resultado);
// Mediciones de tiempo de ejecución.

const numeros2 = [1000,2000,4000,8000,16000]

console.log("> Tiempo de ejecución: ")
console.log("1. Búsqueda de clientes recurrentes")

for (const n of numeros2) {
    const ventas = generarVentas(n);
    console.time(`${n} ventas`);
    clientesRecurrentes(ventas);
    console.timeEnd(`${n} ventas`);
}


// Mediciones de todas las funciones 
const datos = generarVentas(10000);
const ciudad = datos[0].ciudad;
const fecha = datos[0].fecha;

let sumidero; // guarda el resultado para que el motor de JavaScript no elimine la llamada

function medir(fn, repeticiones) {
    sumidero = fn(); // calentamiento
    const tiempos = [];
    for (let r = 0; r < 5; r++) {
        const inicio = performance.now();
        for (let i = 0; i < repeticiones; i++) sumidero = fn();
        tiempos.push((performance.now() - inicio) / repeticiones);
    }
    tiempos.sort((a, b) => a - b);
    return tiempos[2]; // mediana, en ms por llamada
}

const pruebas = [
    ["primeraVenta", () => primeraVenta(datos), 100000],
    ["totalVendido", () => totalVendido(datos), 200],
    ["unidadesVendidas", () => unidadesVendidas(datos), 200],
    ["ventaMayor", () => ventaMayor(datos), 200],
    ["ticketPromedio", () => ticketPromedio(datos), 200],
    ["ventasPorCiudad", () => ventasPorCiudad(datos, ciudad), 200],
    ["totalVendidoM", () => totalVendidoM(datos), 200],
    ["unidadesVendidasM", () => unidadesVendidasM(datos), 200],
    ["ventasPorCiudadM", () => ventasPorCiudadM(datos, ciudad), 200],
    ["totalPorCiudad", () => totalPorCiudad(datos), 200],
    ["unidadesPorProducto", () => unidadesPorProducto(datos), 200],
    ["topProductosPorValor", () => topProductosPorValor(datos, 3), 200],
    ["ventasDelDia", () => ventasDelDia(datos, fecha), 200],
    ["totalCiudadCadena", () => totalCiudadCadena(datos, ciudad), 200],
    ["totalCiudadUnaPasada", () => totalCiudadUnaPasada(datos, ciudad), 200],
    ["clientesRecurrentes", () => clientesRecurrentes(datos), 1],
];

const resultados = [];
// for (const [nombre, fn, repeticiones] of pruebas) {
//     resultados.push({ funcion: nombre, "ms por llamada": medir(fn, repeticiones).toFixed(4) });
// }

console.log("2. Todas las funciones con 10.000 ventas")
console.table(resultados);

// Mediciones de clientesRecurrentes

console.log("3. Las '3' versiones de clientesRecurrentes")
const MEDIR_ORIGINAL_100K = false;
const numeros3 = [1000, 10000, 100000]

function cronometrar(etiqueta, fn, repeticiones = 1, calentar = true) {
    if (calentar) sumidero = fn(); // calentamiento: no se cronometra
    const nombre = repeticiones > 1 ? `${etiqueta} (${repeticiones} llamadas)` : etiqueta;
    console.time(nombre);
    for (let i = 0; i < repeticiones; i++) sumidero = fn();
    console.timeEnd(nombre);
}

for (const n of numeros3) {
    const datos = generarVentas(n);
    console.log(`--- ${n} ventas ---`);

    if (n <= 10000) {
        cronometrar(`original ${n} ventas`, () => clientesRecurrentes(datos));
    } else if (MEDIR_ORIGINAL_100K) {
        cronometrar(`original ${n} ventas`, () => clientesRecurrentes(datos), 1, false);
    } else {
        console.log(`original ${n} ventas: no medido`);
    }

    cronometrar(`Set ${n} ventas`, () => clientesRecurrentesSet(datos), 1);
    cronometrar(`Map ${n} ventas`, () => clientesRecurrentesMap(datos), 1);
}

// Mediciones de mejorSemana
console.log("\n","4. Las 2 versiones de mejorSemana")
function diasAlAzar(n) {
    const dias = [];
    for (let i = 0; i < n; i++) dias.push(200 + Math.floor(Math.random() * 601));
    return dias;
}

const grandes = diasAlAzar(100000);
for (const k of [7, 1000]) {
    sumidero = mejorSemanaBruta(grandes, k); // calentamiento, no se cronometra
    sumidero = mejorSemana(grandes, k);

    console.time(`bruta k=${k}`);
    sumidero = mejorSemanaBruta(grandes, k);
    console.timeEnd(`bruta k=${k}`);

    console.time(`deslizante k=${k}`);
    sumidero = mejorSemana(grandes, k);
    console.timeEnd(`deslizante k=${k}`);
}