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