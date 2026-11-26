import { ventaMayorC, totalVendidoC, totalPorCiudadC, primeraVentaC } from "./instrumentadas.js"
import generarVentas from "./generador.js"

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

console.table(resultado);