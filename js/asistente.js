document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('assistantPanel');
    const launcher = document.getElementById('assistantLauncher');
    const closeButton = document.getElementById('assistantClose');
    const form = document.getElementById('assistantForm');
    const input = document.getElementById('assistantInput');
    const messages = document.getElementById('assistantMessages');

    if (!panel || !launcher || !closeButton || !form || !input || !messages) return;

    const products = typeof MENU_PRODUCTS !== 'undefined' ? MENU_PRODUCTS : [];
    const normalize = (value) => value
        .toLocaleLowerCase('es')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const formatPrice = (price) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);

    function addMessage(text, sender, link) {
        const message = document.createElement('div');
        message.className = `assistant-message assistant-message-${sender}`;
        message.textContent = text;

        if (link) {
            const anchor = document.createElement('a');
            anchor.href = link.href;
            anchor.textContent = link.label;
            message.append(document.createElement('br'), anchor);
        }

        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }

    function productResponse(product) {
        return {
            text: `${product.name} cuesta ${formatPrice(product.price)}. ${product.description}`,
            link: { href: 'menu.html', label: 'Ver el menú y pedir' }
        };
    }

    function getResponse(message) {
        const query = normalize(message);
        const exactProduct = products.find((product) => {
            const productName = normalize(product.name);
            return query.includes(productName) || productName.includes(query);
        }) || products.find((product) => {
            const productName = normalize(product.name);
            return query.split(' ').some((term) => term.length > 3 && productName.includes(term));
        });

        if (exactProduct && query.length > 2) return productResponse(exactProduct);

        if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)$/.test(query)) {
            return { text: '¡Hola! 😊 ¿Buscas una recomendación, información de un plato o ayuda con tu pedido?' };
        }

        if (/domicilio|envio|entrega|cuanto tarda|tiempo/.test(query)) {
            return {
                text: 'El domicilio tarda aproximadamente entre 30 y 45 minutos. Además, el envío es gratis en compras superiores a $30.000.',
                link: { href: 'menu.html', label: 'Explorar el menú' }
            };
        }

        if (/pago|pagar|tarjeta|efectivo|nequi|daviplata/.test(query)) {
            return { text: 'Puedes pagar en efectivo, con Nequi o Daviplata, o con tarjeta/datáfono. Elige tu método al finalizar el pedido.' };
        }

        if (/cupon|descuento|promocion|promo/.test(query)) {
            return {
                text: 'Puedes probar DONDEJUAN10 (10% de descuento), HAMBURGUESA5K ($5.000 de descuento) o CLIENTE5K ($5.000 para clientes frecuentes). Se aplican desde el carrito.',
                link: { href: 'menu.html', label: 'Ir al menú y carrito' }
            };
        }

        if (/vegetarian|vegano|sin carne/.test(query)) {
            return {
                text: 'En el menú actual no veo opciones vegetarianas o veganas confirmadas. Puedes revisar los acompañamientos y consultar directamente al restaurante por ingredientes y modificaciones.',
                link: { href: 'menu.html', label: 'Ver acompañamientos' }
            };
        }

        if (/para dos|pareja|compartir/.test(query)) {
            const product = products.find((item) => item.id === 'combo-pareja');
            return product ? productResponse(product) : {
                text: 'Tenemos combos para compartir. Revisa las opciones disponibles en el menú.',
                link: { href: 'menu.html', label: 'Ver combos' }
            };
        }

        if (/barat|econom|menos cost|precio|cuesta|vale/.test(query)) {
            const categoryProducts = /hamburgues|burger/.test(query)
                ? products.filter((item) => item.category === 'hamburguesas')
                : products;
            const cheapest = [...categoryProducts].sort((a, b) => a.price - b.price)[0];
            if (cheapest) {
                return {
                    text: `Una opción económica es ${cheapest.name} por ${formatPrice(cheapest.price)}.`,
                    link: { href: 'menu.html', label: 'Ver el menú completo' }
                };
            }
        }

        if (/recomiend|suger|antoja|que pedir|mejor/.test(query)) {
            const product = products.find((item) => item.id === 'hamb-deluxe') ||
                products.find((item) => item.category === 'combos');
            return product ? productResponse(product) : {
                text: 'Tenemos hamburguesas, combos, acompañamientos y bebidas. Cuéntame qué se te antoja y te ayudo a elegir.',
                link: { href: 'menu.html', label: 'Ver el menú' }
            };
        }

        if (/menu|pedido|orden|comprar/.test(query)) {
            return {
                text: '¡Claro! En el menú puedes ver los platos, agregarlos al carrito y finalizar tu pedido.',
                link: { href: 'menu.html', label: 'Abrir menú y hacer pedido' }
            };
        }

        if (/quienes|nosotros|restaurante/.test(query)) {
            return {
                text: 'Donde Juan es un restaurante de hamburguesas artesanales y combos preparados con ingredientes de primera calidad. 🍔',
                link: { href: '#nosotros', label: 'Conócenos' }
            };
        }

        return {
            text: 'Puedo ayudarte con recomendaciones, ingredientes y precios del menú, domicilios, formas de pago y cupones. ¿Qué te gustaría saber?',
            link: { href: 'menu.html', label: 'Explorar el menú' }
        };
    }

    function sendMessage(message) {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        addMessage(trimmedMessage, 'user');
        input.value = '';

        window.setTimeout(() => {
            const response = getResponse(trimmedMessage);
            addMessage(response.text, 'bot', response.link);
        }, 350);
    }

    function setOpen(isOpen) {
        panel.hidden = !isOpen;
        launcher.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) input.focus();
        else launcher.focus();
    }

    launcher.addEventListener('click', () => setOpen(panel.hidden));
    closeButton.addEventListener('click', () => setOpen(false));
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendMessage(input.value);
    });

    document.querySelectorAll('[data-assistant-question]').forEach((button) => {
        button.addEventListener('click', () => sendMessage(button.dataset.assistantQuestion || ''));
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
});
