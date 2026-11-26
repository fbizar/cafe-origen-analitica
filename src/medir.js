import { ventaMayorC, totalVendidoC, totalPorCiudadC, primeraVentaC } from "./instrumentadas.js"
import generarVentas from "./generador.js"
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
// Mediciones de tiempo de ejecución.

const numeros2 = [1000,2000,4000,8000,16000,100000]
function clientesRecurrentes(ventas) {
    const recurrentes = [];
    for (let i = 0; i < ventas.length; i++) {
        for (let j = i + 1; j < ventas.length; j++) {
            if (ventas[i].cliente === ventas[j].cliente &&
                !recurrentes.includes(ventas[i].cliente)) {
                recurrentes.push(ventas[i].cliente);
            }
        }
    }
    return recurrentes;
}

console.log("=================================")
console.log("Mediciones")
console.log("=================================")
console.log("> Número de operaciones: ")
console.table(resultado);
console.log("> Tiempo de ejecución: ")
console.log("Búsqueda de clientes recurrentes")

for (const n of numeros2) {
    const ventas = generarVentas(n);
    console.time(`${n} ventas`);
    clientesRecurrentes(ventas);
    console.timeEnd(`${n} ventas`);
}

