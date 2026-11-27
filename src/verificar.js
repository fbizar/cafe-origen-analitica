const {ventas, ventasDiarias} = require("./datos");
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
    clientesRecurrentes,
    productoEstrellaPorCiudad,
    primerClienteUnico,
    mejorSemanaBruta,
    mejorSemana,
    parMasCercano
} = require("./analitica");
const { clientesRecurrentesSet, clientesRecurrentesMap, comprasPorCliente } = require("./optimizadas");
// Restricción: no modifica ventas
const antes = JSON.stringify(ventas);
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


// Pruebas combo regalo: Optimizada vs Bruta
//---------------------------------------------------------
console.log("\n","---------- Pruebas combo regalo: Optimizada vs Fuerza Bruta ----------")
const { catalogo } = require("./catalogo");
const { comboRegaloFuerzaBruta, comboRegalo } = require("./analitica");

const nombres = (par) => (par ? par.map((p) => p.producto).join(" + ") : null);
const sumar = (par) => par[0].precio + par[1].precio;

function probarCombo(valor) {
    const bruta = comboRegaloFuerzaBruta(catalogo, valor);
    const optimizada = comboRegalo(catalogo, valor);
    
    const ambasNull = bruta === null && optimizada === null;
    const ambasValidas = bruta !== null && optimizada !== null
    && sumar(bruta) === valor && sumar(optimizada) === valor
    && bruta[0] !== bruta[1] && optimizada[0] !== optimizada[1];

    console.log(`${valor}: ${ambasNull || ambasValidas ? "OK" : "DIFERENTE"}`);
    console.log(`   fuerza bruta: ${nombres(bruta)}`);
    console.log(`   optimizada:   ${nombres(optimizada)}`);
}

for (const valor of [87000, 61000, 100000, 84000, 121000]) probarCombo(valor);

console.log(comboRegalo([], 87000));        // null (catálogo vacío)
console.log(comboRegalo(undefined, 87000)); // null (entrada inválida)

// Producto estrella por ciudad
//---------------------------------------------------------
console.log("\n","---------- Pruebas combo regalo: Optimizada vs Fuerza Bruta ----------")
const v = (ciudad, producto, cantidad = 1) => ({ ciudad, producto, cantidad });

const casosProductosEst = [
    ["1. Arreglo vacío", [], {}],
    ["2. undefined", undefined, {}],
    ["3. Datos del Día 1", ventas, {
        medellin: { producto: "Origen Huila 500 g", veces: 2 },
        bogota: { producto: "Origen Nariño 250 g", veces: 3 },
        cali: { producto: "Prensa francesa", veces: 1 },
        pereira: { producto: "Origen Huila 500 g", veces: 1 },
    }],
    ["4. Empate simple", [v("Cali", "A"), v("Cali", "B")], { cali: { producto: "A", veces: 1 } }],
    ["5. Empate: gana el primero en aparecer", [v("Cali", "B"), v("Cali", "A"), v("Cali", "A"), v("Cali", "B")],
    { cali: { producto: "B", veces: 2 } }],
    ["6. Ciudades normalizadas", [v("Bogotá", "A"), v("Bogotá ", "A"), v("bogota", "A")],
    { bogota: { producto: "A", veces: 3 } }],
    ["7. Solo ventas con cantidad 0", [v("Cali", "A", 0)], {}],
];

for (const [nombre, entrada, esperado] of casosProductosEst) {
    const obtenido = productoEstrellaPorCiudad(entrada);
    const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
    console.log(`${nombre}: ${ok ? "OK" : "FALLA"}`);
    if (!ok) console.log("   obtenido:", JSON.stringify(obtenido));
}

productoEstrellaPorCiudad(ventas);
console.log(`ventas sin modificar: ${JSON.stringify(ventas) === antes ? "OK" : "FALLA"}`);


// Primer Cliente Único
//---------------------------------------------------------
console.log("\n","---------- Pruebas de primerClienteUnico() ----------")
const c = (cliente, cantidad = 1) => ({ cliente, cantidad });

const casosClienteUnico = [
    ["1. Arreglo vacío", [], null],
    ["2. undefined", undefined, null],
    ["3. Datos del Día 1", ventas, "C04"],
    ["4. Nadie es único", [c("C01"), c("C01")], null],
    ["5. Todos únicos", [c("C01"), c("C02")], "C01"],
    ["6. Repetidos antes del único", [c("C01"), c("C02"), c("C01")], "C02"],
    ["7. El único es la última venta", [c("C01"), c("C01"), c("C02")], "C02"],
    ["8. Cantidad 0 no cuenta como compra", [c("C01"), c("C01", 0), c("C02")], "C01"],
    ["9. Solo ventas con cantidad 0", [c("C01", 0)], null],
];

for (const [nombre, entrada, esperado] of casosClienteUnico) {
    const obtenido = primerClienteUnico(entrada);
    console.log(`${nombre}: ${obtenido === esperado ? "OK" : "FALLA"}`);
    if (obtenido !== esperado) console.log(`   obtenido: ${obtenido}, esperado: ${esperado}`);
}

primerClienteUnico(ventas);
console.log(`ventas sin modificar: ${JSON.stringify(ventas) === antes ? "OK" : "FALLA"}`);


// Mejor semana
//---------------------------------------------------------
console.log("\n","---------- Pruebas Mejor Semana: Ventana vs Fuerza Bruta ----------")
const casosMejorSemana = [
    ["1. Septiembre, k = 7", ventasDiarias, 7, { inicio: 23, total: 3670 }],
    ["2. k mayor que los días", [1, 2, 3], 4, null],
    ["3. k igual a los días", [1, 2, 3], 3, { inicio: 0, total: 6 }],
    ["4. k = 1", [4, 9, 2], 1, { inicio: 1, total: 9 }],
    ["5. Empate: gana la primera", [5, 5, 5, 5], 2, { inicio: 0, total: 10 }],
    ["6. Arreglo vacío", [], 3, null],
    ["7. undefined", undefined, 3, null],
    ["8. k = 0", [1, 2, 3], 0, null],
    ["9. Valores negativos", [-5, -1, -3, -2], 2, { inicio: 1, total: -4 }],
];

for (const [nombre, dias, k, esperado] of casosMejorSemana) {
    const bruta = JSON.stringify(mejorSemanaBruta(dias, k));
    const desliz = JSON.stringify(mejorSemana(dias, k));
    const ok = bruta === JSON.stringify(esperado) && desliz === JSON.stringify(esperado);
    console.log(`${nombre}: ${ok ? "OK" : "FALLA"}`);
    if (!ok) console.log(`   bruta: ${bruta}, deslizante: ${desliz}, esperado: ${JSON.stringify(esperado)}`);
}

// 100.000 días al azar (ventas entre 200 y 800, como en septiembre)
function diasAlAzar(n) {
    const dias = [];
    for (let i = 0; i < n; i++) dias.push(200 + Math.floor(Math.random() * 601));
    return dias;
}

const grandes = diasAlAzar(100000);
for (const k of [7, 1000]) {
    const a = mejorSemanaBruta(grandes, k);
    const b = mejorSemana(grandes, k);
    const igual = a.inicio === b.inicio && a.total === b.total;
    console.log(`100.000 días, k = ${k}: ${igual ? "OK" : "DIFERENTE"} (inicio ${b.inicio}, total ${b.total})`);
}

// Par más cercano
//---------------------------------------------------------
console.log("\n","---------- Pruebas Par Más Cercano ----------")

const casosParCercano = [
    ["1. Presupuesto 100.000", catalogo, 100000, "Filtros de papel x100 + Origen Huila 1 kg"],
    ["2. Presupuesto 140.000 (suma exacta)", catalogo, 140000, "Origen Sierra 500 g + Prensa francesa"],
    ["3. Presupuesto 40.000 (sin solución)", catalogo, 40000, null],
    ["4. Presupuesto 87.000 (suma exacta)", catalogo, 87000, "Origen Huila 500 g + Origen Sierra 500 g"],
    ["5. Presupuesto enorme", catalogo, 1000000, "Prensa francesa + Molino manual"],
    ["6. Presupuesto 0", catalogo, 0, null],
    ["7. Catálogo vacío", [], 100000, null],
    ["8. Un solo producto", [catalogo[0]], 100000, null],
    ["9. undefined", undefined, 100000, null],
    ["10. Precios repetidos", [{ producto: "A", precio: 10 }, { producto: "B", precio: 10 }], 20, "A + B"],
];

for (const [nombre, datos, presupuesto, esperado] of casosParCercano) {
    const obtenido = nombres(parMasCercano(datos, presupuesto));
    console.log(`${nombre}: ${obtenido === esperado ? "OK" : "FALLA"}`);
    if (obtenido !== esperado) console.log(`   obtenido: ${obtenido}, esperado: ${esperado}`);
}

// Comparación con fuerza bruta: la mejor suma debe coincidir y nunca superar el presupuesto
function mejorSumaBruta(datos, presupuesto) {
    let mejor = null;
    for (let i = 0; i < datos.length; i++) {
        for (let j = i + 1; j < datos.length; j++) {
            const suma = datos[i].precio + datos[j].precio;
            if (suma <= presupuesto && (mejor === null || suma > mejor)) mejor = suma;
        }
    }
    return mejor;
}

let coincide = true;
for (let presupuesto = 0; presupuesto <= 250000; presupuesto += 500) {
    const par = parMasCercano(catalogo, presupuesto);
    const obtenida = par ? par[0].precio + par[1].precio : null;
    if (obtenida !== mejorSumaBruta(catalogo, presupuesto)) {
        coincide = false;
        console.log(`   falla con presupuesto ${presupuesto}`);
    }
}
console.log(`Comparación con fuerza bruta (501 presupuestos): ${coincide ? "OK" : "FALLA"}`);

const antesCatalogo = JSON.stringify(catalogo);
parMasCercano(catalogo, 100000);
console.log(`catálogo sin modificar: ${JSON.stringify(catalogo) === antesCatalogo ? "OK" : "FALLA"}`);