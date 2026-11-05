// ============================================================================
// ARCHIVO DE REDIRECCIÓN Y COMPATIBILIDAD (LEGACY FORWARDER)
// ============================================================================
// NOTA DE ARQUITECTURA:
// El código frontend ha sido modularizado y reorganizado en la carpeta 'js/'
// para una estructura profesional, limpia y fácil de mantener:
//
// 📁 js/
//   ├── api.js   -> Cliente HTTP para comunicación con el backend Express
//   ├── auth.js  -> Gestión de login, registro, perfil y validaciones
//   ├── cart.js  -> Gestión del carrito de compras, cupones y checkout
//   ├── menu.js  -> Catálogo dinámico de platillos, filtros y búsqueda
//   └── main.js  -> Coordinador global de navegación y cabecera
//
// 📁 backend/
//   ├── server.js -> Servidor principal Node.js con Express
//   ├── data/     -> Archivos JSON de persistencia (users, products, orders)
//   └── routes/   -> Rutas modulares de la API REST (/api/...)
//
// Este archivo carga automáticamente los módulos en caso de ser referenciado.
// ============================================================================

console.log('📦 Arquitectura Donde Juan cargada desde módulos en carpeta js/');