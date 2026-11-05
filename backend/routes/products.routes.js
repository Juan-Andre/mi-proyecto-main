// ============================================================================
// RUTAS DE PRODUCTOS Y MENÚ
// ============================================================================

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON con los platillos del restaurante
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');

/**
 * Función auxiliar para leer los productos desde el archivo JSON.
 * @returns {Array} Lista de productos.
 */
function readProductsFromFile() {
    try {
        const rawData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error al leer el archivo de productos:', error.message);
        return [];
    }
}

// ----------------------------------------------------------------------------
// GET /api/products - Obtener todos los productos (con filtros opcionales)
// Parámetros de consulta opcionales: ?category=hamburguesas & search=deluxe
// ----------------------------------------------------------------------------
router.get('/', (req, res) => {
    // Leemos la lista de productos
    let products = readProductsFromFile();

    // Filtro por categoría (ej: hamburguesas, combos, acompanamientos, bebidas)
    const { category, search } = req.query;

    if (category && category.toLowerCase() !== 'todos') {
        products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filtro por texto de búsqueda (nombre o descripción)
    if (search) {
        const query = search.toLowerCase().trim();
        products = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.categoryName.toLowerCase().includes(query)
        );
    }

    // Devolvemos el resultado filtrado y el conteo
    return res.json({
        success: true,
        total: products.length,
        products: products
    });
});

// ----------------------------------------------------------------------------
// GET /api/products/:id - Obtener el detalle de un platillo específico por su ID
// ----------------------------------------------------------------------------
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const products = readProductsFromFile();
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: `No se encontró ningún platillo con el ID "${id}".`
        });
    }

    return res.json({
        success: true,
        product: product
    });
});

module.exports = router;

