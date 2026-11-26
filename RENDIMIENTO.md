# Informe de rendimiento: Analítica v0.2

Motor de analítica de **Café Origen** (`cafe-origen-analitica`). Este documento describe el rendimiento de cada función del motor en tiempo y memoria, con evidencia de mediciones.

**Notación:** n = número de ventas, c = ciudades distintas, p = productos distintos, d = ventas del día, m = clientes repetidos (m ≤ n/2), k = ventas de la ciudad buscada (k ≤ n).

**Regla de conteo de operaciones:** 1 por elemento visitado y 1 por cada comparación. Las operaciones aritméticas no se cuentan.

**Datos de medición:** `generarVentas(10000)`, que solo produce `cantidad >= 1` (todas las ventas son válidas). Las mediciones de tiempo con 10.000 ventas se hicieron con `medir.js`: cada función se ejecuta una vez de calentamiento y luego en 5 rondas, y se reporta la mediana en milisegundos por llamada.

- **(medido)**: obtenido ejecutando la versión instrumentada o cronometrando.
- **(calculado)**: obtenido aplicando la regla de conteo al código, sin ejecutarlo.

**Nota sobre los equipos de medición:** las mediciones de todas las funciones con 10.000 ventas (`medir.js`) y las demás mediciones de `clientesRecurrentes` (1.000 a 16.000 y 100.000 ventas) se realizaron en equipos diferentes. Por eso los valores absolutos no son comparables entre las dos series. Aun así, el tiempo mantiene la misma proporción de crecimiento: en `clientesRecurrentes` se multiplica por ≈ 4 cada vez que n se duplica.

## Tabla de rendimiento

| Función | Qué hace | Tiempo | Espacio | Justificación | Operaciones y tiempo con 10.000 ventas |
|---|---|---|---|---|---|
| `valorVenta` | Calcula `cantidad * precio` de una venta | O(1) | O(1) | Una multiplicación, no recorre nada. | Constante: se ejecuta una vez por venta dentro de otras funciones, su costo ya está incluido en ellas |
| `normalizar` | Quita espacios, pasa a minúsculas y elimina tildes | O(1) | O(1) | Trabaja sobre un nombre corto cuyo tamaño no depende de n. Pero encadena 4 operaciones de texto. | ≈ 0,0002 ms por llamada (derivado de `ventasPorCiudad`) |
| `primeraVenta` | Devuelve la primera venta | O(1) | O(1) | Accede a una posición, sin ciclo. | 1 operación (medido) · < 0,0001 ms |
| `totalVendido` | Suma el valor de las ventas válidas | O(n) | O(1) | Un `for...of`; por vuelta, 1 visita y 1 comparación (`cantidad <= 0`). Un acumulador. | 20.000 = 2n (medido) · 0,0818 ms |
| `unidadesVendidas` | Suma las unidades de las ventas válidas | O(n) | O(1) | Misma estructura que `totalVendido`. | 20.000 = 2n (calculado) · 0,0124 ms |
| `ventaMayor` | Devuelve el registro de mayor valor | O(n) | O(1) | Un solo ciclo. Las ventas válidas hacen una comparación más: 3 por venta. | 30.000 = 3n (medido) · 0,0796 ms |
| `ticketPromedio` | Promedio del valor por venta válida | O(n) | O(1) | Un solo ciclo con dos acumuladores. | 20.000 = 2n (calculado) · 0,0838 ms |
| `ventasPorCiudad` | Total vendido en una ciudad | O(n) | O(1) | Un solo ciclo; llama a `normalizar` en cada venta válida, y eso domina el tiempo. | 30.000 = 3n (calculado) · 2,1173 ms |
| `totalVendidoM` | Igual que `totalVendido`, con `filter` + `reduce` | O(n) | O(n) | `filter` recorre las n ventas (visita + comparación) y crea un arreglo nuevo; `reduce` recorre ese arreglo. | 30.000 = 3n (calculado) · 0,1692 ms |
| `unidadesVendidasM` | Igual que `unidadesVendidas`, con `filter` + `reduce` | O(n) | O(n) | Igual que la anterior. | 30.000 = 3n (calculado) · 0,1618 ms |
| `ventasPorCiudadM` | Igual que `ventasPorCiudad`, con un `filter` y un `reduce` | O(n) | O(n) | El `filter` recorre las n ventas (visita, `cantidad > 0` y ciudad: 3 por venta válida) y crea un arreglo con las k ventas de la ciudad; el `reduce` recorre esas k. `normalizar` domina el tiempo. | 3n + k (calculado; k = ventas de la ciudad) · 2,0123 ms |
| `totalPorCiudad` | Total vendido por cada ciudad (objeto) | O(n) | O(c) | Un solo `reduce`; `normalizar` en cada venta válida. Una clave por ciudad distinta. | 20.000 = 2n (medido) · 2,9054 ms |
| `unidadesPorProducto` | Unidades vendidas por producto (objeto) | O(n) | O(p) | Un solo ciclo que acumula por clave; una clave por producto distinto. | ≈ 20.000 (calculado) · 0,3350 ms |
| `topProductosPorValor` | Los k productos que más dinero generaron | O(n + p log p) | O(p) | Un ciclo para agrupar (n), y luego `Object.entries`, `map`, `sort` y `slice` sobre p productos. No depende de k. | ≈ 2n + p log p (calculado) · 0,2480 ms |
| `ventasDelDia` | Ventas de una fecha | O(n) | O(d) | Un `filter` que recorre todas las ventas; el resultado tiene solo las d ventas del día. | ≈ 20.000 (calculado) · 0,1682 ms |
| `clientesRecurrentes` | Clientes con más de una venta | **O(n²)** (peor caso O(n³)) | O(m) | Dos ciclos anidados que comparan cada par de ventas: n(n − 1) / 2 pares. `includes` recorre `recurrentes` en cada coincidencia. | 49.995.000 comparaciones `===` (calculado) · 304,7 ms (medido) |
| `totalCiudadCadena` | Total de una ciudad con `map`, `filter`, `map`, `reduce` | O(n) | O(n) | 4 recorridos y 3 arreglos nuevos, más n copias de venta. | hasta 40.000 visitas (calculado) · 2,3295 ms |
| `totalCiudadUnaPasada` | Total de una ciudad con un solo `for...of` | O(n) | O(1) | 1 recorrido, sin arreglos nuevos. Equivalente a `ventasPorCiudad`. | 10.000 visitas (calculado) · 1,9597 ms |

**Por qué las constantes no cambian la clase:** `2n`, `3n` y `4n` se simplifican a O(n), porque al multiplicar n por 10 todas se multiplican por 10. Las constantes afectan el tiempo real, no la forma de crecer.

### Hallazgos de las mediciones

- **El conteo de operaciones no predice el tiempo entre funciones distintas.** `ventasPorCiudad` hace 3n operaciones y `totalVendido` 2n, pero la primera tarda ≈ 26 veces más, porque cada llamada a `normalizar` (4 operaciones de texto) pesa mucho más que una suma. El conteo sirve para ver cómo crece cada función al aumentar n, no para comparar funciones entre sí.
- **`totalCiudadCadena` solo es un 19 % más lenta que `totalCiudadUnaPasada`** (2,33 ms frente a 1,96 ms), aunque hace hasta 4 veces más visitas, porque `normalizar` domina el tiempo en ambas. La diferencia importante es el espacio: O(n) frente a O(1).
- **El arreglo intermedio de `filter` tiene costo:** `totalVendidoM` tarda el doble que `totalVendido`, y `unidadesVendidasM` unas 13 veces más que `unidadesVendidas`. En `ventasPorCiudadM` la diferencia con `ventasPorCiudad` no se nota, porque `normalizar` lo domina todo.
- **El `sort` de `topProductosPorValor` no se nota** con la cantidad de productos del catálogo: tarda lo mismo que `unidadesPorProducto`.
- **Mejora posible (no implementada):** como `normalizar` domina el tiempo de las funciones por ciudad, se podría normalizar cada ciudad distinta una sola vez, o normalizar los datos al cargarlos.

### Evidencia de mediciones

**Conteo de operaciones (versiones instrumentadas)**

| Función | n = 100 | n = 1.000 | n = 10.000 | n = 100.000 | Factor al pasar de n a 10n |
|---|---|---|---|---|---|
| `totalVendidoC` | 200 | 2.000 | 20.000 | 200.000 | × 10 |
| `ventaMayorC` | 300 | 3.000 | 30.000 | 300.000 | × 10 |
| `totalPorCiudadC` | 200 | 2.000 | 20.000 | 200.000 | × 10 |
| `primeraVentaC` | 1 | 1 | 1 | 1 | × 1 |

**Tiempo de `clientesRecurrentes` (serie de crecimiento)**

| n | Tiempo | Factor al duplicar n |
|---|---|---|
| 1.000 | 12,598 ms | - |
| 2.000 | 41,352 ms | × 3,3 |
| 4.000 | 131,636 ms | × 3,2 |
| 8.000 | 651,3 ms | × 4,9 |
| 16.000 | 2.817 ms | × 4,3 |
| 100.000 | 109.188 ms (1:49,188) | × 38,8 respecto a 16.000 (esperado: 6,25² ≈ 39,06) |

Al duplicar n, el tiempo se multiplica aproximadamente por 4, como predice O(n²). Esta serie es la evidencia de la forma de crecer de la función. En ella, la predicción de 110 s para 100.000 ventas se comprobó (salió 109,2 s, diferencia ≈ 0,8 %).

**Tiempo de todas las funciones con 10.000 ventas:** columna final de la tabla de rendimiento (`medir.js`).

## Proyección

Estimación para **1.000.000 de ventas**. En las funciones lineales el tiempo se multiplica por 100 respecto a 10.000 ventas. Para `clientesRecurrentes` se multiplica por 100² = 10.000.

| Reporte | Cómo se calcula | Estimación con 1.000.000 |
|---|---|---|
| `clientesRecurrentes` | 304,7 ms (10.000 ventas) × 10.000 | ≈ 3,0 × 10⁶ ms ≈ **51 minutos** |
| `totalPorCiudad` | 2,9054 ms × 100 | ≈ 290 ms |
| `totalCiudadCadena` | 2,3295 ms × 100 | ≈ 233 ms |
| `ventasPorCiudad` | 2,1173 ms × 100 | ≈ 212 ms |
| `ventasPorCiudadM` | 2,0123 ms × 100 | ≈ 201 ms |
| `totalCiudadUnaPasada` | 1,9597 ms × 100 | ≈ 196 ms |
| `unidadesPorProducto` | 0,3350 ms × 100 | ≈ 34 ms |
| `topProductosPorValor` | 0,2480 ms × 100 | ≈ 25 ms |
| `totalVendidoM`, `unidadesVendidasM` | 0,1692 y 0,1618 ms × 100 | ≈ 17 ms y ≈ 16 ms |
| `ventasDelDia` | 0,1682 ms × 100 | ≈ 17 ms |
| `ticketPromedio`, `totalVendido`, `ventaMayor` | 0,0838, 0,0818 y 0,0796 ms × 100 | ≈ 8 ms |
| `unidadesVendidas` | 0,0124 ms × 100 | ≈ 1 ms |
| `primeraVenta` | Constante | < 0,0001 ms |

**Límites de la proyección:**
- Es una extrapolación de 100× el tamaño medido: da un orden de magnitud. Con millones de registros influyen la memoria caché y el recolector de basura, que pueden hacer que el tiempo real sea algo mayor, sobre todo en las funciones que crean arreglos grandes (`totalCiudadCadena` y las versiones `M`).
- La cifra de `clientesRecurrentes` parte de una sola medición (10.000 ventas, equipo de `medir.js`). Como esa serie y la de crecimiento se tomaron en equipos distintos, no se mezclan en un mismo cálculo. Los 109,2 s con 100.000 ventas pertenecen al otro equipo.
- Los tiempos dependen de la máquina, de la versión de Node y de la distribución de clientes y ciudades en los datos.
- En cualquier caso, `clientesRecurrentes` es la única función que pasa de milisegundos a minutos al crecer los datos.

## Riesgos

Funciones ordenadas de **mayor a menor riesgo** cuando los datos crecen.

**Criterio:** primero la clase de crecimiento del tiempo (cuadrático antes que lineal); entre las lineales, el tiempo medido con 10.000 ventas y el uso de memoria que crece con n.

1. **`clientesRecurrentes`: riesgo alto.** O(n²) (O(n³) en el peor caso). 304,7 ms con 10.000 ventas y ≈ 51 minutos proyectados con 1.000.000. Es la única función cuyo tiempo se dispara al crecer los datos.
2. **`totalCiudadCadena`: riesgo medio.** O(n) en tiempo, pero también en memoria (3 arreglos y n copias de venta), y es de las más lentas (2,33 ms).
3. **`totalPorCiudad`: riesgo medio-bajo.** La función lineal más lenta (2,91 ms), por `normalizar` en cada venta.
4. **`ventasPorCiudad`, `ventasPorCiudadM`, `totalCiudadUnaPasada`: riesgo medio-bajo.** O(n), ≈ 2 ms por el costo de `normalizar`. La versión `M` además usa memoria O(n).
5. **`totalVendidoM`, `unidadesVendidasM`: riesgo bajo.** O(n) con un arreglo intermedio de `filter` (≈ 0,16 ms).
6. **`unidadesPorProducto`, `topProductosPorValor`, `ventasDelDia`: riesgo bajo.** O(n), entre 0,17 y 0,34 ms, con memoria pequeña.
7. **`totalVendido`, `unidadesVendidas`, `ventaMayor`, `ticketPromedio`: riesgo mínimo.** O(n) en tiempo y O(1) en memoria, entre 0,01 y 0,08 ms.
8. **`primeraVenta`, `valorVenta`, `normalizar`: sin riesgo propio.** O(1). El peso de `normalizar` se refleja en las funciones que la llaman.

## Plan de optimización

Función de mayor riesgo: **`clientesRecurrentes`**. Esta sección describe la idea; **no está implementada**.

**¿Qué trabajo se repite?**
- Cada venta se compara con todas las ventas siguientes, aunque su cliente ya se haya revisado. Para saber si un cliente repite, el código vuelve a mirar los mismos clientes muchas veces: eso produce los n(n − 1) / 2 pares.
- Cada vez que dos ventas coinciden, `recurrentes.includes` vuelve a recorrer la lista de clientes ya encontrados para comprobar si el cliente está.

**¿Qué información se podría guardar para no buscarla de nuevo?**
- Un diccionario `cliente → cantidad de compras`, que se actualiza al visitar cada venta una sola vez. Contar un cliente es una consulta directa (O(1)), así que no hace falta comparar con las demás ventas.
- Al final, los clientes recurrentes son los que tienen 2 o más compras. Eso elimina también el `includes`, porque cada cliente aparece una sola vez como clave.

**Efecto esperado (hipótesis, por medir):**

| | Actual | Con diccionario |
|---|---|---|
| Tiempo | O(n²) | O(n) |
| Espacio | O(m) | O(c), con c = clientes distintos |

El tiempo pasaría de crecer al cuadrado a crecer en línea: con 100.000 ventas, de casi 2 minutos a una fracción del tiempo actual. Esa cifra debe confirmarse con una medición antes de afirmarla. A cambio, la memoria sube de O(m) a O(c), un costo pequeño frente a la ganancia.