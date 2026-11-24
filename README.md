# cafe-origen-analitica

Motor de analítica de ventas para **Café Origen**, una tostadora de café de especialidad de Medellín que vende en su tienda física, en ferias y por pedidos en línea a varias ciudades del país.

## Descripción

Café Origen lleva sus ventas en hojas de cálculo y no tiene una forma confiable de responder preguntas como "¿cuál fue nuestro producto más vendido?" o "¿qué ciudad nos compra más?". Este proyecto, desarrollado por **Nodo Digital**, construye la lógica que responde esas preguntas a partir de los registros de venta.

Esta versión (**v0.1**) no tiene pantallas: contiene solo las funciones de análisis y scripts para ejecutarlas desde la terminal.

### Reglas que aplica el motor

- **Ventas válidas:** se descartan las ventas con `cantidad <= 0` en todos los cálculos.
- **Ciudades:** los nombres se normalizan (sin espacios sobrantes, minúsculas y sin tildes), así que `"Bogotá"`, `"Bogotá "` y `"bogota"` cuentan como la misma ciudad.
- **Sin datos:** las funciones que acumulan devuelven un valor neutro (`0`, `{}` o `[]`) y las que eligen o promedian devuelven `null`. Nunca devuelven `NaN`.

### Estructura del proyecto

```text
cafe-origen-analitica/
├── src/
│   ├── analitica.js   # Funciones de análisis (de ventaMayor a ventasDelDia)
│   ├── datos.js       # Arreglo con los registros de ventas
│   ├── explorar.js    # Importa las ventas e imprime elementos para explorarlas
│   ├── reportes.js    # Muestra los reportes de negocio
│   └── verificar.js   # Prueba las funciones de analitica.js con distintas entradas
├── bitacora.md        # Registro de todo el avance del proyecto
└── README.md
```

## Cómo ejecutarlo

### Requisitos

- [Node.js](https://nodejs.org/) 14 o superior (se recomienda la versión LTS).
- No hay dependencias que instalar.

Para comprobar que Node está instalado:

```bash
node --version
```

### Pasos

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone https://github.com/fbizar/cafe-origen-analitica.git
   cd cafe-origen-analitica
   ```

2. Ejecuta el script que necesites desde la raíz del proyecto:

   ```bash
   # Reportes de negocio (resumen general, ventas por ciudad, unidades por producto,
   # top 3 de productos por valor y ventas de un día)
   node src/reportes.js

   # Pruebas de las funciones con distintas entradas (arreglo completo, un elemento y vacío)
   node src/verificar.js

   # Exploración de los datos
   node src/explorar.js
   ```

`verificar.js` compara la versión con ciclo y la versión con métodos de Array de cada indicador, y muestra `OK` o `DIFERENTE` para cada par.

## Qué preguntas responde

| Pregunta de negocio | Función | Qué devuelve |
|---|---|---|
| ¿Cuánto dinero vendimos en total? | `totalVendido(ventas)` | Un número. `0` si no hay ventas. |
| ¿Cuántas unidades vendimos? | `unidadesVendidas(ventas)` | Un número. `0` si no hay ventas. |
| ¿Cuál fue la venta más grande? | `ventaMayor(ventas)` | El registro completo, o `null` si no hay ventas válidas. |
| ¿Cuál es el ticket promedio? | `ticketPromedio(ventas)` | Un número, o `null` si no hay ventas válidas. |
| ¿Cuánto vendimos en una ciudad? | `ventasPorCiudad(ventas, ciudad)` | Un número. Ignora mayúsculas, tildes y espacios. |
| ¿Cuánto nos compra cada ciudad? | `totalPorCiudad(ventas)` | Un objeto `{ ciudad: total }` con las ciudades normalizadas. |
| ¿Cuántas unidades se vendieron de cada producto? | `unidadesPorProducto(ventas)` | Un objeto `{ producto: unidades }`. |
| ¿Cuáles son los k productos que más dinero generaron? | `topProductosPorValor(ventas, k)` | Un arreglo `[{ producto, total }]` de mayor a menor. No modifica `ventas`. |
| ¿Qué se vendió un día concreto? | `ventasDelDia(ventas, fecha)` | Un arreglo con las ventas de esa fecha (formato `AAAA-MM-DD`). Lanza un error si el formato es inválido. |

Las funciones `totalVendidoM`, `unidadesVendidasM` y `ventasPorCiudadM` calculan los mismos indicadores usando métodos de Array (`filter` y `reduce`), y se usan en `verificar.js` para comprobar que ambas versiones coinciden.

### Ejemplo de uso

```javascript
const { ventas } = require("./datos");
const { totalVendido, totalPorCiudad, topProductosPorValor } = require("./analitica");

console.log(totalVendido(ventas));              // 985000
console.log(totalPorCiudad(ventas));            // { medellin: 356000, bogota: 276000, cali: 185000, pereira: 168000 }
console.log(topProductosPorValor(ventas, 3));   // los 3 productos que más dinero generaron
```

## Registro del proyecto

Las decisiones, trazas y errores corregidos (como las ciudades duplicadas y el `NaN` en el ticket promedio) están documentados en [`bitacora.md`](./bitacora.md).