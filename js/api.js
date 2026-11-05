// ============================================================================
// MÓDULO DE COMUNICACIÓN CON EL BACKEND (API CLIENT)
// ============================================================================
// Este archivo centraliza todas las llamadas HTTP (fetch) hacia el servidor Node.js
// y cuenta con un mecanismo inteligente de respaldo (fallback) hacia localStorage
// para que la página funcione perfectamente tanto con el servidor como sin él.

// URL base de la API del backend (asume el mismo host y puerto en producción/local)
const API_BASE_URL = window.location.protocol.startsWith('http')
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api';

/**
 * Objeto global que expone los métodos de la API para toda la aplicación.
 */
const DondeJuanAPI = {
    // Variable de estado que indica si el backend está activo y respondiendo
    isBackendOnline: false,

    /**
     * Verifica si el servidor backend está disponible realizando un ping a /api/health.
     * @returns {Promise<boolean>} Verdadero si el backend respondió con éxito.
     */
    async checkHealth() {
        try {
            // Establecemos un tiempo límite corto (1.5 segundos) para no demorar la interfaz
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);

            const response = await fetch(`${API_BASE_URL}/health`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                this.isBackendOnline = true;
                console.log('🟢 [API] Conectado al servidor backend exitosamente.');
                return true;
            }
        } catch (error) {
            // Si falla la conexión, operamos en modo local (localStorage) sin interrumpir al usuario
            this.isBackendOnline = false;
            console.log('🟡 [API] Servidor backend no detectado. Operando con almacenamiento local (localStorage).');
        }
        return false;
    },

    /**
     * Registra un nuevo usuario en el sistema.
     * @param {Object} userData - Datos del usuario { name, email, phone, password }.
     * @returns {Promise<Object>} Respuesta con { success, message, user }.
     */
    async register(userData) {
        if (this.isBackendOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                const data = await response.json();
                return data;
            } catch (error) {
                console.warn('Fallo en petición de registro al backend, usando fallback local.');
            }
        }

        // --- MODO FALLBACK (LocalStorage) ---
        const users = JSON.parse(localStorage.getItem('dondejuan_users') || '[]');
        const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
        if (exists) {
            return { success: false, message: 'Ya existe una cuenta registrada con este correo.' };
        }

        const newUser = {
            id: 'user-' + Date.now(),
            name: userData.name,
            email: userData.email.toLowerCase(),
            phone: userData.phone || '',
            password: userData.password,
            points: 100,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('dondejuan_users', JSON.stringify(users));
        return { success: true, message: '¡Cuenta creada con éxito!', user: newUser };
    },

    /**
     * Inicia sesión con correo y contraseña.
     * @param {string} email - Correo del usuario.
     * @param {string} password - Contraseña en texto plano.
     * @returns {Promise<Object>} Respuesta con { success, message, user }.
     */
    async login(email, password) {
        if (this.isBackendOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                return data;
            } catch (error) {
                console.warn('Fallo en petición de login al backend, usando fallback local.');
            }
        }

        // --- MODO FALLBACK (LocalStorage) ---
        const users = JSON.parse(localStorage.getItem('dondejuan_users') || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            return { success: true, message: `¡Bienvenido de vuelta, ${user.name}!`, user };
        }
        return { success: false, message: 'Correo electrónico o contraseña incorrectos.' };
    },

    /**
     * Obtiene los productos del catálogo desde el backend o catálogo local.
     * @param {string} category - Categoría a filtrar (opcional).
     * @param {string} search - Término de búsqueda (opcional).
     * @returns {Promise<Array>} Lista de productos.
     */
    async getProducts(category = 'todos', search = '') {
        if (this.isBackendOnline) {
            try {
                const params = new URLSearchParams();
                if (category && category !== 'todos') params.append('category', category);
                if (search) params.append('search', search);

                const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
                const data = await response.json();
                if (data.success && Array.isArray(data.products)) {
                    return data.products;
                }
            } catch (error) {
                console.warn('Fallo al obtener productos del backend, usando catálogo embebido.');
            }
        }

        // Si el backend no está disponible, usamos la constante global MENU_PRODUCTS
        if (typeof MENU_PRODUCTS !== 'undefined') {
            return MENU_PRODUCTS.filter(p => {
                const matchCategory = category === 'todos' || p.category === category;
                const query = search.toLowerCase().trim();
                const matchSearch = !query ||
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.categoryName.toLowerCase().includes(query);
                return matchCategory && matchSearch;
            });
        }
        return [];
    },

    /**
     * Valida un código de cupón promocional.
     * @param {string} code - Código a validar (ej: DONDEJUAN10).
     * @returns {Promise<Object>} Resultado con el cupón o error.
     */
    async validateCoupon(code) {
        if (this.isBackendOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                return await response.json();
            } catch (error) {
                console.warn('Fallo al validar cupón en backend, usando lógica local.');
            }
        }

        // Fallback de validación de cupones local
        const upper = code.trim().toUpperCase();
        if (upper === 'DONDEJUAN10') {
            return { success: true, coupon: { code: 'DONDEJUAN10', type: 'percentage', value: 10 } };
        } else if (upper === 'HAMBURGUESA5K' || upper === 'CLIENTE5K') {
            return { success: true, coupon: { code: upper, type: 'fixed', value: 5000 } };
        }
        return { success: false, message: 'Cupón no válido o expirado.' };
    },

    /**
     * Registra un nuevo pedido en el sistema.
     * @param {Object} orderData - Datos completos del pedido y cliente.
     * @returns {Promise<Object>} Pedido confirmado con número de orden.
     */
    async createOrder(orderData) {
        if (this.isBackendOnline) {
            try {
                const response = await fetch(`${API_BASE_URL}/orders`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });
                return await response.json();
            } catch (error) {
                console.warn('Fallo al enviar orden al backend, guardando localmente.');
            }
        }

        // Fallback local: Generamos código y almacenamos en localStorage
        const orderId = 'DJ-' + Math.floor(1000 + Math.random() * 9000);
        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            ...orderData,
            status: 'En preparación',
            estimatedTime: '30 - 45 minutos'
        };

        const orders = JSON.parse(localStorage.getItem('dondejuan_orders') || '[]');
        orders.unshift(newOrder);
        localStorage.setItem('dondejuan_orders', JSON.stringify(orders));

        return { success: true, message: '¡Pedido registrado con éxito!', order: newOrder };
    }
};

// Ejecutar verificación de conexión de inmediato al cargar el script
DondeJuanAPI.checkHealth();

