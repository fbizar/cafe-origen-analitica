# Bitácora

## Microreto 1 - Primer tueste: el repositorio y los datos
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

## Microreto 2 - Los números del día: recorrer, filtrar y acumular
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