// ============================================================================
// MÓDULO DEL CARRITO DE COMPRAS Y SISTEMA DE PEDIDOS (CHECKOUT)
// ============================================================================
// Este archivo controla todo el ciclo de vida del carrito de compras:
// agregar productos, modificar cantidades, aplicar cupones, calcular totales,
// desplegar el drawer lateral, abrir el modal de checkout y enviar órdenes.

// ----------------------------------------------------------------------------
// OPERACIONES DE ALMACENAMIENTO DEL CARRITO
// ----------------------------------------------------------------------------

/**
 * Obtiene la lista de productos del carrito guardada en localStorage.
 * @returns {Array} Arreglo de items en el carrito [{ id, name, price, image, quantity }].
 */
function getCart() {
    try {
        const cart = localStorage.getItem('dondejuan_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error('Error al leer el carrito de localStorage:', e);
        return [];
    }
}

/**
 * Guarda los productos en localStorage y refresca la interfaz del carrito.
 * @param {Array} cart - Lista actualizada de productos.
 */
function saveCart(cart) {
    localStorage.setItem('dondejuan_cart', JSON.stringify(cart));
    updateCartUI(); // Mantiene sincronizada la vista inmediatamente
}

/**
 * Obtiene el cupón de descuento actualmente aplicado.
 * @returns {Object|null}
 */
function getAppliedCoupon() {
    try {
        const coupon = localStorage.getItem('dondejuan_coupon');
        return coupon ? JSON.parse(coupon) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Guarda o elimina el cupón aplicado en localStorage.
 * @param {Object|null} coupon - Objeto con datos del cupón o null para eliminarlo.
 */
function setAppliedCoupon(coupon) {
    if (coupon) {
        localStorage.setItem('dondejuan_coupon', JSON.stringify(coupon));
    } else {
        localStorage.removeItem('dondejuan_coupon');
    }
}

/**
 * Formatea un número como moneda colombiana (ej: $22.000).
 * @param {number} number - Cantidad numérica a formatear.
 * @returns {string} Texto formateado con signo pesos y separadores de miles.
 */
function formatPrice(number) {
    return '$' + number.toLocaleString('es-CO');
}

// ----------------------------------------------------------------------------
// AGREGAR, MODIFICAR Y ELIMINAR PLATILLOS DEL CARRITO
// ----------------------------------------------------------------------------

/**
 * Agrega un platillo al carrito de compras.
 * Si el producto ya existía en el carrito, incrementa su cantidad.
 * @param {string} productId - ID único del producto.
 * @param {number} quantity - Cantidad a agregar (por defecto 1).
 */
function addToCart(productId, quantity = 1) {
    // Buscamos la información del producto en el catálogo global
    const product = typeof MENU_PRODUCTS !== 'undefined'
        ? MENU_PRODUCTS.find(p => p.id === productId)
        : null;

    if (!product) {
        console.error('Producto no encontrado en el catálogo:', productId);
        return;
    }

    const cart = getCart();
    // Buscamos si ya se encuentra en el carrito
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        // Incrementamos la cantidad del producto existente
        cart[existingIndex].quantity += quantity;
    } else {
        // Agregamos como nuevo item al carrito
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    // Persistimos los cambios
    saveCart(cart);

    // Activamos la animación de pulso en el botón flotante del carrito
    const floatingBtn = document.getElementById('btnFloatingCart');
    if (floatingBtn) {
        floatingBtn.classList.remove('pulse');
        void floatingBtn.offsetWidth; // Forzamos reflow en el navegador para reiniciar animación
        floatingBtn.classList.add('pulse');
    }

    // Mostramos mensaje flotante (toast) de confirmación al usuario
    showToast(`🛒 ¡${quantity > 1 ? quantity + 'x ' : ''}${product.name} agregado al carrito!`);
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * Si la nueva cantidad es 0 o menor, el producto se elimina automáticamente.
 * @param {string} productId - ID del producto.
 * @param {number} newQuantity - Nueva cantidad deseada.
 */
function updateCartItemQuantity(productId, newQuantity) {
    let cart = getCart();
    if (newQuantity <= 0) {
        // Filtramos para remover el item
        cart = cart.filter(item => item.id !== productId);
    } else {
        // Actualizamos la cantidad del item encontrado
        const item = cart.find(item => item.id === productId);
        if (item) item.quantity = newQuantity;
    }
    saveCart(cart);
}

/**
 * Elimina completamente un producto del carrito.
 * @param {string} productId - ID del producto a remover.
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    showToast('🗑️ Producto eliminado del carrito');
}

/**
 * Vacía todos los productos del carrito y remueve cupones aplicados.
 */
function clearCart() {
    saveCart([]);
    setAppliedCoupon(null);
    showToast('🧹 Carrito vaciado');
}

// ----------------------------------------------------------------------------
// CÁLCULO DE TOTALES, ENVÍO Y DESCUENTOS
// ----------------------------------------------------------------------------

/**
 * Calcula los subtotales, descuentos de cupones, costo de envío y total final.
 * @returns {Object} Desglose completo de valores financieros del pedido.
 */
function calculateCartTotals() {
    const cart = getCart();

    // 1. Calculamos el subtotal sumando (precio * cantidad) de cada item
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // 2. Sumamos la cantidad total de artículos
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // 3. Verificamos y calculamos el descuento si hay un cupón activo
    let discount = 0;
    const coupon = getAppliedCoupon();
    if (coupon) {
        if (coupon.type === 'percentage') {
            discount = Math.round(subtotal * (coupon.value / 100));
        } else if (coupon.type === 'fixed') {
            discount = Math.min(subtotal, coupon.value);
        }
    }

    // 4. Regla de negocio para envíos:
    // Compras iguales o superiores a $30.000 tienen envío GRATIS ($0). De lo contrario, cuesta $5.000.
    const shippingThreshold = 30000;
    const shippingCost = (subtotal >= shippingThreshold || subtotal === 0) ? 0 : 5000;

    // 5. Total a pagar (evitando valores negativos)
    const total = Math.max(0, subtotal - discount + shippingCost);

    return {
        subtotal,
        discount,
        shippingCost,
        shippingThreshold,
        total,
        totalItems,
        coupon
    };
}

// ----------------------------------------------------------------------------
// RENDERIZADO VISUAL DEL CARRITO (DRAWER LATERAL Y CONTADORES)
// ----------------------------------------------------------------------------

/**
 * Actualiza los elementos del DOM relacionados con el carrito (insignias, lista y totales).
 */
function updateCartUI() {
    const totals = calculateCartTotals();
    const cart = getCart();

    // 1. Actualizamos insignias numéricas en la barra de navegación y botón flotante
    const badges = [
        document.getElementById('cartBadgeHeader'),
        document.getElementById('cartBadgeMobile'),
        document.getElementById('floatingCartCount')
    ];

    badges.forEach(badge => {
        if (badge) badge.textContent = totals.totalItems;
    });

    // 2. Actualizamos el monto en el botón flotante
    const floatingTotal = document.getElementById('floatingCartTotal');
    if (floatingTotal) {
        floatingTotal.textContent = formatPrice(totals.total);
    }

    // 3. Actualizamos texto del encabezado del drawer (ej: "3 productos")
    const cartItemsCountText = document.getElementById('cartItemsCountText');
    if (cartItemsCountText) {
        cartItemsCountText.textContent = `${totals.totalItems} ${totals.totalItems === 1 ? 'producto' : 'productos'}`;
    }

    // 4. Renderizamos el cuerpo del carrito (lista de items o estado vacío)
    const cartDrawerBody = document.getElementById('cartDrawerBody');
    const cartDrawerFooter = document.getElementById('cartDrawerFooter');

    if (cartDrawerBody) {
        if (cart.length === 0) {
            // Estado vacío: invitamos al usuario a explorar el menú
            cartDrawerBody.innerHTML = `
                <div class="cart-empty-state">
                    <span class="cart-empty-icon">🍔</span>
                    <h4>Tu carrito está vacío</h4>
                    <p>¡Explora nuestro delicioso menú y agrega tus platillos favoritos!</p>
                    <button type="button" class="btn-explore-menu-cart" onclick="closeCartDrawer()">
                        Ver Platillos
                    </button>
                </div>
            `;
            if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
        } else {
            if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';

            // Generamos las filas de productos dinámicamente
            let itemsHtml = '';
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                itemsHtml += `
                    <div class="cart-item-row" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
                        <div class="cart-item-details">
                            <h4 class="cart-item-name" title="${item.name}">${item.name}</h4>
                            <div class="cart-item-unit-price">${formatPrice(item.price)} c/u</div>
                            <div class="cart-item-controls">
                                <div class="qty-control">
                                    <button type="button" class="btn-qty" onclick="updateCartItemQuantity('${item.id}', ${item.quantity - 1})">−</button>
                                    <span class="qty-value">${item.quantity}</span>
                                    <button type="button" class="btn-qty" onclick="updateCartItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                                </div>
                                <button type="button" class="btn-remove-item" onclick="removeFromCart('${item.id}')" title="Eliminar del carrito">🗑️</button>
                            </div>
                        </div>
                        <div class="cart-item-subtotal">${formatPrice(itemTotal)}</div>
                    </div>
                `;
            });
            cartDrawerBody.innerHTML = itemsHtml;
        }
    }

    // 5. Actualizamos el resumen de precios en el pie del drawer
    const subtotalText = document.getElementById('cartSubtotalText');
    const discountLine = document.getElementById('discountLine');
    const discountText = document.getElementById('cartDiscountText');
    const shippingText = document.getElementById('cartShippingText');
    const totalText = document.getElementById('cartTotalText');
    const btnCheckoutPrice = document.getElementById('btnCheckoutPrice');

    if (subtotalText) subtotalText.textContent = formatPrice(totals.subtotal);

    if (discountLine && discountText) {
        if (totals.discount > 0) {
            discountLine.classList.remove('hidden');
            discountText.textContent = `-${formatPrice(totals.discount)} (${totals.coupon ? totals.coupon.code : ''})`;
        } else {
            discountLine.classList.add('hidden');
        }
    }

    if (shippingText) {
        if (totals.shippingCost === 0 && totals.subtotal > 0) {
            shippingText.innerHTML = '<strong style="color: #2e7d32;">¡GRATIS! 🎉</strong>';
        } else {
            shippingText.textContent = formatPrice(totals.shippingCost);
        }
    }

    // 6. Barra de progreso dinámica hacia el envío gratis
    const progressFill = document.getElementById('shippingProgressFill');
    const progressText = document.getElementById('shippingProgressText');
    const progressBox = document.getElementById('shippingProgressBox');

    if (progressBox && progressFill && progressText) {
        if (totals.subtotal === 0) {
            progressFill.style.width = '0%';
            progressText.textContent = 'Envío gratis en compras mayores a $30.000';
        } else if (totals.subtotal >= totals.shippingThreshold) {
            progressFill.style.width = '100%';
            progressText.innerHTML = '🎉 <strong>¡Felicidades! Tienes Envío Gratis</strong>';
        } else {
            const missing = totals.shippingThreshold - totals.subtotal;
            const percentage = Math.min(100, Math.round((totals.subtotal / totals.shippingThreshold) * 100));
            progressFill.style.width = `${percentage}%`;
            progressText.textContent = `Agrega ${formatPrice(missing)} más para Envío Gratis`;
        }
    }

    if (totalText) totalText.textContent = formatPrice(totals.total);
    if (btnCheckoutPrice) btnCheckoutPrice.textContent = formatPrice(totals.total);
}

// ----------------------------------------------------------------------------
// ABRIR Y CERRAR EL DRAWER LATERAL DEL CARRITO
// ----------------------------------------------------------------------------

function openCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo
    } else {
        // Si el usuario está en index.html o login.html, lo redirigimos a menu.html con parámetro
        window.location.href = 'menu.html?openCart=true';
    }
}

function closeCartDrawer() {
    const overlay = document.getElementById('cartDrawerOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaura el scroll
    }
}

// ----------------------------------------------------------------------------
// APLICACIÓN DE CUPONES DE DESCUENTO
// ----------------------------------------------------------------------------

async function applyCouponCode() {
    const input = document.getElementById('couponCodeInput');
    const feedback = document.getElementById('couponFeedback');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        if (feedback) {
            feedback.className = 'coupon-feedback error';
            feedback.textContent = 'Por favor ingresa un código de cupón.';
        }
        return;
    }

    // Validamos el cupón con la API (o fallback local)
    const result = await DondeJuanAPI.validateCoupon(code);

    if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon);
        if (feedback) {
            feedback.className = 'coupon-feedback success';
            feedback.textContent = '✅ ¡Cupón aplicado exitosamente!';
        }
        updateCartUI();
    } else {
        if (feedback) {
            feedback.className = 'coupon-feedback error';
            feedback.textContent = result.message || '❌ Cupón inválido. Prueba DONDEJUAN10';
        }
    }
}

// ----------------------------------------------------------------------------
// MODAL DE CHECKOUT Y ENVÍO DE PEDIDOS
// ----------------------------------------------------------------------------

function openCheckoutModal() {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('⚠️ Tu carrito está vacío. Agrega platillos antes de ordenar.');
        return;
    }

    closeCartDrawer();
    const modal = document.getElementById('checkoutModalOverlay');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const totals = calculateCartTotals();

    // Rellenamos el resumen de la orden dentro del modal
    const modalItemsCount = document.getElementById('modalItemsCount');
    const modalItemsMiniList = document.getElementById('modalItemsMiniList');
    const modalTotalBanner = document.getElementById('modalTotalBanner');

    if (modalItemsCount) modalItemsCount.textContent = totals.totalItems;
    if (modalTotalBanner) modalTotalBanner.textContent = formatPrice(totals.total);

    if (modalItemsMiniList) {
        let miniHtml = '';
        cart.forEach(item => {
            miniHtml += `
                <div class="mini-item-row">
                    <span>${item.quantity}x ${item.name}</span>
                    <strong>${formatPrice(item.price * item.quantity)}</strong>
                </div>
            `;
        });
        if (totals.discount > 0) {
            miniHtml += `
                <div class="mini-item-row" style="color: #2e7d32;">
                    <span>Descuento aplicado:</span>
                    <strong>-${formatPrice(totals.discount)}</strong>
                </div>
            `;
        }
        miniHtml += `
            <div class="mini-item-row" style="color: #666;">
                <span>Costo de envío:</span>
                <span>${totals.shippingCost === 0 ? 'GRATIS' : formatPrice(totals.shippingCost)}</span>
            </div>
        `;
        modalItemsMiniList.innerHTML = miniHtml;
    }

    // Si el usuario tiene sesión activa, autocompletamos su nombre y teléfono
    if (typeof getCurrentUser === 'function') {
        const currentUser = getCurrentUser();
        const orderName = document.getElementById('orderName');
        const orderPhone = document.getElementById('orderPhone');

        if (currentUser) {
            if (orderName && !orderName.value) orderName.value = currentUser.name;
            if (orderPhone && !orderPhone.value) orderPhone.value = currentUser.phone || '';
        }
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModalOverlay');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ----------------------------------------------------------------------------
// ENVÍO DE PEDIDO POR WHATSAPP O DIRECTO EN LÍNEA
// ----------------------------------------------------------------------------

/**
 * Construye el mensaje formateado y redirige al chat de WhatsApp oficial del restaurante.
 */
async function handleOrderWhatsApp(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('orderName')?.value.trim();
    const phone = document.getElementById('orderPhone')?.value.trim();
    const address = document.getElementById('orderAddress')?.value.trim();
    const notes = document.getElementById('orderNotes')?.value.trim() || 'Ninguna';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Efectivo';
    const cashChange = document.getElementById('cashChange')?.value.trim();

    if (!name || !phone || !address) {
        alert('⚠️ Por favor completa los campos obligatorios: Nombre, Teléfono y Dirección.');
        return;
    }

    const cart = getCart();
    const totals = calculateCartTotals();

    // Enviamos el pedido a la API
    const orderPayload = {
        customer: { name, phone, address },
        items: cart,
        totals,
        paymentMethod,
        notes
    };

    const result = await DondeJuanAPI.createOrder(orderPayload);
    const orderId = result.order?.id || 'DJ-' + Math.floor(1000 + Math.random() * 9000);

    // Estructuramos el mensaje de WhatsApp con formato amigable
    let msg = `🍔 *¡NUEVO PEDIDO EN DONDE JUAN!* 🍔\n`;
    msg += `------------------------------------\n`;
    msg += `🔖 *Orden:* #${orderId}\n`;
    msg += `👤 *Cliente:* ${name}\n`;
    msg += `📱 *Teléfono:* ${phone}\n`;
    msg += `📍 *Dirección:* ${address}\n`;
    if (notes !== 'Ninguna') msg += `📝 *Notas:* ${notes}\n`;
    msg += `💳 *Método de Pago:* ${paymentMethod}\n`;
    if (paymentMethod === 'Efectivo' && cashChange) {
        msg += `💵 *Paga con:* ${cashChange}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `📋 *DETALLE DEL PEDIDO:*\n`;

    cart.forEach(item => {
        msg += `• ${item.quantity}x ${item.name} (${formatPrice(item.price * item.quantity)})\n`;
    });

    msg += `------------------------------------\n`;
    msg += `💵 *Subtotal:* ${formatPrice(totals.subtotal)}\n`;
    if (totals.discount > 0) {
        msg += `🎉 *Descuento:* -${formatPrice(totals.discount)}\n`;
    }
    msg += `🛵 *Envío:* ${totals.shippingCost === 0 ? 'GRATIS' : formatPrice(totals.shippingCost)}\n`;
    msg += `🔥 *TOTAL A PAGAR: ${formatPrice(totals.total)}*\n`;
    msg += `------------------------------------\n`;
    msg += `¡Muchas gracias! Quedo a la espera de la confirmación.`;

    const encoded = encodeURI(msg);
    const whatsappUrl = `https://wa.me/573001234567?text=${encoded}`;

    // Abrimos WhatsApp en una pestaña nueva
    window.open(whatsappUrl, '_blank');

    // Mostramos modal de confirmación y vaciamos el carrito
    closeCheckoutModal();
    showOrderSuccessModal(orderId, name, address, totals, cart, paymentMethod, whatsappUrl);
    clearCart();
}

/**
 * Registra el pedido en línea directamente en el servidor sin pasar por WhatsApp.
 */
async function handleOrderOnline() {
    const name = document.getElementById('orderName')?.value.trim();
    const phone = document.getElementById('orderPhone')?.value.trim();
    const address = document.getElementById('orderAddress')?.value.trim();
    const notes = document.getElementById('orderNotes')?.value.trim() || 'Ninguna';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'Efectivo';

    if (!name || !phone || !address) {
        alert('⚠️ Por favor completa los campos obligatorios: Nombre, Teléfono y Dirección.');
        return;
    }

    const cart = getCart();
    const totals = calculateCartTotals();

    const orderPayload = {
        customer: { name, phone, address },
        items: cart,
        totals,
        paymentMethod,
        notes
    };

    const result = await DondeJuanAPI.createOrder(orderPayload);
    const orderId = result.order?.id || 'DJ-' + Math.floor(1000 + Math.random() * 9000);

    closeCheckoutModal();
    showOrderSuccessModal(orderId, name, address, totals, cart, paymentMethod);
    clearCart();
}

// ----------------------------------------------------------------------------
// MODAL DE FACTURA / TICKET DE CONFIRMACIÓN
// ----------------------------------------------------------------------------

function showOrderSuccessModal(orderId, name, address, totals, cart, paymentMethod, whatsappUrl = '') {
    const modal = document.getElementById('orderSuccessModal');
    const ticketCard = document.getElementById('orderTicketCard');
    const btnWhatsapp = document.getElementById('btnWhatsappTicket');

    if (!modal) return;

    if (ticketCard) {
        let ticketHtml = `
            <div class="ticket-header">
                <span class="ticket-id">Orden #${orderId}</span>
                <span class="ticket-time">Tiempo estimado: 30-45 min 🛵</span>
            </div>
            <div class="ticket-row"><span>Cliente:</span><strong>${name}</strong></div>
            <div class="ticket-row"><span>Entrega en:</span><span>${address}</span></div>
            <div class="ticket-row"><span>Método de pago:</span><span>${paymentMethod}</span></div>
            <div style="margin: 10px 0; border-top: 1px dashed #ccc; padding-top: 8px;">
        `;
        cart.forEach(item => {
            ticketHtml += `
                <div class="ticket-row">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>${formatPrice(item.price * item.quantity)}</span>
                </div>
            `;
        });
        ticketHtml += `
            </div>
            <div class="ticket-total">
                <span>TOTAL A PAGAR:</span>
                <strong style="color: #d92525; font-size: 20px;">${formatPrice(totals.total)}</strong>
            </div>
        `;
        ticketCard.innerHTML = ticketHtml;
    }

    if (btnWhatsapp) {
        if (whatsappUrl) {
            btnWhatsapp.href = whatsappUrl;
            btnWhatsapp.style.display = 'block';
        } else {
            btnWhatsapp.style.display = 'none';
        }
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ----------------------------------------------------------------------------
// MENSAJES TOAST FLOTANTES
// ----------------------------------------------------------------------------
let toastTimer;
function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove('hidden');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add('hidden');
    }, 2800);
}

