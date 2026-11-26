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
    totalCiudadUnaPasada
} = require("./analitica");

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