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

function clientesRecurrentesMap(ventas) {
    if (!Array.isArray(ventas)) return [];

    const recurrentes = [];
    for (const [cliente, cantidad] of comprasPorCliente(ventas)) {
        if (cantidad >= 2) recurrentes.push(cliente);
    }
    return recurrentes;
}

function comprasPorCliente(ventas){
    const compras = new Map();
    for (const venta of ventas) compras.set(venta.cliente, (compras.get(venta.cliente) || 0) + 1);
    return compras;
}

module.exports = { clientesRecurrentesSet, clientesRecurrentesMap, comprasPorCliente }