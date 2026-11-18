# Bitácora

## Día 1 - Primer tueste: el repositorio y los datos
### Diccionario de datos
1. `id` - Entero (Number) - Identificador único del dato.
2. `fecha` - Fecha (String) - Fecha del registro.
3. `cliente` - String - ID del cliente relacionado al registro.
4. `producto` - String - Nombre del producto.
5. `ciudad` - String - Ciudad de la compra.
6. `cantidad` - Entero (Number) - Número de productos que se compraron.
7. `precio` - Flotante (Number) - Precio unitario del producto.

### Casos borde detectados

| Problema                                             | Decisión                                                                         |
| ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| Venta con id 8 tiene una cantidad en 0               | Excluirlo del ticket, solo se aceptan ventas de al menos 1.                      |
| Entre las ciudades hay un medellín en minúsculas     | Normalizar todos las ciudades en minúsculas y quitar espacios para consistencia. |
| Los clientes C01, C02 y C03 tienes más de 1 registro | No hacer nada, es válido; corresponde a una venta diferente                      |
