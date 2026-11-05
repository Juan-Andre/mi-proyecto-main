// ============================================================================
// MÓDULO DEL MENÚ DE PLATILLOS (CATÁLOGO, FILTROS Y BÚSQUEDA)
// ============================================================================
// Este archivo controla la visualización del menú en menu.html, permitiendo
// filtrar por categorías, buscar productos en tiempo real y seleccionar cantidades.

// Variables de estado del menú
let currentCategoryFilter = 'todos'; // Categoría actualmente seleccionada
let currentSearchQuery = '';         // Término de búsqueda escrito por el usuario

/**
 * Renderiza la cuadrícula de platillos en el DOM según la categoría y búsqueda activas.
 */
async function renderMenuCatalog() {
    const grid = document.getElementById('menuCatalogGrid');
    const status = document.getElementById('menuResultsStatus');
    if (!grid) return; // Si no estamos en menu.html, salimos sin error

    // 1. Obtenemos los productos usando el cliente de la API (con soporte de backend o catálogo local)
    const products = await DondeJuanAPI.getProducts(currentCategoryFilter, currentSearchQuery);

    // 2. Actualizamos los contadores numéricos en los botones de categoría
    const allProducts = typeof MENU_PRODUCTS !== 'undefined' ? MENU_PRODUCTS : products;
    const countTodos = document.getElementById('countTodos');
    const countHamburguesas = document.getElementById('countHamburguesas');
    const countCombos = document.getElementById('countCombos');
    const countAcompanamientos = document.getElementById('countAcompanamientos');
    const countBebidas = document.getElementById('countBebidas');

    if (countTodos) countTodos.textContent = allProducts.length;
    if (countHamburguesas) countHamburguesas.textContent = allProducts.filter(p => p.category === 'hamburguesas').length;
    if (countCombos) countCombos.textContent = allProducts.filter(p => p.category === 'combos').length;
    if (countAcompanamientos) countAcompanamientos.textContent = allProducts.filter(p => p.category === 'acompanamientos').length;
    if (countBebidas) countBebidas.textContent = allProducts.filter(p => p.category === 'bebidas').length;

    // 3. Mostramos mensaje informativo de búsqueda si aplica
    if (status) {
        if (currentSearchQuery) {
            status.textContent = `Mostrando ${products.length} resultado(s) para "${currentSearchQuery}"`;
        } else {
            status.textContent = '';
        }
    }

    // 4. Si no hay platillos que coincidan con la búsqueda
    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <span style="font-size: 48px; display: block; margin-bottom: 10px;">🔍</span>
                <h3 style="font-family: 'Oswald', sans-serif; font-size: 24px; color: #444;">No encontramos ningún platillo</h3>
                <p style="color: #777;">Intenta con otra búsqueda o selecciona otra categoría.</p>
                <button type="button" class="btn-clear-search-action" onclick="resetMenuFilters()" style="background: rgb(252, 178, 40); border: none; padding: 8px 18px; border-radius: 20px; font-weight: 700; cursor: pointer; color: #7a4600; margin-top: 10px;">
                    Ver todos los platillos
                </button>
            </div>
        `;
        return;
    }

    // 5. Construimos el HTML de las tarjetas de platillos
    let cardsHtml = '';
    products.forEach(p => {
        cardsHtml += `
            <article class="menu-card" data-id="${p.id}">
                <div class="menu-card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" class="menu-card-img" loading="lazy">
                    <span class="menu-card-badge" style="background-color: ${p.badgeColor};">${p.badge}</span>
                </div>
                <div class="menu-card-body">
                    <span class="menu-card-category">${p.categoryName}</span>
                    <h3 class="menu-card-title">${p.name}</h3>
                    <p class="menu-card-desc">${p.description}</p>
                    <div class="menu-card-footer">
                        <span class="menu-card-price">${formatPrice(p.price)}</span>
                        <div class="menu-card-actions">
                            <div class="qty-control">
                                <button type="button" class="btn-qty" onclick="changeCardQty('${p.id}', -1)" aria-label="Disminuir cantidad">−</button>
                                <span class="qty-value" id="cardQty-${p.id}">1</span>
                                <button type="button" class="btn-qty" onclick="changeCardQty('${p.id}', 1)" aria-label="Aumentar cantidad">+</button>
                            </div>
                            <button type="button" class="btn-add-cart" onclick="addCardToCart('${p.id}')">
                                🛒 Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    });

    grid.innerHTML = cardsHtml;
}

/**
 * Modifica el contador de cantidad de una tarjeta antes de agregarla al carrito.
 * @param {string} productId - ID del producto.
 * @param {number} delta - Cambio en la cantidad (-1 o +1).
 */
function changeCardQty(productId, delta) {
    const qtySpan = document.getElementById(`cardQty-${productId}`);
    if (!qtySpan) return;
    let qty = parseInt(qtySpan.textContent, 10) || 1;
    qty = Math.max(1, qty + delta); // No permitimos cantidades menores a 1
    qtySpan.textContent = qty;
}

/**
 * Agrega el producto al carrito con la cantidad seleccionada en la tarjeta.
 * @param {string} productId - ID del producto.
 */
function addCardToCart(productId) {
    const qtySpan = document.getElementById(`cardQty-${productId}`);
    const qty = qtySpan ? parseInt(qtySpan.textContent, 10) || 1 : 1;

    // Llamamos a la función global del carrito
    if (typeof addToCart === 'function') {
        addToCart(productId, qty);
    }

    // Reiniciamos el contador visual de la tarjeta a 1
    if (qtySpan) qtySpan.textContent = '1';
}

/**
 * Restablece los filtros de búsqueda y categoría para mostrar todos los productos.
 */
function resetMenuFilters() {
    currentCategoryFilter = 'todos';
    currentSearchQuery = '';

    const searchInput = document.getElementById('menuSearchInput');
    if (searchInput) searchInput.value = '';

    const clearSearchBtn = document.getElementById('btnClearSearch');
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === 'todos');
    });

    renderMenuCatalog();
}

