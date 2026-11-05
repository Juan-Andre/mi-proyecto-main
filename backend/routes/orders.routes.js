// ============================================================================
// RUTAS DE PEDIDOS Y FACTURACIÓN (CHECKOUT)
// ============================================================================

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta hacia el archivo JSON de pedidos
const ORDERS_FILE = path.join(__dirname, '..', 'data', 'orders.json');

/**
 * Función auxiliar para leer los pedidos existentes.
 * @returns {Array} Arreglo de pedidos.
 */
function readOrdersFromFile() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, '[]', 'utf8');
            return [];
        }
        const rawData = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error al leer el archivo de pedidos:', error.message);
        return [];
    }
}

/**
 * Función auxiliar para guardar pedidos en el archivo JSON.
 * @param {Array} orders - Lista actualizada de pedidos.
 */
function writeOrdersToFile(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al escribir el archivo de pedidos:', error.message);
    }
}

// ----------------------------------------------------------------------------
// POST /api/orders - Crear un nuevo pedido
// ----------------------------------------------------------------------------
router.post('/', (req, res) => {
    const { customer, items, totals, paymentMethod, notes } = req.body;

    // 1. Validamos que el cliente haya proporcionado los datos obligatorios
    if (!customer || !customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({
            success: false,
            message: 'Los datos del cliente (nombre, teléfono y dirección) son obligatorios.'
        });
    }

    // 2. Validamos que haya al menos un producto en el pedido
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El pedido debe contener al menos un producto.'
        });
    }

    // 3. Generamos un código de orden único (ejemplo: DJ-4821)
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const orderId = `DJ-${randomDigits}`;

    // 4. Estructuramos el nuevo registro del pedido
    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        customer: {
            name: customer.name.trim(),
            phone: customer.phone.trim(),
            address: customer.address.trim(),
            notes: notes ? notes.trim() : 'Ninguna'
        },
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        totals: {
            subtotal: totals?.subtotal || 0,
            discount: totals?.discount || 0,
            shippingCost: totals?.shippingCost || 0,
            total: totals?.total || 0
        },
        paymentMethod: paymentMethod || 'Efectivo',
        status: 'En preparación',
        estimatedTime: '30 - 45 minutos'
    };

    // 5. Guardamos en el archivo JSON (añadiendo al inicio de la lista)
    const orders = readOrdersFromFile();
    orders.unshift(newOrder);
    writeOrdersToFile(orders);

    // 6. Respondemos con éxito y el ticket de confirmación
    return res.status(201).json({
        success: true,
        message: '¡Pedido recibido y confirmado exitosamente!',
        order: newOrder
    });
});

// ----------------------------------------------------------------------------
// GET /api/orders - Listar todos los pedidos recibidos
// ----------------------------------------------------------------------------
router.get('/', (req, res) => {
    const orders = readOrdersFromFile();
    return res.json({
        success: true,
        total: orders.length,
        orders: orders
    });
});

// ----------------------------------------------------------------------------
// GET /api/orders/:id - Consultar un pedido específico por su código
// ----------------------------------------------------------------------------
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const orders = readOrdersFromFile();
    const order = orders.find(o => o.id.toUpperCase() === id.toUpperCase());

    if (!order) {
        return res.status(404).json({
            success: false,
            message: `No se encontró ningún pedido con el número "${id}".`
        });
    }

    return res.json({
        success: true,
        order: order
    });
});

module.exports = router;

