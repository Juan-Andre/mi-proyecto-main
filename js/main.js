// ============================================================================
// ARCHIVO PRINCIPAL GLOBAL (COORDINADOR DE LA APLICACIÓN WEB)
// ============================================================================
// Este archivo actúa como el punto de entrada principal para el frontend,
// coordinando la inicialización del menú móvil, la sincronización de la cabecera,
// la detección de parámetros de URL y la vinculación de eventos globales.

// ----------------------------------------------------------------------------
// DATOS DE RESPALDO DEL MENÚ (FALLBACK LOCAL)
// ----------------------------------------------------------------------------
// Se mantienen disponibles para garantizar funcionamiento sin conexión
const MENU_PRODUCTS = [
    {
        id: 'hamb-clasica',
        name: 'Hamburguesa Clásica',
        category: 'hamburguesas',
        categoryName: 'Hamburguesas',
        price: 16000,
        image: 'img/hamburguesa clasica.png',
        badge: 'Clásica',
        badgeColor: '#e65100',
        description: '150g de carne 100% res a la parrilla, queso cheddar fundido, lechuga fresca, rodajas de tomate y salsa especial Donde Juan.'
    },
    {
        id: 'hamb-deluxe',
        name: 'Hamburguesa Deluxe',
        category: 'hamburguesas',
        categoryName: 'Hamburguesas',
        price: 22000,
        image: 'img/hamburguesa deluxe.png',
        badge: '⭐ Más Vendida',
        badgeColor: '#b71c1c',
        description: '200g de carne angus seleccionada, tocineta ahumada crujiente, doble queso cheddar, cebolla caramelizada y salsa tártara.'
    },
    {
        id: 'hamb-bbq',
        name: 'Hamburguesa BBQ Bacon Fest',
        category: 'hamburguesas',
        categoryName: 'Hamburguesas',
        price: 24000,
        image: 'img/hamburguesa deluxe.png',
        badge: '🔥 Especial',
        badgeColor: '#c2185b',
        description: 'Doble carne a la brasa con salsa barbacoa ahumada, tiras de tocineta extra crujiente, pepinillos y aros de cebolla dorados.'
    },
    {
        id: 'hamb-queso-extra',
        name: 'Hamburguesa Cuatro Quesos',
        category: 'hamburguesas',
        categoryName: 'Hamburguesas',
        price: 23000,
        image: 'img/hamburguesa clasica.png',
        badge: 'Queso Extremo',
        badgeColor: '#f57f17',
        description: 'Carne jugosa 160g cubierta de queso cheddar fundido, mozzarella derretido, parmesano gratinado y suave crema de queso azul.'
    },
    {
        id: 'combo-juan',
        name: 'Combo Especial Donde Juan',
        category: 'combos',
        categoryName: 'Combos Especiales',
        price: 28000,
        image: 'img/combo especial.png',
        badge: '👑 Combo Estrella',
        badgeColor: '#b71c1c',
        description: 'Hamburguesa Clásica doble carne + Porción grande de papas a la francesa crujientes + Bebida personal fría de 400ml.'
    },
    {
        id: 'combo-deluxe',
        name: 'Combo Deluxe Premium',
        category: 'combos',
        categoryName: 'Combos Especiales',
        price: 34000,
        image: 'img/combo especial.png',
        badge: '⭐ Recomendado',
        badgeColor: '#6a1b9a',
        description: 'Hamburguesa Deluxe con tocineta crocante + Papas rústicas con queso cheddar fundido + Gaseosa o limonada natural.'
    },
    {
        id: 'combo-pareja',
        name: 'Mega Combo Dúo Parrillero',
        category: 'combos',
        categoryName: 'Combos Especiales',
        price: 49000,
        image: 'img/promoción.png',
        badge: '👫 Para Dos',
        badgeColor: '#00838f',
        description: '2 Hamburguesas completas a elección + 2 Porciones de papas francesas + 2 Bebidas personales + salsas artesanales de la casa.'
    },
    {
        id: 'acomp-papas-francesas',
        name: 'Papas Francesas Clásicas',
        category: 'acompanamientos',
        categoryName: 'Acompañamientos',
        price: 8000,
        image: 'img/acompañamientos.png',
        badge: 'Crujientes',
        badgeColor: '#f57f17',
        description: 'Papas seleccionadas cortadas en bastones, doradas a la perfección con el toque exacto de sal marina y dip de mayonesa de ajo.'
    },
    {
        id: 'acomp-aros-cebolla',
        name: 'Aros de Cebolla Dorados',
        category: 'acompanamientos',
        categoryName: 'Acompañamientos',
        price: 10000,
        image: 'img/acompañamientos.png',
        badge: 'Apanados',
        badgeColor: '#e65100',
        description: '10 aros de cebolla fresca apanados en tempura crujiente, servidos con salsa barbacoa ahumada y salsa tártara casera.'
    },
    {
        id: 'acomp-papas-cheddar-bacon',
        name: 'Papas Rústicas con Cheddar y Tocineta',
        category: 'acompanamientos',
        categoryName: 'Acompañamientos',
        price: 14000,
        image: 'img/acompañamientos.png',
        badge: '🔥 Favorito',
        badgeColor: '#c62828',
        description: 'Papas en cascos rústicos horneadas y fritas, bañadas en abundante queso cheddar caliente y trozos de tocineta crujiente.'
    },
    {
        id: 'bebida-gaseosa',
        name: 'Gaseosa Personal 400ml',
        category: 'bebidas',
        categoryName: 'Bebidas',
        price: 5000,
        image: 'img/combo especial.png',
        badge: 'Fría',
        badgeColor: '#1565c0',
        description: 'Elige tu favorita bien helada: Coca-Cola original, Coca-Cola Zero, Sprite, Manzana Postobón o Colombiana.'
    },
    {
        id: 'bebida-limonada',
        name: 'Limonada Natural / Cerezada',
        category: 'bebidas',
        categoryName: 'Bebidas',
        price: 8000,
        image: 'img/acompañamientos.png',
        badge: '100% Natural',
        badgeColor: '#2e7d32',
        description: 'Jugo natural de limones frescos recién exprimidos, servido granizado con opción de hierbabuena fresca o cerezas dulces.'
    }
];

// ----------------------------------------------------------------------------
// CONTROL DEL MENÚ MÓVIL DESPLEGABLE
// ----------------------------------------------------------------------------
const menuToggle = document.querySelector('.menu-toggle');
const mobileOverlay = document.getElementById('mobileOverlay');

/**
 * Abre o cierra el menú móvil alternando la clase 'active'.
 */
function toggleMenu() {
    if (mobileOverlay) mobileOverlay.classList.toggle('active');
}

/**
 * Cierra forzosamente el menú móvil.
 */
function closeMenu() {
    if (mobileOverlay) mobileOverlay.classList.remove('active');
}

// Vinculamos eventos del botón de hamburguesa y clic fuera del menú
if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', (event) => {
        // Si el clic fue directamente en el fondo oscuro, cerramos el menú
        if (event.target === mobileOverlay) closeMenu();
    });
}

// Cerramos el menú al hacer clic en cualquier enlace de navegación
document.querySelectorAll('.mobile-nav-dropdown a:not(.btn-usuario)').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// ----------------------------------------------------------------------------
// INICIALIZACIÓN GLOBAL CUANDO EL DOM ESTÁ LISTO (DOMContentLoaded)
// ----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializamos la base de datos de usuarios si es la primera vez que se abre
    if (!localStorage.getItem('dondejuan_users')) {
        const defaultUsers = [
            {
                id: 'demo-user-1',
                name: 'Juan Pérez',
                email: 'juan@ejemplo.com',
                phone: '300 123 4567',
                password: 'password123',
                points: 150,
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('dondejuan_users', JSON.stringify(defaultUsers));
    }

    // 2. Sincronizamos la barra de navegación según el estado de la sesión
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }

    // 3. Verificamos si hay un hash en la URL para cambiar de pestaña en login.html
    if (typeof handleHashTab === 'function') {
        handleHashTab();
    }

    // 4. Sincronizamos los contadores e items del carrito de compras
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }

    // 5. Verificamos si la URL contiene el parámetro ?openCart=true para abrir el carrito
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openCart') === 'true' && typeof openCartDrawer === 'function') {
        setTimeout(openCartDrawer, 300);
    }

    // 6. Asignamos eventos de apertura y cierre del carrito
    document.getElementById('btnOpenCartHeader')?.addEventListener('click', () => {
        if (typeof openCartDrawer === 'function') openCartDrawer();
    });

    document.getElementById('btnOpenCartMobile')?.addEventListener('click', () => {
        closeMenu();
        if (typeof openCartDrawer === 'function') openCartDrawer();
    });

    document.getElementById('btnFloatingCart')?.addEventListener('click', () => {
        if (typeof openCartDrawer === 'function') openCartDrawer();
    });

    document.getElementById('btnCloseCart')?.addEventListener('click', () => {
        if (typeof closeCartDrawer === 'function') closeCartDrawer();
    });

    document.getElementById('cartDrawerOverlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('cartDrawerOverlay') && typeof closeCartDrawer === 'function') {
            closeCartDrawer();
        }
    });

    // 7. Botón para vaciar el carrito
    document.getElementById('btnClearCart')?.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas vaciar tu carrito?')) {
            if (typeof clearCart === 'function') clearCart();
        }
    });

    // 8. Aplicación de cupones de descuento
    document.getElementById('btnApplyCoupon')?.addEventListener('click', () => {
        if (typeof applyCouponCode === 'function') applyCouponCode();
    });

    document.getElementById('couponCodeInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (typeof applyCouponCode === 'function') applyCouponCode();
        }
    });

    // 9. Apertura y cierre del modal de Checkout
    document.getElementById('btnOpenCheckout')?.addEventListener('click', () => {
        if (typeof openCheckoutModal === 'function') openCheckoutModal();
    });

    document.getElementById('btnCloseCheckoutModal')?.addEventListener('click', () => {
        if (typeof closeCheckoutModal === 'function') closeCheckoutModal();
    });

    document.getElementById('checkoutModalOverlay')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('checkoutModalOverlay') && typeof closeCheckoutModal === 'function') {
            closeCheckoutModal();
        }
    });

    // 10. Envío de órdenes (WhatsApp y En línea)
    document.getElementById('formCheckout')?.addEventListener('submit', (e) => {
        if (typeof handleOrderWhatsApp === 'function') handleOrderWhatsApp(e);
    });

    document.getElementById('btnSubmitOrderOnline')?.addEventListener('click', () => {
        if (typeof handleOrderOnline === 'function') handleOrderOnline();
    });

    document.getElementById('btnCloseTicket')?.addEventListener('click', () => {
        if (typeof closeOrderSuccessModal === 'function') closeOrderSuccessModal();
    });

    document.getElementById('orderSuccessModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('orderSuccessModal') && typeof closeOrderSuccessModal === 'function') {
            closeOrderSuccessModal();
        }
    });

    // 11. Control de selección de métodos de pago en el modal
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-method-card').forEach(card => card.classList.remove('active'));
            radio.closest('.payment-method-card')?.classList.add('active');

            // Si el método es efectivo, mostramos el campo para calcular el cambio
            const cashGroup = document.getElementById('cashChangeGroup');
            if (cashGroup) {
                cashGroup.style.display = radio.value === 'Efectivo' ? 'block' : 'none';
            }
        });
    });

    // 12. Inicialización del catálogo en menu.html
    const menuCatalogGrid = document.getElementById('menuCatalogGrid');
    if (menuCatalogGrid && typeof renderMenuCatalog === 'function') {
        renderMenuCatalog();

        // Botones de filtro por categoría
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategoryFilter = btn.getAttribute('data-category') || 'todos';
                renderMenuCatalog();
            });
        });

        // Entrada del buscador en tiempo real
        const searchInput = document.getElementById('menuSearchInput');
        const clearSearchBtn = document.getElementById('btnClearSearch');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value;
                if (clearSearchBtn) {
                    clearSearchBtn.classList.toggle('hidden', !currentSearchQuery);
                }
                renderMenuCatalog();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                currentSearchQuery = '';
                clearSearchBtn.classList.add('hidden');
                renderMenuCatalog();
                searchInput?.focus();
            });
        }
    }
});

