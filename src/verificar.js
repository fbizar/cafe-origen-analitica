const {ventas} = require("./datos");
const generarVentas = require("./generador");
const {
    totalVendido,
    unidadesVendidas,
    ventasPorCiudad,
    totalVendidoM,
    unidadesVendidasM,
    ventasPorCiudadM,
    totalPorCiudad,
    unidadesPorProducto,
    topProductosPorValor,
    totalCiudadCadena,
    totalCiudadUnaPasada,
    clientesRecurrentes
} = require("./analitica");
const { clientesRecurrentesSet, clientesRecurrentesMap, comprasPorCliente } = require("./optimizadas");

const desde = (...clientes) => clientes.map((cliente) => ({ cliente }));
const ordenados = (lista) => JSON.stringify([...lista].sort());
const sinRepetidos = (lista) => new Set(lista).size === lista.length;

function comparar(nombre, resultadoCiclo, resultadoMetodos) {
    const estado = resultadoCiclo === resultadoMetodos ? "OK" : "DIFERENTE";
    console.log(`${nombre}: ${estado} (ciclo: ${resultadoCiclo}, métodos: ${resultadoMetodos})`);
}

console.log("--- Arreglo completo ---");
comparar("totalVendido", totalVendido(ventas), totalVendidoM(ventas));
comparar("unidadesVendidas", unidadesVendidas(ventas), unidadesVendidasM(ventas));
comparar("ventasPorCiudad (Medellín)", ventasPorCiudad(ventas, "Medellín"), ventasPorCiudadM(ventas, "Medellín"));
comparar("ventasPorCiudad (Cali)", ventasPorCiudad(ventas, "Cali"), ventasPorCiudadM(ventas, "Cali"));

console.log("--- Un solo elemento ---");
const unaVenta = [ventas[0]];
comparar("totalVendido", totalVendido(unaVenta), totalVendidoM(unaVenta));
comparar("unidadesVendidas", unidadesVendidas(unaVenta), unidadesVendidasM(unaVenta));
comparar("ventasPorCiudad (Medellín)", ventasPorCiudad(unaVenta, "Medellín"), ventasPorCiudadM(unaVenta, "Medellín"));

console.log("--- Arreglo vacío ---");
comparar("totalVendido", totalVendido([]), totalVendidoM([]));
comparar("unidadesVendidas", unidadesVendidas([]), unidadesVendidasM([]));
comparar("ventasPorCiudad (Medellín)", ventasPorCiudad([], "Medellín"), ventasPorCiudadM([], "Medellín"));

console.log("")
console.log(totalPorCiudad(ventas));
console.log(unidadesPorProducto(ventas));
console.log(topProductosPorValor(ventas, 3));

const ventasG = generarVentas(10000);
console.log("---------- Total ciudad: Cadena vs Una Pasada ----------")
comparar("Total ciudad (10.000 ventas - Buscada: Pereira)", totalCiudadUnaPasada(ventasG,"Pereira"),totalCiudadCadena(ventasG,"Pereira"));

// Pruebas método 6 pasos
//---------------------------------------------------------
const casos = [
    ["1. Arreglo vacío", [], []],
    ["2a. undefined", undefined, []],
    ["2b. null", null, []],
    ["3. Una venta", desde("C01"), []],
    ["4. Nadie repite", desde("C01", "C02", "C03"), []],
    ["5. Un cliente repite", desde("C01", "C02", "C01"), ["C01"]],
    ["6. Un cliente con 3 ventas", desde("C01", "C01", "C01"), ["C01"]],
    ["7. Orden de aparición", desde("C01", "C02", "C02", "C01"), ["C01", "C02"]],
    ["8. Ids 1 a 5 de ventas", [ventas[0], ventas[1], ventas[2], ventas[3], ventas[4]], ["C01"]],
    ["9. Las 12 ventas", ventas, ["C01", "C02", "C03"]],
];

console.log("\n","---------- Validación de clientesRecurrentes() OPTIMIZADA ----------")

for (const [nombre, entrada, esperado] of casos) {
    const obtenido = clientesRecurrentesSet(entrada);
    const ok = ordenados(obtenido) === ordenados(esperado);
    console.log(`${nombre}: ${ok ? "OK" : "FALLA"} -> ${JSON.stringify(obtenido)}`);
}

// Restricción: no modifica ventas
const antes = JSON.stringify(ventas);
clientesRecurrentesSet(ventas);
console.log(`ventas sin modificar: ${JSON.stringify(ventas) === antes ? "OK" : "FALLA"}`);


//Verificar versiones de clientes recurrentes
//---------------------------------------------------------
function compararTres(nombre, datos) {
    const original = clientesRecurrentes(datos);
    const conSet = clientesRecurrentesSet(datos);
    const conMap = clientesRecurrentesMap(datos);

    const setIgual = ordenados(original) === ordenados(conSet);
    const mapIgual = ordenados(original) === ordenados(conMap);
    const sinDuplicados = sinRepetidos(original) && sinRepetidos(conSet) && sinRepetidos(conMap);
    const estado = setIgual && mapIgual && sinDuplicados ? "OK" : "DIFERENTE";

    console.log(`${nombre}: ${estado} (original: ${original.length}, Set: ${conSet.length}, Map: ${conMap.length} clientes)`);
    console.log(`   mismo orden que el original -> Set: ${JSON.stringify(original) === JSON.stringify(conSet)}, Map: ${JSON.stringify(original) === JSON.stringify(conMap)}`);
}

console.log();
console.log("--- Datos del Día 1 ---");
compararTres("12 ventas", ventas);
compararTres("arreglo vacío", []);
compararTres("una venta", [ventas[0]]);

console.log();
console.log("--- 5.000 ventas generadas ---");
for (let intento = 1; intento <= 5; intento++) {
    compararTres(`intento ${intento}`, generarVentas(5000));
}

// Comprobación extra: la suma de las compras debe ser igual a n
const datos = generarVentas(5000);
let suma = 0;
for (const cantidad of comprasPorCliente(datos).values()) suma += cantidad;
console.log(`comprasPorCliente: suma de compras = ${suma} (${suma === datos.length ? "OK" : "DIFERENTE"})`);