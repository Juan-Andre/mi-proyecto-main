// ============================================================================
// SERVIDOR PRINCIPAL BACKEND - RESTAURANTE DONDE JUAN
// ============================================================================

// 1. Importación de módulos principales
const express = require('express');
const cors = require('cors');
const path = require('path');

// 2. Inicialización de la aplicación Express
const app = express();

// 3. Configuración del puerto de escucha (usa variable de entorno o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------------------------
// MIDDLEWARES GLOBALES
// ----------------------------------------------------------------------------

// Habilitar CORS para permitir peticiones desde cualquier origen local o remoto
app.use(cors());

// Middleware para procesar cuerpos de solicitud en formato JSON
app.use(express.json());

// Middleware para procesar datos enviados desde formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Middleware para registrar en consola cada petición entrante (Logger informativo)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] 📡 ${req.method} ${req.originalUrl}`);
    next();
});

// ----------------------------------------------------------------------------
// SERVICIO DE ARCHIVOS ESTÁTICOS (FRONTEND)
// ----------------------------------------------------------------------------
// Servimos todos los archivos del frontend (HTML, CSS, JS, imágenes, logos)
// desde la raíz del proyecto para que la aplicación funcione completa con el servidor
const FRONTEND_DIR = path.join(__dirname, '..');
app.use(express.static(FRONTEND_DIR));

// ----------------------------------------------------------------------------
// RUTAS DE LA API REST (ENDPOINTS)
// ----------------------------------------------------------------------------

// Rutas de autenticación (Registro, Inicio de sesión, usuarios)
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Rutas de productos (Catálogo del menú, filtros y búsquedas)
const productRoutes = require('./routes/products.routes');
app.use('/api/products', productRoutes);

// Rutas de pedidos (Creación de órdenes y consulta de pedidos)
const orderRoutes = require('./routes/orders.routes');
app.use('/api/orders', orderRoutes);

// Rutas de cupones (Validación de códigos de descuento)
const couponRoutes = require('./routes/coupons.routes');
app.use('/api/coupons', couponRoutes);

// Endpoint de verificación de estado del servidor
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        message: 'Servidor Donde Juan funcionando correctamente 🍔',
        timestamp: new Date().toISOString()
    });
});

// ----------------------------------------------------------------------------
// RUTAS DE PÁGINAS PRINCIPALES (ACCESO DIRECTO)
// ----------------------------------------------------------------------------

// Ruta principal: Entrega index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Ruta de login y registro: Entrega login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'login.html'));
});

// Ruta del menú y carrito: Entrega menu.html
app.get('/menu', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'menu.html'));
});

// ----------------------------------------------------------------------------
// MANEJO DE ERRORES 404 (RUTA NO ENCONTRADA)
// ----------------------------------------------------------------------------
app.use((req, res) => {
    // Si la petición era hacia la API, respondemos con formato JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: `Endpoint de API no encontrado: ${req.method} ${req.path}`
        });
    }
    // Si no es API, redirigimos a la página de inicio
    res.redirect('/');
});

// ----------------------------------------------------------------------------
// INICIO DEL SERVIDOR
// ----------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log('====================================================');
    console.log('🍔 SERVIDOR BACKEND DONDE JUAN INICIADO CON ÉXITO');
    console.log('====================================================');
    console.log(`🌐 Aplicación Web:    http://localhost:${PORT}`);
    console.log(`📋 Menú con Carrito: http://localhost:${PORT}/menu.html`);
    console.log(`👤 Login y Registro: http://localhost:${PORT}/login.html`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
    console.log('====================================================');
    console.log('Presiona Ctrl + C para detener el servidor.');
});

