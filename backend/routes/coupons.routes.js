// ============================================================================
// RUTAS DE CUPONES Y DESCUENTOS PROMOCIONALES
// ============================================================================

const express = require('express');
const router = express.Router();

// Lista de cupones válidos en el sistema
const AVAILABLE_COUPONS = {
    'DONDEJUAN10': {
        code: 'DONDEJUAN10',
        type: 'percentage',
        value: 10,
        description: '10% de descuento en el total de tu orden'
    },
    'HAMBURGUESA5K': {
        code: 'HAMBURGUESA5K',
        type: 'fixed',
        value: 5000,
        description: '$5.000 de descuento directo en tu orden'
    },
    'CLIENTE5K': {
        code: 'CLIENTE5K',
        type: 'fixed',
        value: 5000,
        description: '$5.000 de descuento para clientes frecuentes'
    }
};

// ----------------------------------------------------------------------------
// POST /api/coupons/validate - Validar si un cupón ingresado es correcto
// ----------------------------------------------------------------------------
router.post('/validate', (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            message: 'Debes ingresar un código de cupón.'
        });
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[normalizedCode];

    if (!coupon) {
        return res.status(404).json({
            success: false,
            message: 'El código de cupón no es válido o ha expirado. Prueba con "DONDEJUAN10".'
        });
    }

    return res.json({
        success: true,
        message: '¡Cupón aplicado correctamente!',
        coupon: coupon
    });
});

module.exports = router;

