# Bitácora

## Minireto 1 - Primer tueste: el repositorio y los datos
### 1.1 Diccionario de datos
1. `id` - Entero (Number) - Identificador único del dato.
2. `fecha` - Fecha (String) - Fecha del registro.
3. `cliente` - String - ID del cliente relacionado al registro.
4. `producto` - String - Nombre del producto.
5. `ciudad` - String - Ciudad de la compra.
6. `cantidad` - Entero (Number) - Número de productos que se compraron.
7. `precio` - Flotante (Number) - Precio unitario del producto.

### 1.2 Casos borde detectados

| Problema                                             | Decisión                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Venta con id 8 tiene una cantidad en 0               | Excluirlo del ticket, solo se aceptan ventas de al menos 1.                      |
| Entre las ciudades hay un medellín en minúsculas     | Normalizar todos las ciudades en minúsculas y quitar espacios para consistencia. |
| Los clientes C01, C02 y C03 tienes más de 1 registro | No hacer nada, es válido; corresponde a una venta diferente                      |

## Minireto 2 - Los números del día: recorrer, filtrar y acumular
### 2.1 Indicadores

**1. Cuánto se vendió en total**: Multiplica precio con la cantidad de cada venta y lo acumula.
``` java
total = 0
Para Cada venta En ventas Hacer
    total += venta.precio * venta.cantidad;
Fin Para
Retornar total;
```
**2. Cuántas unidades salieron**: Cuenta (acumula) las cantidades de cada venta.
``` java
totalUnidades = 0
Para Cada venta En ventas Hacer
    totalUnidades += venta.cantidad;
Fin Para
Retornar totalUnidades;
```

**3. Cuál fue la venta más grande**: Máximo
``` java
Si Longitud(ventas) == 0 Entonces
    Retornar nulo;
FinSi

ventaMayor = venta[0]
valorVentaMayor = ventaMayor.precio * ventaMayor.cantidad
Para Cada venta En ventas Hacer
    valorVenta = venta.precio * venta.cantidad;

    Si valorVenta > valorVentaMayor Entonces
        ventaMayor = venta;
        valorVentaMayor = ventaMayor.precio * ventaMayor.cantidad
    FinSi
Fin Para
Retornar ventaMayor;
```

**4. Cuánto gasta en promedio un cliente por compra (el ticket promedio)**: Acumula valor venta y conteo de ventas válidas, y retorna el total vendido dividido la cantidad 
``` java
validas = 0;
total = 0;
Para Cada venta En ventas Hacer
    Si venta.cantidad > 0 Entonces
        total += venta.precio * venta.cantidad;
        validas++
    Fin Si
Fin Para

Si validas == 0 Entonces
    Retornar NaN;
Fin Si

Retornar total / validas;
```

### 2.2 Pruebas de las funciones con distintas entradas

Cada función se probó con tres entradas:

- **Arreglo completo:** las 12 ventas.
- **Un solo elemento:** `[ventas[0]]`, la venta `id: 1` (Medellín, 2 × 42000 = 84000).
- **Arreglo vacío:** `[]`.

#### Decisión para el arreglo vacío

| Función | Devuelve con `[]` | Justificación |
|---|---|---|
| `totalVendido` | `0` | Sumar sin elementos da 0, el valor neutro de la suma. |
| `unidadesVendidas` | `0` | Igual que la anterior: no hay unidades. |
| `ventasPorCiudad` | `0` | No hubo ventas en esa ciudad, y 0 es un total válido. |
| `ventaMayor` | `null` | No existe ningún registro que devolver. Inventar uno sería un error. |
| `ticketPromedio` | `null` | El promedio sin ventas válidas no está definido (no es lo mismo que 0). |

Regla aplicada: las funciones que **acumulan** devuelven `0` y las que **eligen o promedian** devuelven `null`.

> Nota: `ticketPromedio` debe usar `return validas === 0 ? null : total / validas;` (antes devolvía `NaN`).

#### Código de prueba

```javascript
const unaVenta = [ventas[0]];
const vacio = [];

console.log(totalVendido(ventas));                     // 985000
console.log(totalVendido(unaVenta));                   // 84000
console.log(totalVendido(vacio));                      // 0

console.log(unidadesVendidas(ventas));                 // 21
console.log(unidadesVendidas(unaVenta));               // 2
console.log(unidadesVendidas(vacio));                  // 0

console.log(ventaMayor(ventas));                       // registro id: 10 (168000)
console.log(ventaMayor(unaVenta));                     // registro id: 1
console.log(ventaMayor(vacio));                        // null

console.log(ventasPorCiudad(ventas, "Medellín"));      // 356000
console.log(ventasPorCiudad(unaVenta, "Medellín"));    // 84000
console.log(ventasPorCiudad(unaVenta, "Cali"));        // 0
console.log(ventasPorCiudad(vacio, "Medellín"));       // 0

console.log(ticketPromedio(ventas));                   // ≈ 89545.45 (985000 / 11)
console.log(ticketPromedio(unaVenta));                 // 84000
console.log(ticketPromedio(vacio));                    // null
```

#### Resultados esperados

| Función | Arreglo completo | Un solo elemento | Arreglo vacío |
|---|---|---|---|
| `totalVendido` | 985000 | 84000 | 0 |
| `unidadesVendidas` | 21 | 2 | 0 |
| `ventaMayor` | registro `id: 10` | registro `id: 1` | `null` |
| `ventasPorCiudad(…, "Medellín")` | 356000 | 84000 | 0 |
| `ticketPromedio` | ≈ 89545.45 | 84000 | `null` |

#### Caso extra: un solo elemento no válido

Con `[ventas[7]]` (`id: 8`, `cantidad: 0`) se comporta igual que un arreglo vacío, porque la venta se descarta:

- `totalVendido` → `0`
- `unidadesVendidas` → `0`
- `ventasPorCiudad(…, "Cali")` → `0`
- `ventaMayor` → `null`
- `ticketPromedio` → `null`

### 2.3 Tablas de traza de cada función

Para todas las trazas se usan los mismos 3 registros, elegidos a propósito para cubrir los casos importantes:

| Posición | id | ciudad | cantidad | precio | valorVenta | Por qué se eligió |
|---|---|---|---|---|---|---|
| 1 | 4 | `"Medellín "` | 1 | 42000 | 42000 | Ciudad con espacio sobrante |
| 2 | 8 | `"Cali"` | 0 | 42000 | 0 | Cantidad 0, debe descartarse |
| 3 | 5 | `"medellín"` | 3 | 45000 | 135000 | Ciudad en minúscula y el mayor valor |

```javascript
const muestra = [ventas[3], ventas[7], ventas[4]]; // ids 4, 8 y 5
```

#### Traza de `totalVendido(muestra)`

| Paso | venta (id) | cantidad | ¿`cantidad <= 0`? | valorVenta | `total` después |
|---|---|---|---|---|---|
| Inicio | - | - | - | - | 0 |
| 1 | 4 | 1 | No | 42000 | 42000 |
| 2 | 8 | 0 | Sí (`continue`) | no se calcula | 42000 |
| 3 | 5 | 3 | No | 135000 | 177000 |
| Fin | - | - | - | - | **Devuelve 177000** |

#### Traza de `unidadesVendidas(muestra)`

| Paso | venta (id) | cantidad | ¿`cantidad <= 0`? | `totalUnidades` después |
|---|---|---|---|---|
| Inicio | - | - | - | 0 |
| 1 | 4 | 1 | No | 1 |
| 2 | 8 | 0 | Sí (`continue`) | 1 |
| 3 | 5 | 3 | No | 4 |
| Fin | - | - | - | **Devuelve 4** |

#### Traza de `ventaMayor(muestra)`

| Paso | venta (id) | ¿`cantidad <= 0`? | valorActual | ¿`valorActual > valorMayor`? | `valorMayor` después | `registroMayor` después |
|---|---|---|---|---|---|---|
| Inicio | - | - | - | - | -Infinity | `null` |
| 1 | 4 | No | 42000 | Sí (42000 > -Infinity) | 42000 | id 4 |
| 2 | 8 | Sí (`continue`) | no se calcula | no se evalúa | 42000 | id 4 |
| 3 | 5 | No | 135000 | Sí (135000 > 42000) | 135000 | id 5 |
| Fin | - | - | - | - | - | **Devuelve el registro id 5** |

#### Traza de `ticketPromedio(muestra)`

| Paso | venta (id) | ¿`cantidad > 0`? | valorVenta | `total` después | `validas` después |
|---|---|---|---|---|---|
| Inicio | - | - | - | 0 | 0 |
| 1 | 4 | Sí | 42000 | 42000 | 1 |
| 2 | 8 | No | no se calcula | 42000 | 1 |
| 3 | 5 | Sí | 135000 | 177000 | 2 |
| Fin | - | - | - | - | - |

Resultado: `validas === 0` es falso, así que devuelve `177000 / 2` = **88500**.

#### Traza de `ventasPorCiudad(muestra, "Medellín")`

Antes del bucle: `ciudadBuscada = normalizar("Medellín")` = `"medellin"`.

| Paso | venta (id) | ¿`cantidad <= 0`? | `normalizar(venta.ciudad)` | ¿Es igual a `"medellin"`? | `total` después |
|---|---|---|---|---|---|
| Inicio | - | - | - | - | 0 |
| 1 | 4 | No | `"medellin"` (de `"Medellín "`) | Sí | 42000 |
| 2 | 8 | Sí (`continue`) | no se calcula | no se evalúa | 42000 |
| 3 | 5 | No | `"medellin"` (de `"medellín"`) | Sí | 177000 |
| Fin | - | - | - | - | **Devuelve 177000** |

#### Resumen de resultados

| Función | Resultado con la muestra |
|---|---|
| `totalVendido` | 177000 |
| `unidadesVendidas` | 4 |
| `ventaMayor` | registro `id: 5` |
| `ticketPromedio` | 88500 |
| `ventasPorCiudad(…, "Medellín")` | 177000 |

Observación: la venta `id: 8` se descarta en las cinco funciones, y los registros con `"Medellín "` y `"medellín"` se reconocen como la misma ciudad gracias a `normalizar`.

### 2.4 Verificación: traza a mano vs. programa

Se ejecutó el código con la misma muestra usada en las trazas:

```javascript
const muestra = [ventas[3], ventas[7], ventas[4]]; // ids 4, 8 y 5

console.log(totalVendido(muestra));
console.log(unidadesVendidas(muestra));
console.log(ventaMayor(muestra));
console.log(ticketPromedio(muestra));
console.log(ventasPorCiudad(muestra, "Medellín"));
```

Salida del programa:

```text
177000
4
{
  id: 5,
  fecha: '2026-09-03',
  cliente: 'C04',
  producto: 'Origen Sierra 500 g',
  ciudad: 'medellín',
  cantidad: 3,
  precio: 45000
}
88500
177000
```

| Función | Traza a mano | Programa | ¿Coincide? |
|---|---|---|---|
| `totalVendido` | 177000 | 177000 | Sí |
| `unidadesVendidas` | 4 | 4 | Sí |
| `ventaMayor` | registro `id: 5` | registro `id: 5` | Sí |
| `ticketPromedio` | 88500 | 88500 | Sí |
| `ventasPorCiudad(…, "Medellín")` | 177000 | 177000 | Sí |

Conclusión: los cinco resultados calculados a mano con las tablas de traza coinciden con los del programa. Esto confirma que la venta `id: 8` (cantidad 0) se descarta en todas las funciones, y que `normalizar` reconoce `"Medellín "` y `"medellín"` como la misma ciudad que `"Medellín"`.

## Minireto 3: Del ciclo al método: rankings y agrupaciones
### 3.1 Preguntas de la sesión que responde cada función

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `totalVendidoM` | Todas las ventas | Descarto `cantidad <= 0` | Cada venta en su valor (`cantidad * precio`) | La suma de los valores | No agrupo |
| `unidadesVendidasM` | Todas las ventas | Descarto `cantidad <= 0` | Nada: uso `cantidad` directamente | La suma de las cantidades | No agrupo |
| `ventasPorCiudadM` | Todas las ventas | Descarto `cantidad <= 0` y las ventas de otra ciudad | La ciudad a texto normalizado para comparar; cada venta en su valor | La suma de los valores de esa ciudad | No agrupo: busco una sola ciudad |
| `totalPorCiudad` | Todas las ventas | Descarto `cantidad <= 0` | La ciudad a texto normalizado (será la clave); cada venta en su valor | El total de cada ciudad | Objeto con clave = ciudad normalizada |
| `unidadesPorProducto` | Todas las ventas | Descarto `cantidad <= 0` | Nada: la clave es el producto y se suma `cantidad` | Las unidades de cada producto | Objeto con clave = producto |
| `topProductosPorValor` | Todas las ventas | Descarto `cantidad <= 0` | Cada venta en su valor; luego cada pareja `[producto, total]` en `{ producto, total }` | El total de dinero de cada producto | Objeto con clave = producto; después ordeno (sobre una copia) y corto con `slice(0, k)` |

## Minireto 4: Analítica v0.1: el primer reporte
### Errores reportados por la gerente: reproducción y corrección

Se simuló la versión preliminar quitando las correcciones y se comparó con la v0.1 usando las mismas entradas.

```javascript
// Versión preliminar (simulada): sin normalizar y sin protección contra 0/0
function totalPorCiudadPreliminar(ventas) {
    const totales = {};
    for (const venta of ventas) {
        if (venta.cantidad <= 0) continue;
        totales[venta.ciudad] = (totales[venta.ciudad] ?? 0) + valorVenta(venta);
    }
    return totales;
}

function ticketPromedioPreliminar(ventas) {
    let validas = 0;
    let total = 0;
    for (const venta of ventas) {
        if (venta.cantidad > 0) {
            total += valorVenta(venta);
            validas++;
        }
    }
    return total / validas;
}
```

#### Error 1: "Bogotá aparecía dos veces"

| Campo | Detalle |
|---|---|
| **Síntoma** | En el reporte por ciudad, la misma ciudad aparece en dos filas, cada una con un total parcial. |
| **Entrada que lo produce** | Ventas de la misma ciudad escritas distinto: `"Bogotá"` y `"Bogotá "` (espacio final). En `ventas` ocurre con Medellín: `"Medellín"`, `"Medellín "` y `"medellín"`. |
| **Hipótesis** | Las claves del objeto se crean con `venta.ciudad` tal cual, y JavaScript trata `"Bogotá"` y `"Bogotá "` como claves distintas. |
| **Prueba realizada** | Ver el código siguiente. |
| **Causa** | Falta normalizar el nombre de la ciudad (`trim`, minúsculas, sin tildes) antes de usarlo como clave. |
| **Corrección** | `totalPorCiudad` usa `normalizar(venta.ciudad)` como clave. Todas las variantes caen en el mismo grupo. |

```javascript
const bogota = [
    { id: 1, ciudad: "Bogotá",  cantidad: 1, precio: 26000 },
    { id: 2, ciudad: "Bogotá ", cantidad: 2, precio: 26000 },
];

console.log(totalPorCiudadPreliminar(bogota));
// { 'Bogotá': 26000, 'Bogotá ': 52000 }   -> Bogotá dos veces (error reproducido)

console.log(totalPorCiudad(bogota));
// { bogota: 78000 }                       -> un solo grupo

console.log(Object.keys(totalPorCiudadPreliminar(ventas)).length); // 6
console.log(Object.keys(totalPorCiudad(ventas)).length);           // 4
```

**Demostración de que v0.1 ya no lo presenta:** con las 12 ventas, la versión preliminar genera 6 claves, de las cuales tres son Medellín. La v0.1 genera 4 (`medellin`, `bogota`, `cali`, `pereira`) y su suma es 985000, igual que `totalVendido`. Medellín queda en 356000 (en la preliminar estaba partido en 179000 + 42000 + 135000).

#### Error 2: "El ticket promedio daba NaN al filtrar un día sin ventas"

| Campo | Detalle |
|---|---|
| **Síntoma** | Al filtrar un día sin ventas, el ticket promedio muestra `NaN`. |
| **Entrada que lo produce** | `ticketPromedio(ventasDelDia(ventas, "2026-09-30"))`. El filtro devuelve `[]`, así que `total = 0` y `validas = 0`. Pasa igual si el arreglo solo tiene ventas con cantidad 0 (por ejemplo `[ventas[7]]`). |
| **Hipótesis** | Se divide `0 / 0` cuando no hay ventas válidas. |
| **Prueba realizada** | Ver el código siguiente. |
| **Causa** | `0 / 0` es `NaN` en JavaScript. La versión preliminar no comprueba `validas === 0` antes de dividir. Mi versión inicial tampoco lo resolvía bien: la comprobación existía pero devolvía `NaN`, que se propaga y puede llegar a la pantalla. |
| **Corrección** | `ticketPromedio` devuelve `null` cuando `validas === 0` (no hay dato, no es un promedio de 0). La interfaz que use la gerente debe mostrar un texto como "Sin ventas válidas". |

```javascript
const diaSinVentas = ventasDelDia(ventas, "2026-09-30"); // []

console.log(ticketPromedioPreliminar(diaSinVentas));  // NaN  (error reproducido)
console.log(ticketPromedio(diaSinVentas));            // null
console.log(ticketPromedio([ventas[7]]));             // null (solo una venta con cantidad 0)

console.log(ticketPromedio(ventasDelDia(ventas, "2026-09-01"))); // 55000 (84000 + 26000) / 2
console.log(ticketPromedio(ventas) ?? "Sin ventas válidas");     // ≈ 89545.45
```

**Demostración de que v0.1 ya no lo presenta:** `ticketPromedio` devuelve `null` en ambos casos sin datos, nunca `NaN`. Además, con datos válidos el resultado no cambia (el 1 de septiembre sigue dando 55000).

#### Resumen

| Error | Versión preliminar | v0.1 | Prueba |
|---|---|---|---|
| Ciudad duplicada | 6 claves (Medellín repetida tres veces) | 4 claves | `Object.keys(...).length` |
| Ticket promedio de un día sin ventas | `NaN` | `null` | `ticketPromedio(ventasDelDia(ventas, "2026-09-30"))` |

## Minireto 5: ¿Cuánto cuesta cada reporte?
Se ha creado un nuevo archivo `src/medir.js`, en el que se van a medir las operaciones de las funciones `totalVendido`, `ventaMayor`,`totalPorCiudad` y `primeraVenta` (nuevo), para estimar de esa forma su complejidad.
### Predicción antes de medir: si n se multiplica por 10

Regla de conteo: 1 por elemento visitado y 1 por cada comparación.

| Función | Operaciones esperadas | Si n × 10, las operaciones se multiplican por | Complejidad |
|---|---|---|---|
| `totalVendido` | 2n (visita + `cantidad <= 0`) | **× 10** | O(n) |
| `ventaMayor` | entre 2n y 3n (la comparación `valorActual > valorMayor` solo se hace en ventas válidas) | **× 10** | O(n) |
| `totalPorCiudad` | 2n (visita + `cantidad > 0`) | **× 10** | O(n) |
| `primeraVenta` | constante (no recorre el arreglo) | **× 1** | O(1) |

### Resultados de la medición

Conteo de operaciones con datos de `generarVentas(n)` desde `src/medir.js`, usando la regla definida: 1 por elemento visitado y 1 por cada comparación.

| Función | n = 100 | n = 1000 | n = 10000 | n = 100000 | Factor al pasar de n a 10n | Complejidad |
|---|---|---|---|---|---|---|
| `totalVendidoC` | 200 | 2000 | 20000 | 200000 | × 10 | O(n) |
| `ventaMayorC` | 300 | 3000 | 30000 | 300000 | × 10 | O(n) |
| `totalPorCiudadC` | 200 | 2000 | 20000 | 200000 | × 10 | O(n) |
| `primeraVentaC` | 1 | 1 | 1 | 1 | × 1 | O(1) |

Los resultados coinciden con la predicción: las tres funciones que recorren el arreglo se multiplican por 10 cuando n se multiplica por 10, y `primeraVentaC` no cambia.

#### Justificación de la complejidad

**`totalVendidoC`: O(n).**
- **Código:** tiene un único `for...of` que visita cada venta una vez. En cada vuelta se cuentan dos operaciones: la visita y la comparación `cantidad <= 0`. No hay ciclos anidados ni recorridos adicionales.
- **Números:** el conteo es exactamente 2n (200, 2000, 20000, 200000). Al dividir cada fila entre la anterior siempre da 10, así que el trabajo crece en proporción directa a n.

**`totalPorCiudadC`: O(n).**
- **Código:** usa un único `reduce` sobre `ventas`, con la condición `cantidad > 0` dentro del callback (no hay un `filter` previo). `reduce` llama al callback una vez por elemento, y en cada llamada se cuentan dos operaciones: la visita y la comparación. No hay recorridos adicionales ni arreglos intermedios.
- **Números:** el conteo es exactamente 2n (200, 2000, 20000, 200000), igual que `totalVendidoC`. Al pasar de n a 10n el factor es siempre ×10.
- Normalizar la ciudad y acumular en el objeto cuestan lo mismo sin importar el tamaño del arreglo, por eso no cambian el crecimiento.
- Si la condición estuviera en un `filter` encadenado antes del `reduce`, el conteo sería mayor (hasta 3n, porque `filter` recorre todo y `reduce` recorre las válidas), pero seguiría siendo O(n).

**`ventaMayorC`: O(n).**
- **Código:** también tiene un único `for...of`. La diferencia es que las ventas válidas hacen una comparación más (`valorActual > valorMayor`), así que cada una cuesta 3 operaciones: la visita y dos comparaciones.
- **Números:** el conteo es exactamente 3n (300, 3000, 30000, 300000). Es exacto porque `generarVentas` solo crea ventas con `cantidad >= 1`, así que todas son válidas. Con datos que incluyan cantidades en 0, el costo estaría entre 2n y 3n, pero el factor de crecimiento seguiría siendo ×10.
- El 3 es una constante: hace el conteo más grande que el de `totalVendidoC`, pero no cambia que crezca de forma lineal.

**`primeraVentaC`: O(1).**
- **Código:** solo accede a una posición del arreglo (la primera venta) y no tiene ciclo.
- **Números:** da 1 para n = 100 y para n = 100000. Su costo no depende del tamaño de la entrada.

**Por qué las constantes (2 y 3) no cambian la complejidad:** al multiplicar n por 10, `2n` pasa a `20n` y `3n` pasa a `30n`. En ambos casos el factor es ×10. Las constantes cambian el valor absoluto del conteo, no la forma en que crece.

#### Por qué cada función comprueba la cantidad

En `totalVendidoC`, `ventaMayorC` y `totalPorCiudadC` hay una condición sobre `cantidad` (`<= 0` o `> 0`) porque una venta con cantidad 0 o negativa no es una venta real. Es la misma regla en todo el proyecto:

- **Coherencia entre funciones:** si una función cuenta esas ventas y otra no, los resultados dejan de cuadrar (por ejemplo, el total por ciudad no sumaría lo mismo que el total vendido).
- **`totalVendidoC`:** una venta con cantidad 0 aporta 0 al total, pero una cantidad negativa (una devolución) lo reduciría. La condición evita ese efecto.
- **`ventaMayorC`:** sin la condición, si todas las ventas tuvieran cantidad 0, la función devolvería un registro con valor 0 como "venta mayor", en lugar de `null`.
- **`totalPorCiudadC`:** sin la condición, una ciudad cuya única venta tuviera cantidad 0 aparecería en el resultado con total 0, como si hubiera comprado sin generar dinero.

**Costo de la condición:** es una comparación por elemento, y se hace siempre, incluso en las ventas que se descartan. Por eso aparece en el conteo (es el segundo 1 de cada vuelta) y por eso `totalVendidoC` cuesta 2n y no n. Es un costo constante por elemento, así que no cambia la complejidad: sigue siendo O(n).

`primeraVentaC` no hace esta comprobación porque no recorre el arreglo: devuelve la primera posición tal cual.

## Minireto 6: El reporte se volvió lento
### Traza de `clientesRecurrentes` con 5 ventas

Conteo por cada comparación que se realiza entre 5 ventas durante la ejecución el método.

| i \ j *(i + 1)* | 0 (venta1) | 1 (venta2) | 2 (venta3) | 3 (venta4) | 4 (venta5) |
|---|---|---|---|---|---|
| **0 (venta1)** | - | 1 | 2 | **3** | 4 |
| **1 (venta2)** | - | - | 5 | 6 | 7 |
| **2 (venta3)** | - | - | - | 8 | 9 |
| **3 (venta4)** | - | - | - | - | 10 |
| **4 (venta5)** | - | - | - | - | - |

- Cada venta hace `n - 1 - i` comparaciones: 4, 3, 2, 1 y 0.
- **Total:** n(n − 1) / 2 pares = 5 × 4 / 2 = **10** comparaciones `===`. El `includes` se ejecutó una sola vez y examinó 0 elementos, porque `recurrentes` estaba vacío.
- **Por qué es O(n²):** el total crece como n(n − 1) / 2. Con n = 10 serían 45 pares; con n = 100, 4950. Al multiplicar n por 10, el trabajo se multiplica por casi 100.

### Medición de tiempo: `clientesRecurrentes`

| n | Tiempo | Factor al duplicar n |
|---|---|---|
| 1000 | 12.598 ms | - |
| 2000 | 41.352 ms | × 3.3 |
| 4000 | 131.636 ms | × 3.2 |
| 8000 | 651.3 ms | × 4.9 |
| 16000 | 2817 ms | × 4.3 |

Al duplicar n, el tiempo se multiplica aproximadamente por 4, lo que coincide con la complejidad O(n²) obtenida de la traza: el número de pares crece como n(n − 1) / 2, que se multiplica por 4 al duplicar n. Las variaciones respecto a 4 exacto se atribuyen al ruido de la medición (recolector de basura, JIT, otros procesos) y al costo de `includes`, que depende de los datos.

### Predicción del tiempo con más ventas

Como `clientesRecurrentes` es O(n²), el tiempo crece en proporción a n²:

`tiempo(n_nuevo) ≈ tiempo(n_base) × (n_nuevo / n_base)²`

Con la medición de 16000 ventas (2817 ms) como base, se estima:

| n | Tiempo estimado |
|---|---|
| 32000 | ≈ 11 268 ms (≈ 11 s) |
| 64000 | ≈ 45 072 ms (≈ 45 s) |
| 100000 | ≈ 110 039 ms (≈ 1 min 50 s) |

La constante `tiempo / n²` es casi igual en todas las mediciones (≈ 1e-5 ms), lo que respalda el modelo cuadrático. La predicción es una estimación: depende de la máquina, de los datos y se vuelve menos fiable cuanto más se extrapola.   

#### Validación de la predicción

| n | Tiempo estimado | Tiempo medido | Diferencia |
|---|---|---|---|
| 100000 | ≈ 110 039 ms (≈ 1 min 50 s) | 109 188 ms (1:49.188) | ≈ 0.8 % |

El factor de tiempo entre 16000 y 100000 ventas fue ≈ 38.8, muy cercano al esperado por el modelo cuadrático (6.25² ≈ 39.06). La constante `tiempo / n²` se mantuvo en ≈ 1.1e-5 ms, así que el modelo O(n²) predice correctamente el comportamiento de `clientesRecurrentes` en el rango medido.

### Costo oculto: `recurrentes.includes`

`includes` recorre `recurrentes` elemento por elemento hasta encontrar el valor, así que es un recorrido extra dentro de los dos ciclos anidados.

- **Cuándo se ejecuta:** solo si `ventas[i].cliente === ventas[j].cliente`, por el cortocircuito de `&&`. En los pares con clientes distintos no cuesta nada.
- **Cuánto cuesta:** entre 0 y `m` comparaciones, donde `m` es el tamaño de `recurrentes` (clientes distintos con al menos dos ventas, m ≤ n/2). No recorre `ventas`.
- **Mejor caso:** ningún cliente se repite. `includes` nunca se ejecuta y el costo total es O(n²) (solo los pares).
- **Caso típico (`generarVentas`):** unos 1.5n pares iguales, con `recurrentes` de hasta ≈ n/3 elementos. El `includes` aporta del orden de n² comparaciones, y el total sigue siendo O(n²). Es coherente con las mediciones de tiempo, donde el factor al duplicar n osciló entre 3.2 y 4.9.
- **Peor caso:** `recurrentes` ya tiene del orden de n elementos y además hay del orden de n² pares con el mismo cliente (por ejemplo, m = n/4 clientes que aparecen dos veces, y después una segunda mitad del arreglo con un único cliente repetido). Cada uno de esos pares ejecuta un `includes` de ≈ n/4 comparaciones, lo que da ≈ n³/32 y, en términos de complejidad, **O(n³)**.

### Conclusión para la gerente: por qué el reporte se vuelve lento

El reporte de clientes que repiten compra es rápido con pocas ventas, pero se vuelve muy lento a medida que el negocio crece. La razón es la forma en que revisa los datos: para saber si un cliente compró más de una vez, compara cada venta con todas las demás. Es como revisar una lista de pedidos tomando el primero y buscándolo en todo el resto, luego el segundo, y así sucesivamente.

Esto significa que el trabajo no crece al mismo ritmo que las ventas, sino mucho más rápido. **Si las ventas se duplican, el reporte tarda cuatro veces más.** Lo comprobamos midiendo:

| Cantidad de ventas | Tiempo del reporte |
|---|---|
| 1.000 | menos de 1 segundo (0,01 s) |
| 16.000 | cerca de 3 segundos |
| 100.000 | casi 2 minutos |

Con base en ese comportamiento, se puede estimar que con un millón de ventas el reporte tardaría alrededor de 3 horas, lo que lo haría inutilizable. Esa cifra es solo una aproximación, no una medición.

Además, cuando el reporte encuentra un cliente repetido, revisa su lista de clientes ya encontrados para no anotarlo dos veces. Con muchos clientes recurrentes, esa revisión adicional también suma tiempo.

## Minireto 7: Tiempo, memoria y cadenas de métodos
### Recorridos y arreglos nuevos: `totalCiudadCadena` vs `totalCiudadUnaPasada`

| | `totalCiudadCadena` | `totalCiudadUnaPasada` |
|---|---|---|
| Recorridos | 4: `map` (n), `filter` (n), `map` (k), `reduce` (k) | 1: el `for...of` (n) |
| Arreglos nuevos | 3: el de cada `map` y el del `filter` (el `reduce` devuelve un número) | 0 |
| Otros objetos nuevos | n copias de cada venta, por el spread `{ ...venta }` | ninguno |
| Visitas en el peor caso (k = n) | 4n | n |
| **Tiempo** | **O(n)** | **O(n)** |
| **Espacio adicional** | **O(n)** | **O(1)** |

Aquí k es la cantidad de ventas de la ciudad buscada (k ≤ n).

**Espacio de `totalCiudadCadena`:** el primer `map` crea un arreglo de n elementos y además n objetos nuevos (las copias). El `filter` crea un arreglo de k referencias y el segundo `map` uno de k números. En total el espacio crece en proporción a n, así que es O(n).

**Espacio de `totalCiudadUnaPasada`:** solo usa `objetivo` y `total`, dos variables que no dependen de n. `normalizar` crea textos temporales cortos en cada vuelta, pero se descartan al terminar la vuelta y su tamaño no depende de n. Es O(1).

### Por qué ambas son O(n) en tiempo

Al sumar los recorridos de `totalCiudadCadena`, el trabajo es n + n + k + k, que como máximo es 4n. En notación Big O se eliminan las constantes multiplicativas, porque no cambian cómo crece el trabajo: 4n se simplifica a n, igual que el n de la versión de una pasada.

Con los números: si n se multiplica por 10, `4n` pasa a `40n` y `n` pasa a `10n`. En ambas el trabajo se multiplica por 10. La versión en cadena hace hasta 4 veces más visitas, y eso puede notarse en el tiempo real, pero no cambia la forma de crecer. Big O describe el crecimiento y no el tiempo exacto.

La diferencia real entre las dos está en el espacio: O(n) frente a O(1).

### Complejidad espacial de las funciones del motor

El espacio se refiere a la memoria adicional que usa la función, sin contar los datos de entrada.

| Función | Guarda | Espacio |
|---|---|---|
| `valorVenta` | un número | O(1) |
| `normalizar` | un texto temporal del tamaño de un nombre de ciudad | O(1) |
| `totalVendido` | un acumulador | O(1) |
| `unidadesVendidas` | un acumulador | O(1) |
| `ventasPorCiudad` | un acumulador y la ciudad normalizada | O(1) |
| `ventaMayor` | dos variables (una referencia a una venta que ya existe, no una copia) | O(1) |
| `ticketPromedio` | dos acumuladores | O(1) |
| `totalVendidoM` | un arreglo nuevo con las ventas válidas (`filter`) | O(n) |
| `unidadesVendidasM` | un arreglo nuevo con las ventas válidas (`filter`) | O(n) |
| `ventasPorCiudadM` | un arreglo nuevo con las ventas válidas (`filter`) | O(n) |
| `primeraVenta` | nada adicional, solo accede a una posición | O(1) |
| `totalCiudadUnaPasada` | dos variables (`objetivo` y `total`) | O(1) |
| `totalPorCiudad` | un valor por ciudad distinta | O(ciudades) |
| `unidadesPorProducto` | un valor por producto distinto | O(productos) |
| `topProductosPorValor` | uno por producto + `Object.entries` | O(productos) |
| `ventasDelDia` | un arreglo con las ventas de ese día (`filter`) | O(ventas del día) |
| `clientesRecurrentes` | el arreglo `recurrentes` con los clientes repetidos | O(clientes repetidos) |
| `totalCiudadCadena` | tres arreglos nuevos + n copias de venta | O(n) |

Con c = ciudades distintas, p = productos distintos y d = ventas del día, todos ≤ n.

#### `totalPorCiudad`

Usa memoria adicional proporcional a la cantidad de **grupos**, no a la cantidad de ventas. Si las ventas pasan de 12 a 1 000 000 pero siguen siendo 4 ciudades, el objeto sigue teniendo 4 claves. Por eso en la práctica el espacio casi no crece con n.

Formalmente no es O(1), porque el número de claves depende de los datos: en el peor caso, cada venta es de una ciudad distinta, c = n y el espacio es O(n). Por eso se escribe **O(c)**, con c ≤ n.

`normalizar` también influye en la memoria: sin normalizar, `"Bogotá"` y `"Bogotá "` crearían dos claves, es decir, más grupos y más memoria (el error que reportó la gerente).

#### `topProductosPorValor`

Aunque devuelve solo k productos, la memoria que usa **no depende de k** sino de p. Antes de cortar con `slice(0, k)`, la función guarda:

- el objeto con el total de cada producto (p claves),
- el arreglo de parejas de `Object.entries` (p elementos),
- el arreglo de objetos `{ producto, total }` del `map` (p elementos),
- y el `sort` puede usar espacio auxiliar de orden p.

Son varias estructuras de tamaño p, pero siguen siendo un múltiplo constante de p, así que el espacio es **O(p)**, no O(k). El arreglo `ventas` original no se toca porque `sort` opera sobre el arreglo que creó `map`. Si hubiera que copiar con `[...arreglo].sort(...)`, se sumaría otra copia O(p) y la clase seguiría siendo O(p).

#### Resumen

- **Memoria adicional constante, O(1):** `valorVenta`, `normalizar`, `totalVendido`, `unidadesVendidas`, `ventasPorCiudad`, `ventaMayor`, `ticketPromedio`, `primeraVenta` y `totalCiudadUnaPasada`.
- **Memoria proporcional a los datos:** `totalVendidoM`, `unidadesVendidasM` y `ventasPorCiudadM` (O(n), por el arreglo que crea `filter`), `totalPorCiudad` (O(ciudades)), `unidadesPorProducto` (O(productos)), `topProductosPorValor` (O(productos)), `ventasDelDia` (O(ventas del día)), `clientesRecurrentes` (O(clientes repetidos)) y `totalCiudadCadena` (O(n)).
- **Idea clave:** cada vez que una función crea un arreglo u objeto cuyo tamaño depende de los datos (con `filter`, `map`, `Object.entries` o un objeto de grupos), deja de ser O(1) en espacio.

### Decisión: versión de `totalCiudad` que queda en el motor

**Se elige `totalCiudadUnaPasada`.**

| Criterio | `totalCiudadCadena` | `totalCiudadUnaPasada` |
|---|---|---|
| Tiempo | O(n), hasta 4n visitas | O(n), n visitas |
| Espacio adicional | O(n): tres arreglos y n copias de venta | O(1): dos variables |
| Legibilidad | Cada etapa tiene un nombre (normalizar, filtrar, valorar, sumar) | Un solo ciclo con una condición y una suma |

**Justificación**

- **Recursos:** ambas son O(n) en tiempo, pero la de una pasada hace una cuarta parte de las visitas en el peor caso y no crea arreglos ni copias. Con datos grandes, esa diferencia se nota en memoria y en tiempo real, aunque no en la notación Big O. En espacio la diferencia sí es de clase: O(n) frente a O(1).
- **Legibilidad:** la versión en cadena se lee por etapas, y eso es una ventaja real cuando cada etapa hace algo distinto. Aquí no es el caso: la cadena copia cada venta (`{ ...venta }`) solo para normalizar la ciudad, y esa copia no se necesita porque basta comparar `normalizar(venta.ciudad)` dentro del ciclo. El ciclo es más corto y su lógica es directa, así que la ganancia de legibilidad de la cadena es pequeña.
- **Costo de elegirla:** hay que leer el cuerpo del ciclo para saber qué hace, mientras que en la cadena cada método describe su paso. Con una función tan corta, ese costo es bajo.

**Conclusión:** como la legibilidad es parecida y los recursos son claramente mejores, se deja `totalCiudadUnaPasada`. `totalCiudadCadena` se conserva solo como ejemplo en la bitácora para comparar.

#### Observación: funciones equivalentes en el motor

`totalCiudadUnaPasada` hace lo mismo que `ventasPorCiudad`: recorre las ventas una sola vez, normaliza la ciudad para comparar y suma el valor de las ventas válidas. Ambas tienen complejidad O(n) en tiempo y O(1) en espacio, y devuelven el mismo resultado para cualquier entrada.

Por ahora se conservan las dos porque `totalCiudadCadena` y `totalCiudadUnaPasada` son parte del entregable de este avance (comparación de recursos entre dos versiones de `totalCiudad`). Mantener dos funciones equivalentes tiene un costo de mantenimiento: si cambia la regla de ventas válidas, hay que modificar ambas.

## Minireto 9: Clientes recurrentes en tiempo real
### Resolución del problema usando el método de 6 pasos

#### 1. Entender

Se necesita buscar en el arreglo de ventas los id de clientes que aparecen al menos dos veces, y devolver una lista de strings con esos clientes "recurrentes". La búsqueda debe ser rápida: con 100.000 ventas debe tardar menos de 1 segundo.

- **Entrada:** `ventas`, un arreglo de objetos con (al menos) el campo `cliente`, por ejemplo `"C01"`.
- **Salida:** un arreglo de strings con los clientes que tienen 2 o más ventas.
  - Cada cliente aparece una sola vez, aunque tenga muchas ventas.
  - El orden es el de su primera aparición en `ventas`, igual que en la versión actual.
  - Si no hay ventas o ningún cliente repite, devuelve `[]`.
- **Restricciones:**
  - Si `ventas` es un arreglo vacío, `undefined` o `null`, devuelve `[]`.
  - No modifica `ventas`.
  - Complejidad objetivo: O(n) en tiempo.

#### 2. Ejemplos

| # | Entrada (clientes de cada venta) | Salida esperada | Qué prueba |
|---|---|---|---|
| 1 | `[]` | `[]` | Arreglo vacío |
| 2 | `undefined` y `null` | `[]` | Entrada inválida |
| 3 | `C01` | `[]` | Una sola venta |
| 4 | `C01, C02, C03` | `[]` | Nadie repite |
| 5 | `C01, C02, C01` | `["C01"]` | Un cliente repite |
| 6 | `C01, C01, C01` | `["C01"]` | Un cliente con 3 ventas aparece una sola vez |
| 7 | `C01, C02, C02, C01` | `["C01", "C02"]` | Orden de primera aparición (C01 aparece antes, aunque C02 completa su pareja primero) |
| 8 | `C01, C02, C03, C01, C04` (ids 1 a 5 de `ventas`) | `["C01"]` | Coincide con la traza de la bitácora |
| 9 | Las 12 ventas de `ventas` | `["C01", "C02", "C03"]` | Caso completo |

Cálculo a mano del ejemplo 9: C01 aparece 3 veces (ids 1, 4 y 11), C02 aparece 2 veces (ids 2 y 7), C03 aparece 2 veces (ids 3 y 9), y C04 a C08 aparecen una sola vez. Los recurrentes, en orden de primera aparición, son C01, C02 y C03.

#### 3. Fuerza bruta

Comparar cada venta con todas las siguientes. Si los clientes coinciden y todavía no está en la lista de recurrentes, se agrega.

```text
para i de 0 a n - 1:
    para j de i + 1 a n - 1:
        si ventas[i].cliente = ventas[j].cliente
           y recurrentes no contiene ventas[i].cliente:
            agregar ventas[i].cliente a recurrentes
devolver recurrentes
```

- **Tiempo:** n(n − 1) / 2 pares, es decir, **O(n²)**. Además, `includes` recorre `recurrentes` en cada coincidencia, así que en el peor caso llega a O(n³).
- **Espacio:** O(m), con m = clientes repetidos.
- **Evidencia:** 304,7 ms con 10.000 ventas, y casi 2 minutos con 100.000. No cumple el requisito de menos de 1 segundo.

#### 4. Optimizar

**Trabajo repetido:**
- Cada venta se compara con todas las siguientes, aunque su cliente ya se haya revisado muchas veces.
- `includes` vuelve a recorrer la lista de recurrentes en cada coincidencia, para una pregunta que ya se respondió.

**Información que se puede guardar para no buscarla de nuevo:** cuántas veces apareció cada cliente. Con un objeto usado como diccionario (clave = cliente, valor = cantidad de ventas), contar un cliente es una consulta directa, sin comparar con las demás ventas.

**Estrategia elegida:** dos pasadas.
1. Recorrer `ventas` una vez y contar las ventas de cada cliente.
2. Recorrer el diccionario y quedarse con los clientes cuyo conteo sea 2 o más.

```text
función clientesRecurrentes(ventas):
    si ventas no es un arreglo:
        devolver lista vacía

    vistos ← conjunto vacío
    recurrentes ← conjunto vacío
    para cada venta en ventas:
        si vistos contiene venta.cliente:
            agregar venta.cliente a recurrentes
        si no:
            agregar venta.cliente a vistos

    devolver recurrentes como lista
```

Con un arreglo vacío, los dos ciclos no se ejecutan y la función devuelve la lista vacía sin necesitar una comprobación aparte.

- **Tiempo:** primera pasada n, segunda pasada c (clientes distintos, c ≤ n). Total n + c, que se simplifica a **O(n)**.
- **Espacio:** el diccionario tiene una clave por cliente distinto: **O(c)**. Es más que el O(m) de la versión actual, a cambio de pasar de O(n²) a O(n).

**Alternativas descartadas:**
- *Contar y agregar a `recurrentes` en la misma pasada, cuando el conteo llega a 2.* También es O(n), pero el orden cambia: en el ejemplo 7 devolvería `["C02", "C01"]`, porque C02 completa su pareja antes. Con las dos pasadas, el orden coincide con la versión actual y se puede comparar con `verificar.js`.
- *Ordenar las ventas por cliente y mirar los vecinos.* Es O(n log n), más lento que contar, y además hay que copiar el arreglo para no modificar el original.

#### 5. Implementar

```javascript
function clientesRecurrentesSet(ventas) {
    if (!Array.isArray(ventas)) return [];

    const vistos = new Set();
    const recurrentes = new Set();
    for (const v of ventas) {
        if (vistos.has(v.cliente)) recurrentes.add(v.cliente);
        else vistos.add(v.cliente);
    }
    return [...recurrentes];
}
```

- **Estrategia:** en lugar de comparar cada venta con todas las demás, se guarda en `vistos` cada cliente que ya apareció. Si un cliente llega y ya está en `vistos`, es recurrente y se agrega a `recurrentes`.
- **Por qué es O(n):** un solo ciclo, y `has` y `add` de un `Set` cuestan O(1) en promedio. El `Set` `recurrentes` ignora los repetidos, así que ya no hace falta `includes`.
- **Espacio:** O(c), con c = clientes distintos.
- **Entrada inválida:** si `ventas` no es un arreglo devuelve `[]`. Con un arreglo vacío devuelve `[]` sin comprobación aparte.
- **Orden de salida:** un cliente se agrega cuando aparece por segunda vez, así que el orden puede diferir del de la versión O(n²). El contenido es el mismo.

#### 6. Probar

**Ejemplos y casos borde** (versión `clientesRecurrentesSet`, ejecutados con `src/verificar.js`, comparando los resultados ordenados):

| # | Entrada | Esperado | Obtenido | Resultado |
|---|---|---|---|---|
| 1 | `[]` | `[]` | `[]` | OK |
| 2a | `undefined` | `[]` | `[]` | OK |
| 2b | `null` | `[]` | `[]` | OK |
| 3 | `C01` | `[]` | `[]` | OK |
| 4 | `C01, C02, C03` | `[]` | `[]` | OK |
| 5 | `C01, C02, C01` | `["C01"]` | `["C01"]` | OK |
| 6 | `C01, C01, C01` | `["C01"]` | `["C01"]` | OK |
| 7 | `C01, C02, C02, C01` | `["C02", "C01"]` | `["C02", "C01"]` | OK |
| 8 | Ids 1 a 5 de `ventas` | `["C01"]` | `["C01"]` | OK |
| 9 | Las 12 ventas | `["C01", "C02", "C03"]` | `["C01", "C02", "C03"]` | OK |

El arreglo `ventas` no se modificó después de llamar a la función.

**Sobre el orden:** el caso 7 muestra que `Set` agrega un cliente a `recurrentes` cuando aparece por segunda vez: C02 completa su pareja antes que C01, así que sale primero. La versión original devuelve `["C01", "C02"]` (orden de primera aparición). Ambas contienen los mismos clientes, por eso las comparaciones entre versiones se hacen con los resultados ordenados.

**Comparación con las otras versiones** (ejecutada con `src/verificar.js`, comparando los resultados ordenados):

| Entrada | Original | Set | Map | Mismos clientes | Mismo orden que la original |
|---|---|---|---|---|---|
| 12 ventas (Día 1) | 3 | 3 | 3 | OK | Set: sí, Map: sí |
| Arreglo vacío | 0 | 0 | 0 | OK | Set: sí, Map: sí |
| Una venta | 0 | 0 | 0 | OK | Set: sí, Map: sí |
| 5.000 ventas, intento 1 | 1.348 | 1.348 | 1.348 | OK | Set: no, Map: sí |
| 5.000 ventas, intento 2 | 1.344 | 1.344 | 1.344 | OK | Set: no, Map: sí |
| 5.000 ventas, intento 3 | 1.345 | 1.345 | 1.345 | OK | Set: no, Map: sí |
| 5.000 ventas, intento 4 | 1.338 | 1.338 | 1.338 | OK | Set: no, Map: sí |
| 5.000 ventas, intento 5 | 1.319 | 1.319 | 1.319 | OK | Set: no, Map: sí |

Con los datos del Día 1 y con cinco arreglos distintos de 5.000 ventas generadas, las tres versiones devuelven los mismos clientes, sin duplicados. La cantidad de clientes recurrentes cambia entre intentos porque `generarVentas` usa azar, pero es igual en las tres columnas de cada fila.

`Map` conserva el orden de primera aparición, igual que la original, porque guarda los clientes en el orden en que los ve. `Set` agrega cada cliente cuando aparece por segunda vez, y con datos aleatorios eso cambia el orden casi siempre. Este orden es irrelevante para el reporte de la gerente, que solo necesita saber quiénes son los clientes recurrentes.

#### Decisión: número de versiones a comparar

La consigna menciona tres versiones (original, `Set` y `Map`), mientras que el video del avance menciona dos (original y `Set`). Como la consigna escrita no define una versión `Map` de `clientesRecurrentes`, se interpretó como la lista de los clientes con 2 o más compras en el `Map` que devuelve `comprasPorCliente` (`clientesRecurrentesMap`).

Se verificaron las tres versiones. La comparación entre la original y `Set` es la que piden las dos fuentes; la de `Map` es adicional. (Pendiente de confirmar con el docente.)

### Medición de las tres versiones de `clientesRecurrentes`

Datos: `generarVentas(n)`, el mismo arreglo para las tres versiones en cada tamaño. Tiempos medidos con `console.time`, en el mismo equipo, con una llamada de calentamiento sin cronometrar. Valores en milisegundos. Cada valor es una sola llamada, sin mediana.

**Predicción (antes de medir):** la original es O(n²), así que al multiplicar n por 10 el tiempo debería multiplicarse por ≈ 100. `Set` y `Map` son O(n): por ≈ 10.

| n | Original (ms) | Set (ms) | Map (ms) |
|---|---|---|---|
| 1.000 | 10,805 | 0,177 | 0,226 |
| 10.000 | 857,623 | 1,06 | 1,433 |
| 100.000 | no medido | 17,215 | 17,04 |

| Al pasar de | Original | Set | Map |
|---|---|---|---|
| 1.000 a 10.000 | × 79,4 | × 6,0 | × 6,3 |
| 10.000 a 100.000 | - | × 16,2 | × 11,9 |

#### Intercambio entre tiempo y memoria de la nueva solución

La nueva solución gasta más memoria para ahorrar mucho tiempo.

La versión original no guarda nada sobre los clientes que ya revisó. Por eso, para cada venta tiene que volver a compararla con todas las siguientes, y ahí está el O(n²). La versión con `Set` hace lo contrario: guarda en `vistos` cada cliente que ya apareció, de modo que decidir si un cliente repite es una consulta directa. La información que antes se recalculaba ahora se recuerda.

| | Original | `Set` | `Map` |
|---|---|---|---|
| **Tiempo** | O(n²) | O(n) | O(n) |
| **Memoria adicional** | O(m) | O(c) | O(c) |
| **Qué guarda** | La lista de recurrentes | `vistos` y `recurrentes` | El conteo de cada cliente y la lista de recurrentes |
| **Tiempo medido con 10.000 ventas** | 857,6 ms | 1,06 ms | 1,43 ms |

Aquí c es el número de clientes distintos y m el de clientes recurrentes (m ≤ c ≤ n).

**Qué se paga:** la memoria pasa de O(m) a O(c). `vistos` guarda cada cliente distinto, aunque nunca llegue a repetir. Con `generarVentas`, el número de clientes ronda n/3, así que con 100.000 ventas son unas 30.000 entradas en `vistos`. Es una cantidad pequeña para un equipo actual. Este dato sale del análisis, no de una medición de memoria.

**Qué se gana:** el tiempo pasa de crecer con el cuadrado de n a crecer en línea. Con 10.000 ventas, `Set` es unas 800 veces más rápida que la original. Con 100.000 ventas, `Set` tardó 17,2 ms, cuando la original tardaría del orden de 86 segundos (estimación, no medida).

## Minireto 10: Combos de regalo y frecuencias
### Combos de regalo: `comboRegalo`

#### Catálogo

El catálogo se representa como un arreglo de 8 objetos `{ producto, precio }` en `src/catalogo.js`.

#### Fuerza bruta: `comboRegaloFuerzaBruta`

Prueba todos los pares de productos (`i < j`) y devuelve el primero cuya suma de precios es igual al valor.

- **Tiempo:** O(n²). En el peor caso (no hay combinación) revisa n(n − 1) / 2 pares: con 8 productos, 28.
- **Espacio:** O(1). Solo usa los índices `i` y `j`.
- Con 87.000 encuentra la combinación tras revisar 8 pares: los 7 del primer producto y luego (Huila 500 g, Sierra 500 g).

#### Versión optimizada: `comboRegalo`

**Idea:** el producto con precio `p` necesita un complemento de precio `valor − p`. En lugar de buscarlo recorriendo el catálogo, se guarda en un `Map` (precio → producto) cada producto ya visto. Para cada producto se pregunta si su complemento ya apareció.

- **Tiempo:** O(n). Un solo recorrido; `has`, `get` y `set` del `Map` cuestan O(1) en promedio.
- **Espacio:** O(n). El `Map` guarda hasta n − 1 productos.
- **Distintos:** la consulta se hace antes de guardar el producto, así que un producto no se empareja consigo mismo.
- **Intercambio:** igual que en `clientesRecurrentes`, se gasta memoria (el `Map`) para eliminar el segundo ciclo.

| | Fuerza bruta | Optimizada |
|---|---|---|
| Tiempo | O(n²) | O(n) |
| Espacio | O(1) | O(n) |
| Pares o productos revisados para 87.000 | 8 pares | 3 productos |
| Revisados sin solución (n = 8) | 28 pares | 8 productos |

#### Pruebas

| Valor | Resultado esperado | Fuerza bruta | Optimizada | Resultado |
|---|---|---|---|---|
| 87.000 | Huila 500 g + Sierra 500 g | Huila 500 g + Sierra 500 g | Huila 500 g + Sierra 500 g | OK |
| 61.000 | Nariño 250 g + Taza de cerámica | Nariño 250 g + Taza de cerámica | Nariño 250 g + Taza de cerámica | OK |
| 100.000 | `null` (ningún par suma ese valor) | `null` | `null` | OK |
| 84.000 | `null` (solo se lograría repitiendo el Huila 500 g) | `null` | `null` | OK |
| 121.000 | Varias soluciones válidas | Nariño 250 g + Prensa francesa | Huila 500 g + Huila 1 kg | OK |
| Catálogo vacío | `null` | - | `null` | OK |
| `undefined` | `null` | - | `null` | OK |

Con 121.000 hay dos combinaciones válidas (Nariño 250 g + Prensa francesa, y Huila 500 g + Huila 1 kg). Cada versión devuelve la primera que encuentra con su propio orden de búsqueda: la fuerza bruta prueba pares en orden y encuentra primero el del Nariño 250 g, y la optimizada llega al Huila 1 kg y encuentra su complemento (el Huila 500 g) ya visto. Ambos pares suman 121.000, y por eso la prueba valida la suma y no que el par sea idéntico.

Con 87.000 y con 61.000, que solo tienen una combinación, las dos versiones devuelven el mismo par.

#### Traza de `comboRegalo(catalogo, 87000)`

| Paso | Producto `p` | Precio | `falta = 87000 − precio` | ¿`vistos` tiene `falta`? | `vistos` después |
|---|---|---|---|---|---|
| Inicio | - | - | - | - | vacío |
| 1 | Origen Nariño 250 g | 26.000 | 61.000 | No | 26.000 → Nariño 250 g |
| 2 | Origen Huila 500 g | 42.000 | 45.000 | No | 26.000, 42.000 → Huila 500 g |
| 3 | Origen Sierra 500 g | 45.000 | 42.000 | **Sí** | no se agrega: la función termina |
| Fin | - | - | - | - | **Devuelve `[Origen Huila 500 g, Origen Sierra 500 g]`** |

La función recorre el catálogo una sola vez y se detiene en el tercer producto. Los 5 productos restantes ni se visitan.

### `productoEstrellaPorCiudad`

**Qué hace:** devuelve, para cada ciudad, el producto que más veces aparece en sus ventas, junto con ese número de apariciones.

**Decisiones:**
- Se cuentan **apariciones** (cada venta suma 1), no unidades. Es lo que pide la consigna.
- Se descartan las ventas con `cantidad <= 0`, igual que en el resto del motor. Una ciudad cuyas únicas ventas tienen cantidad 0 no aparece en el resultado.
- Las ciudades se normalizan (`normalizar`), así que `"Bogotá"`, `"Bogotá "` y `"bogota"` son la misma.
- **Regla de desempate:** si dos productos tienen la misma cantidad de apariciones en una ciudad, gana el que **apareció primero en las ventas de esa ciudad**. Se logra porque el `Map` conserva el orden de inserción y la comparación es `>` estricto. Con los datos del Día 1, esta regla decide Cali (Prensa francesa frente a Origen Sierra 500 g, ambas con 1 aparición).
- Entrada inválida (`undefined`) o arreglo vacío: devuelve `{}`.

**Estrategia:** conteo de frecuencias con un `Map` por ciudad (ciudad → Map(producto → veces)), y luego una búsqueda del máximo dentro de cada `Map`.

**Preguntas de la sesión:**

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `productoEstrellaPorCiudad` | Todas las ventas; después los `Map` de cada ciudad | Descarto `cantidad <= 0` | La ciudad a texto normalizado | Las apariciones de cada producto, y el máximo de cada ciudad | `Map` por ciudad, con otro `Map` por producto |

**Complejidad:**
- **Tiempo O(n):** el primer ciclo visita cada venta una vez, y `has`, `get` y `set` del `Map` cuestan O(1) en promedio. El segundo ciclo recorre las entradas de todos los `Map`, que en total son como máximo n (una por cada par ciudad-producto distinto). Total: n + n, que se simplifica a O(n).
- **Espacio O(k):** k es el número de pares (ciudad, producto) distintos, con k ≤ n. En la práctica es pequeño: con 4 ciudades y 8 productos, como máximo 32 entradas. El resultado ocupa O(c), una entrada por ciudad.

**Pruebas:**

| # | Caso | Resultado |
|---|---|---|
| 1 | Arreglo vacío | OK |
| 2 | `undefined` | OK |
| 3 | Datos del Día 1 | OK |
| 4 | Empate simple | OK |
| 5 | Empate: gana el primero en aparecer | OK |
| 6 | Ciudades normalizadas | OK |
| 7 | Solo ventas con cantidad 0 | OK |
| - | `ventas` sin modificar | OK |

### `primerClienteUnico`

**Qué hace:** devuelve el primer cliente, en el orden de las ventas, que aparece una sola vez en todo el historial. Es el destinatario del cupón de regreso.

**Decisiones:**
- Se descartan las ventas con `cantidad <= 0`: una venta sin unidades no es una compra. Un cliente con una venta válida y otra de cantidad 0 cuenta como cliente de una sola compra.
- Devuelve el id del cliente, o `null` si ningún cliente tiene una sola compra, o si `ventas` está vacío o no es un arreglo.

**Estrategia:** dos recorridos y un `Map`. En el primero se cuentan las compras de cada cliente. En el segundo se recorren las ventas en orden y se devuelve el primer cliente cuyo conteo sea 1. Hacen falta dos recorridos porque, al ver un cliente por primera vez, aún no se sabe si volverá a aparecer.

**Preguntas de la sesión:**

| Función | ¿Qué recorro? | ¿Qué filtro? | ¿Qué transformo? | ¿Qué acumulo? | ¿Cómo agrupo? |
|---|---|---|---|---|---|
| `primerClienteUnico` | Todas las ventas, dos veces | Descarto `cantidad <= 0` en ambos recorridos | Nada: la clave es el cliente | Las compras de cada cliente | `Map` con clave = cliente |

**Complejidad:**
- **Tiempo O(n):** el primer recorrido visita las n ventas; el segundo, como máximo n más, y `get` y `set` del `Map` cuestan O(1) en promedio. Total: n + n, que se simplifica a O(n). El segundo recorrido se detiene en el primer cliente único, así que normalmente termina antes.
- **Espacio O(c):** el `Map` guarda una entrada por cliente distinto, c ≤ n.
- **Alternativa de fuerza bruta (no implementada):** para cada venta, contar cuántas veces aparece su cliente en todo el arreglo sería O(n²). El `Map` evita volver a recorrer las ventas cada vez, a cambio de O(c) de memoria.

**Traza con los datos del Día 1:**

Recorrido 1 (conteo): al terminar, `conteo` = C01 → 3, C02 → 2, C03 → 2, C04 → 1, C05 → 1, C07 → 1, C08 → 1. La venta `id: 8` (C06) se descarta por tener cantidad 0.

| Paso | Venta (id) | Cliente | `conteo.get(cliente)` | ¿Es 1? |
|---|---|---|---|---|
| 1 | 1 | C01 | 3 | No |
| 2 | 2 | C02 | 2 | No |
| 3 | 3 | C03 | 2 | No |
| 4 | 4 | C01 | 3 | No |
| 5 | 5 | C04 | 1 | **Sí: devuelve `"C04"`** |

**Pruebas**

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Arreglo vacío | `null` | OK |
| 2 | `undefined` | `null` | OK |
| 3 | Datos del Día 1 | `"C04"` | OK |
| 4 | Nadie es único | `null` | OK |
| 5 | Todos únicos | `"C01"` | OK |
| 6 | Repetidos antes del único | `"C02"` | OK |
| 7 | El único es la última venta | `"C02"` | OK |
| 8 | Cantidad 0 no cuenta como compra | `"C01"` | OK |
| 9 | Solo ventas con cantidad 0 | `null` | OK |
| - | `ventas` sin modificar | - | OK |

### Clasificación de complejidad: combos y frecuencias

| Función | Tiempo | Espacio | Justificación (basada en el código) |
|---|---|---|---|
| `comboRegalo` | O(n) | O(n) | Un solo `for...of` sobre el catálogo. En cada vuelta, `has`, `get` y `set` del `Map` cuestan O(1) en promedio, así que cada producto cuesta una cantidad fija de trabajo. El `Map` guarda hasta n − 1 productos. |
| `productoEstrellaPorCiudad` | O(n) | O(k) | El primer ciclo visita cada venta una vez, con operaciones de `Map` de O(1). El segundo recorre las entradas de todos los `Map`, que en total son como máximo n. Total n + n = O(n). El espacio es k, el número de pares (ciudad, producto) distintos, con k ≤ n. |
| `primerClienteUnico` | O(n) | O(c) | Dos recorridos secuenciales de las ventas (no anidados): n + n = O(n). El `Map` guarda un conteo por cliente distinto (c ≤ n). El segundo recorrido se detiene en el primer cliente único. |

**Por qué las tres son O(n):**
- Ninguna tiene ciclos anidados que dependan de n. Los ciclos que aparecen se ejecutan uno después de otro, y sumar recorridos (n + n) no cambia la clase: las constantes se eliminan.
- La búsqueda de un dato ya visto, que en la fuerza bruta exigía recorrer de nuevo los datos (el complemento, el conteo de un cliente), se resuelve con una consulta directa al `Map`.
- Las operaciones de `Map` son O(1) en promedio, no en el peor caso (por colisiones de la tabla hash). Con las cantidades de este proyecto el promedio es lo que importa.

**Comparación con la solución directa:**

| Función | Solución directa | Con `Map` | Qué se paga |
|---|---|---|---|
| `comboRegalo` | O(n²) tiempo, O(1) espacio (`comboRegaloFuerzaBruta`) | O(n) tiempo, O(n) espacio | Memoria para el `Map` |
| `primerClienteUnico` | O(n²): contar las apariciones de cada cliente recorriendo todas las ventas (no implementada) | O(n) tiempo, O(c) espacio | Memoria para el `Map` |

**Evidencia:** la traza de `comboRegalo` con 87.000 muestra que recorre el catálogo una sola vez y se detiene en el tercer producto (8 pares en la fuerza bruta frente a 3 productos). Sin solución recorre los 8 productos, frente a los 28 pares de la fuerza bruta. En `primerClienteUnico`, la traza del Día 1 llega a C04 en la quinta venta, tras un primer recorrido completo.

## Minireto 11: La mejor racha y el presupuesto exacto

### Mejor semana: fuerza bruta y ventana deslizante

**Datos:** totales diarios de septiembre (30 días, en miles de pesos), `ventasDiarias` en `src/datos.js`.

**Decisiones:**
- Ambas funciones devuelven `{ inicio, total }`, con `inicio` como índice (el día de septiembre es `inicio + 1`).
- Si `dias` no es un arreglo, o `k` es menor que 1 o mayor que el número de días, devuelven `null`.
- Si dos semanas empatan en total, gana la primera (comparación con `>` estricto, igual en las dos versiones).

#### Fuerza bruta: `mejorSemanaBruta`

Suma cada bloque de `k` días desde cero y se queda con el mayor.

- **Tiempo:** hay n − k + 1 bloques y cada uno suma k días, es decir, **O(n · k)**. Con `k` fijo y pequeño (7) se comporta casi como O(n), pero si `k` crece con n (por ejemplo, `k = n/2`) llega a O(n²).
- **Espacio:** O(1).

#### Ventana deslizante: `mejorSemana`

Suma la primera ventana una vez. Después, en cada paso, suma el día que entra y resta el que sale, sin volver a sumar los demás.

- **Tiempo:** primera ventana (k) más n − k pasos de costo constante, en total k + (n − k) = n, es decir, **O(n)**, sin importar el valor de `k`.
- **Espacio:** O(1): solo `suma`, `mejorTotal` y `mejorInicio`.
- **Idea:** dos ventanas consecutivas comparten k − 1 días. La fuerza bruta los vuelve a sumar; la deslizante reutiliza esa suma.

#### Las tres primeras posiciones de la ventana (k = 7)

```text
día       1    2    3    4    5    6    7    8    9   10
valor      320  410  280  390  510  620  700  300  290  450
ventana 0 [320  410  280  390  510  620  700]                = 3230
ventana 1      [410  280  390  510  620  700  300]           = 3210
ventana 2           [280  390  510  620  700  300  290]      = 3090
```

| Posición | Días | Qué pasa | Total |
|---|---|---|---|
| 0 | 1 a 7 | Se suman los 7 días: 320 + 410 + 280 + 390 + 510 + 620 + 700 | 3230 |
| 1 | 2 a 8 | Sale el día 1 (320), entra el día 8 (300): 3230 − 320 + 300 | 3210 |
| 2 | 3 a 9 | Sale el día 2 (410), entra el día 9 (290): 3210 − 410 + 290 | 3090 |

#### Resultado con los datos de septiembre

La mejor semana empieza en el **día 24 de septiembre** (índice 23) y termina el día 30, con un total de **3.670** (miles de pesos, $3.670.000). Las dos versiones dan el mismo resultado.

#### Pruebas

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Septiembre, k = 7 | `{ inicio: 23, total: 3670 }` | OK |
| 2 | k mayor que los días | `null` | OK |
| 3 | k igual a los días | `{ inicio: 0, total: 6 }` | OK |
| 4 | k = 1 | `{ inicio: 1, total: 9 }` | OK |
| 5 | Empate: gana la primera | `{ inicio: 0, total: 10 }` | OK |
| 6 | Arreglo vacío | `null` | OK |
| 7 | `undefined` | `null` | OK |
| 8 | k = 0 | `null` | OK |
| 9 | Valores negativos | `{ inicio: 1, total: -4 }` | OK |
| 10 | 100.000 días al azar, k = 7: ¿coinciden? | OK | OK (inicio 2460, total 5202) |
| 11 | 100.000 días al azar, k = 1000: ¿coinciden? | OK | OK (inicio 65711, total 515035) |

En los dos casos con 100.000 días al azar, la fuerza bruta y la ventana deslizante devuelven el mismo día de inicio y el mismo total.

#### Comparación de tiempos con 100.000 días

**Predicción (antes de medir):** con `k = 7` la fuerza bruta hace ≈ 7 veces más sumas que la deslizante; con `k = 1000`, ≈ 1000 veces más. La deslizante debería tardar lo mismo con ambos valores de `k`, y la fuerza bruta debería crecer en proporción a `k`.

Tiempos medidos con `console.time`, una llamada por medición, con calentamiento previo sin cronometrar.

| k | Fuerza bruta (ms) | Ventana deslizante (ms) | Veces más lenta la bruta |
|---|---|---|---|
| 7 | 1,917 | 0,308 | × 6,2 |
| 1000 | 101,379 | 0,522 | × 194,2 |

**Cantidad de sumas (calculada del código):**

| k | Fuerza bruta | Ventana deslizante |
|---|---|---|
| 7 | (n − k + 1) · k = 99.994 · 7 ≈ 700.000 | ≈ n = 100.000 pasos |
| 1000 | 99.001 · 1000 ≈ 99.000.000 | ≈ n = 100.000 pasos |

**Análisis:**
- **La ventana deslizante no depende de `k`.** Hace del orden de 100.000 pasos con cualquier `k`, y su tiempo se mantuvo en una fracción de milisegundo (0,31 ms y 0,52 ms). La diferencia entre las dos cifras es ruido de una sola llamada de menos de 1 ms.
- **La fuerza bruta crece con `k`.** Con `k = 1000` hace ≈ 141 veces más sumas que con `k = 7`, y su tiempo se multiplicó por ≈ 53 (de 1,9 ms a 101,4 ms). Es el comportamiento de O(n · k): al aumentar `k`, aumenta el trabajo.
- **Por qué no se multiplicó por 141 ni por 1000.** Cada suma cuesta menos cuando `k` es grande: con `k = 7` el tiempo incluye 99.994 reinicios del ciclo interno por apenas 7 sumas cada uno, y con `k = 1000` ese costo se reparte entre muchas más sumas. Dividiendo, la fuerza bruta tardó ≈ 2,7 ns por suma con `k = 7` y ≈ 1,0 ns con `k = 1000`. El motor de JavaScript también optimiza mejor un ciclo largo. Por eso el crecimiento medido es menor que el teórico, aunque va en la misma dirección.
- **Comparación con la predicción:** se cumple en cantidad de sumas. Con `k = 7`, la fuerza bruta hace ≈ 700.000 sumas frente a ≈ 100.000 pasos de la deslizante (≈ 7 veces más). Con `k = 1000` hace ≈ 99.000.000 frente a ≈ 100.000 (≈ 990 veces más, es decir, ≈ 1000). En tiempo, la diferencia medida fue × 6,2 y × 194. El primer valor coincide con lo previsto. El segundo es menor que 990 porque cada paso de la deslizante hace más trabajo que una suma de la bruta (dos lecturas del arreglo, una suma, una resta y una comparación): ≈ 3 a 5 ns por paso, frente a ≈ 1 ns por suma en la bruta con `k = 1000`. Además, con una sola llamada de menos de 1 ms, el ruido pesa.
- **Con `k = 7`, el valor del problema, la diferencia es pequeña en términos absolutos** (1,9 ms frente a 0,3 ms con 100.000 días). La ventaja de la deslizante se vuelve decisiva cuando `k` es grande.
- **Limitación:** cada valor es una sola llamada y los tiempos de la deslizante son menores que 1 ms, así que las cifras varían entre ejecuciones. Las conclusiones (cuál es más rápida y cómo escala cada una) no dependen de esa variación.

### Par más cercano al presupuesto: `parMasCercano`

**Qué hace:** dado un presupuesto, devuelve los dos productos cuya suma de precios es la mayor posible sin superarlo.

**Decisiones:**
- Recibe el catálogo completo (objetos `{ producto, precio }`) y devuelve `[más barato, más caro]`.
- Ordena una **copia** del catálogo con `[...catalogo].sort((a, b) => a.precio - b.precio)`, para no modificar el original. El `sort` necesita la función de comparación porque por defecto ordena como texto, y con números daría un orden incorrecto.
- Devuelve `null` si no hay ningún par que quepa en el presupuesto, si el catálogo tiene menos de 2 productos o si la entrada no es válida.

**Por qué no basta un `Map` como en `comboRegalo`:** el `Map` encuentra un complemento **exacto** (valor − precio). Aquí se busca la suma más cercana por debajo, y eso exige un orden entre los precios. Por eso se ordena y se usan dos punteros.

**Estrategia:** dos punteros desde los extremos del arreglo ordenado. `izq` apunta al más barato y `der` al más caro.
- Si la suma **supera** el presupuesto, el de la derecha es demasiado caro incluso con el más barato que queda: ningún par con él sirve, y `der` retrocede.
- Si la suma **cabe**, el de la derecha es el mayor compañero posible para el de la izquierda (con otro más barato sumaría menos). Se guarda el par si mejora la mejor suma, y `izq` avanza.

#### Catálogo ordenado por precio

| Posición | Producto | Precio |
|---|---|---|
| 0 | Filtros de papel x100 | 18.000 |
| 1 | Origen Nariño 250 g | 26.000 |
| 2 | Taza de cerámica | 35.000 |
| 3 | Origen Huila 500 g | 42.000 |
| 4 | Origen Sierra 500 g | 45.000 |
| 5 | Origen Huila 1 kg | 79.000 |
| 6 | Prensa francesa | 95.000 |
| 7 | Molino manual | 120.000 |

#### Traza de los punteros para un presupuesto de 100.000

| Paso | `izq` | `der` | Par | Suma | ¿Supera 100.000? | Qué se mueve | Por qué | Mejor suma |
|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 7 | Filtros (18.000) + Molino (120.000) | 138.000 | Sí | `der` → 6 | Ni con el producto más barato cabe el Molino: no puede formar pareja con nadie. | - |
| 2 | 0 | 6 | Filtros (18.000) + Prensa (95.000) | 113.000 | Sí | `der` → 5 | Igual con la Prensa francesa. | - |
| 3 | 0 | 5 | Filtros (18.000) + Huila 1 kg (79.000) | 97.000 | No | `izq` → 1 | Cabe, y el Huila 1 kg es el mayor compañero posible para los Filtros. Se guarda y se descartan los Filtros. | **97.000** |
| 4 | 1 | 5 | Nariño (26.000) + Huila 1 kg (79.000) | 105.000 | Sí | `der` → 4 | El Huila 1 kg es demasiado caro incluso con el Nariño, el más barato que queda. | 97.000 |
| 5 | 1 | 4 | Nariño (26.000) + Sierra (45.000) | 71.000 | No | `izq` → 2 | Cabe, pero 71.000 no mejora 97.000. La Sierra es el mayor compañero posible para el Nariño. | 97.000 |
| 6 | 2 | 4 | Taza (35.000) + Sierra (45.000) | 80.000 | No | `izq` → 3 | Cabe, pero no mejora. | 97.000 |
| 7 | 3 | 4 | Huila 500 g (42.000) + Sierra (45.000) | 87.000 | No | `izq` → 4 | Cabe, pero no mejora. | 97.000 |
| Fin | 4 | 4 | - | - | - | - | `izq` alcanzó a `der`: no quedan pares. | - |

**Resultado:** Filtros de papel x100 + Origen Huila 1 kg, con 97.000 (no supera 100.000). El ciclo hizo 7 pasos, uno menos que los 8 productos.

**Otros presupuestos:**
- **140.000:** el primer par que cabe (Filtros + Molino) suma 138.000 y se guarda, pero más adelante Sierra + Prensa suma 140.000 y lo reemplaza. Devuelve Origen Sierra 500 g + Prensa francesa (suma exacta).
- **40.000:** el par más barato (Filtros + Nariño) ya suma 44.000, así que `der` retrocede hasta cruzarse con `izq`. Devuelve `null`.

#### Pruebas

| # | Caso | Esperado | Resultado |
|---|---|---|---|
| 1 | Presupuesto 100.000 | Filtros de papel x100 + Origen Huila 1 kg | OK |
| 2 | Presupuesto 140.000 (suma exacta) | Origen Sierra 500 g + Prensa francesa | OK |
| 3 | Presupuesto 40.000 (sin solución) | `null` | OK |
| 4 | Presupuesto 87.000 (suma exacta) | Origen Huila 500 g + Origen Sierra 500 g | OK |
| 5 | Presupuesto enorme (1.000.000) | Prensa francesa + Molino manual | OK |
| 6 | Presupuesto 0 | `null` | OK |
| 7 | Catálogo vacío | `null` | OK |
| 8 | Un solo producto | `null` | OK |
| 9 | `undefined` | `null` | OK |
| 10 | Precios repetidos | A + B | OK |
| - | Comparación con fuerza bruta (501 presupuestos de 0 a 250.000): la suma coincide y nunca supera el presupuesto | OK | OK |
| - | Catálogo sin modificar | OK | OK |

Con los presupuestos de la consigna: 100.000 devuelve Filtros de papel x100 + Origen Huila 1 kg (97.000), 140.000 devuelve Origen Sierra 500 g + Prensa francesa (140.000, suma exacta) y 40.000 devuelve `null`.

### Clasificación de complejidad: ventana deslizante y dos punteros

| Función | Tiempo | Espacio | Justificación (basada en el código) |
|---|---|---|---|
| `mejorSemanaBruta` | O(n · k) | O(1) | Hay n − k + 1 bloques y cada uno suma k días con un ciclo interno. Si `k` crece con n, llega a O(n²). |
| `mejorSemana` | O(n) | O(1) | Suma la primera ventana (k pasos) y luego hace n − k pasos de costo constante (entra un día, sale otro): k + (n − k) = n, sin importar `k`. Solo usa tres variables. |
| `parMasCercano` | **O(n log n)** | O(n) | Ordenar la copia cuesta O(n log n); el recorrido con dos punteros cuesta O(n) (en cada paso un puntero avanza, como máximo n − 1 pasos). n log n + n se simplifica a O(n log n): el ordenamiento domina. La copia del arreglo ocupa O(n). |

**Por qué `mejorSemana` es O(n):** no hay ciclos anidados. La fuerza bruta vuelve a sumar los k − 1 días que dos ventanas consecutivas comparten; la ventana deslizante los reutiliza, y por eso desaparece el factor `k`. Con 100.000 días tardó 0,31 ms con `k = 7` y 0,52 ms con `k = 1000`, frente a 1,9 ms y 101,4 ms de la fuerza bruta.

**Por qué `parMasCercano` es O(n log n) y no O(n):** el recorrido con dos punteros es lineal, pero solo funciona si los precios están ordenados, y ordenar tiene un costo de O(n log n) que es mayor que el recorrido. Si el catálogo ya viniera ordenado, la función sería O(n) (más la copia). La alternativa por fuerza bruta, probar todos los pares, es O(n²).