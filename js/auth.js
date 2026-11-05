// ============================================================================
// MÓDULO DE AUTENTICACIÓN (LOGIN, REGISTRO Y PERFIL DE USUARIO)
// ============================================================================
// Este archivo gestiona la lógica de interfaz de usuario para el inicio de sesión,
// registro de cuentas, validación de formularios y visualización del perfil.

// ----------------------------------------------------------------------------
// GESTIÓN DE SESIÓN EN EL NAVEGADOR
// ----------------------------------------------------------------------------

/**
 * Obtiene el usuario con sesión activa desde el almacenamiento local.
 * @returns {Object|null} Objeto con la información del usuario autenticado o null.
 */
function getCurrentUser() {
    try {
        const session = localStorage.getItem('dondejuan_session');
        // Convertimos la cadena de texto guardada en un objeto JavaScript
        return session ? JSON.parse(session) : null;
    } catch (e) {
        console.error('Error al parsear la sesión del usuario:', e);
        return null;
    }
}

/**
 * Guarda el usuario autenticado en localStorage para persistir la sesión.
 * @param {Object} user - Datos del usuario.
 */
function setCurrentUser(user) {
    localStorage.setItem('dondejuan_session', JSON.stringify(user));
}

/**
 * Elimina la sesión activa de localStorage para cerrar la sesión.
 */
function clearSession() {
    localStorage.removeItem('dondejuan_session');
}

// ----------------------------------------------------------------------------
// PESTAÑAS PARA ALTERNAR ENTRE INICIAR SESIÓN Y REGISTRARSE
// ----------------------------------------------------------------------------

// Elementos del DOM de las pestañas y formularios
const tabLoginBtn = document.getElementById('tabLoginBtn');
const tabRegisterBtn = document.getElementById('tabRegisterBtn');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const authAlert = document.getElementById('authAlert');

/**
 * Cambia la pestaña activa entre 'login' y 'register'.
 * @param {string} tabName - Nombre de la pestaña a activar ('login' o 'register').
 */
function switchAuthTab(tabName) {
    // Ocultamos cualquier alerta previa al cambiar de pestaña
    hideAuthAlert();

    if (tabName === 'login') {
        // Marcamos el botón de login como activo
        if (tabLoginBtn) {
            tabLoginBtn.classList.add('active');
            tabLoginBtn.setAttribute('aria-selected', 'true');
        }
        // Desmarcamos el botón de registro
        if (tabRegisterBtn) {
            tabRegisterBtn.classList.remove('active');
            tabRegisterBtn.setAttribute('aria-selected', 'false');
        }
        // Mostramos el formulario de login y ocultamos el de registro
        if (formLogin) formLogin.classList.add('active');
        if (formRegister) formRegister.classList.remove('active');

        // Enfocamos automáticamente el campo de correo para agilizar la escritura
        const loginEmail = document.getElementById('loginEmail');
        if (loginEmail) setTimeout(() => loginEmail.focus(), 150);

    } else if (tabName === 'register') {
        // Marcamos el botón de registro como activo
        if (tabRegisterBtn) {
            tabRegisterBtn.classList.add('active');
            tabRegisterBtn.setAttribute('aria-selected', 'true');
        }
        // Desmarcamos el botón de login
        if (tabLoginBtn) {
            tabLoginBtn.classList.remove('active');
            tabLoginBtn.setAttribute('aria-selected', 'false');
        }
        // Mostramos el formulario de registro y ocultamos el de login
        if (formRegister) formRegister.classList.add('active');
        if (formLogin) formLogin.classList.remove('active');

        // Enfocamos el campo de nombre del registro
        const registerName = document.getElementById('registerName');
        if (registerName) setTimeout(() => registerName.focus(), 150);
    }
}

// Asignamos los eventos de clic a los botones de las pestañas
if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchAuthTab('login'));
if (tabRegisterBtn) tabRegisterBtn.addEventListener('click', () => switchAuthTab('register'));

/**
 * Detecta si la URL contiene un hash como #registro o #login y activa la pestaña adecuada.
 */
function handleHashTab() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#registro' || hash === '#register') {
        switchAuthTab('register');
    } else if (hash === '#login' || hash === '#auth') {
        switchAuthTab('login');
    }
}

// Escuchamos el evento 'hashchange' para alternar pestañas si el usuario hace clic en enlaces con hash
window.addEventListener('hashchange', handleHashTab);

// Enlaces dentro de los formularios para alternar rápidamente
const linkGoToRegister = document.getElementById('linkGoToRegister');
const linkGoToLogin = document.getElementById('linkGoToLogin');

if (linkGoToRegister) {
    linkGoToRegister.addEventListener('click', (e) => {
        e.preventDefault(); // Evitamos recarga de página
        window.location.hash = 'registro';
        switchAuthTab('register');
    });
}

if (linkGoToLogin) {
    linkGoToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'login';
        switchAuthTab('login');
    });
}

// ----------------------------------------------------------------------------
// ALERTAS Y MENSAJES DE ESTADO
// ----------------------------------------------------------------------------

/**
 * Muestra un mensaje de alerta en la caja de autenticación.
 * @param {string} message - Texto del mensaje a mostrar.
 * @param {string} type - Tipo de alerta ('error', 'success', 'info').
 */
function showAuthAlert(message, type = 'error') {
    if (!authAlert) return;

    // Asignamos la clase correspondiente para aplicar los colores del CSS
    authAlert.className = `auth-alert ${type}`;

    // Ícono representativo según el tipo de mensaje
    let icon = '⚠️';
    if (type === 'success') icon = '✅';
    if (type === 'info') icon = 'ℹ️';

    authAlert.innerHTML = `<strong>${icon}</strong> <span>${message}</span>`;
    authAlert.classList.remove('hidden');

    // Desplazamos suavemente la vista para que el usuario note el mensaje
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Oculta y limpia el contenedor de alertas.
 */
function hideAuthAlert() {
    if (!authAlert) return;
    authAlert.className = 'auth-alert hidden';
    authAlert.innerHTML = '';
}

// ----------------------------------------------------------------------------
// VER / OCULTAR CONTRASEÑA (BOTÓN DE OJO 👁️ / 🙈)
// ----------------------------------------------------------------------------
document.querySelectorAll('.btn-toggle-pass').forEach(button => {
    button.addEventListener('click', () => {
        // Obtenemos el ID del input objetivo desde el atributo 'data-target'
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        // Alternamos el tipo de campo entre 'password' (oculto) y 'text' (visible)
        if (input.type === 'password') {
            input.type = 'text';
            button.textContent = '🙈';
            button.setAttribute('aria-label', 'Ocultar contraseña');
        } else {
            input.type = 'password';
            button.textContent = '👁️';
            button.setAttribute('aria-label', 'Mostrar contraseña');
        }
    });
});

// ----------------------------------------------------------------------------
// AUTOCOMPLETADO DE CUENTA DEMO PARA PRUEBAS RÁPIDAS
// ----------------------------------------------------------------------------
const btnDemoAutofill = document.getElementById('btnDemoAutofill');
if (btnDemoAutofill) {
    btnDemoAutofill.addEventListener('click', () => {
        switchAuthTab('login');
        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');

        if (emailInput && passInput) {
            // Llenamos con las credenciales demo predeterminadas
            emailInput.value = 'juan@ejemplo.com';
            passInput.value = 'password123';
            showAuthAlert('Datos de prueba cargados correctamente. Presiona "Entrar a mi cuenta".', 'info');
        }
    });
}

// ----------------------------------------------------------------------------
// PROCESAMIENTO DEL FORMULARIO DE INICIO DE SESIÓN
// ----------------------------------------------------------------------------
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evitamos el envío tradicional del formulario
        hideAuthAlert();

        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');

        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
        const password = passInput ? passInput.value : '';

        // 1. Validación de campos requeridos
        if (!email) {
            showAuthAlert('Por favor, ingresa tu correo electrónico.', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (!password) {
            showAuthAlert('Por favor, ingresa tu contraseña.', 'error');
            if (passInput) passInput.focus();
            return;
        }

        // 2. Realizamos la autenticación mediante la API (con soporte de backend y fallback)
        const result = await DondeJuanAPI.login(email, password);

        if (!result.success) {
            showAuthAlert(result.message || 'Correo o contraseña incorrectos.', 'error');
            return;
        }

        // 3. Guardamos la sesión en el navegador
        setCurrentUser(result.user);
        showAuthAlert(`¡Bienvenido de vuelta, ${result.user.name}! Sesión iniciada con éxito.`, 'success');

        // Limpiamos el campo de contraseña por seguridad
        if (passInput) passInput.value = '';

        // 4. Actualizamos la interfaz del usuario
        updateAuthUI();
    });
}

// ----------------------------------------------------------------------------
// PROCESAMIENTO DEL FORMULARIO DE REGISTRO
// ----------------------------------------------------------------------------
if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAuthAlert();

        // Obtenemos los valores de los campos
        const nameInput = document.getElementById('registerName');
        const emailInput = document.getElementById('registerEmail');
        const phoneInput = document.getElementById('registerPhone');
        const passInput = document.getElementById('registerPassword');
        const passConfirmInput = document.getElementById('registerPasswordConfirm');
        const termsInput = document.getElementById('registerTerms');

        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const password = passInput ? passInput.value : '';
        const passConfirm = passConfirmInput ? passConfirmInput.value : '';
        const termsAccepted = termsInput ? termsInput.checked : false;

        // Validaciones en el cliente para retroalimentación inmediata:
        if (!name || name.length < 2) {
            showAuthAlert('Por favor ingresa tu nombre completo (mínimo 2 letras).', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            showAuthAlert('Por favor ingresa un correo electrónico válido (ejemplo@correo.com).', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        if (!password || password.length < 6) {
            showAuthAlert('La contraseña debe tener un mínimo de 6 caracteres.', 'error');
            if (passInput) passInput.focus();
            return;
        }

        if (password !== passConfirm) {
            showAuthAlert('Las contraseñas no coinciden. Por favor verifícalas.', 'error');
            if (passConfirmInput) passConfirmInput.focus();
            return;
        }

        if (!termsAccepted) {
            showAuthAlert('Debes aceptar los términos y condiciones para continuar.', 'error');
            return;
        }

        // Enviamos la petición de registro a través de la API
        const result = await DondeJuanAPI.register({ name, email, phone, password });

        if (!result.success) {
            showAuthAlert(result.message || 'Error al crear la cuenta.', 'error');
            return;
        }

        // Si el registro fue exitoso, iniciamos sesión automáticamente
        setCurrentUser(result.user);
        formRegister.reset();

        showAuthAlert(`¡Cuenta creada con éxito! Bienvenido a la familia Donde Juan, ${result.user.name}.`, 'success');

        // Actualizamos la interfaz
        updateAuthUI();
    });
}

// ----------------------------------------------------------------------------
// RECUPERACIÓN ASISTIDA DE CONTRASEÑA
// ----------------------------------------------------------------------------
const btnForgotPass = document.getElementById('btnForgotPass');
if (btnForgotPass) {
    btnForgotPass.addEventListener('click', () => {
        const loginEmail = document.getElementById('loginEmail');
        let email = loginEmail ? loginEmail.value.trim().toLowerCase() : '';

        if (!email) {
            email = prompt('Por favor ingresa tu correo registrado para recuperar la contraseña:');
            if (email) email = email.trim().toLowerCase();
        }

        if (!email) return;

        // Buscamos si existe en los usuarios guardados
        const users = JSON.parse(localStorage.getItem('dondejuan_users') || '[]');
        const found = users.find(u => u.email.toLowerCase() === email);

        if (found) {
            alert(`✅ Hemos localizado tu cuenta (${found.name}).\n\nEn un entorno de producción recibirías un enlace a tu correo.\n\n🔑 Para pruebas locales, tu contraseña es: ${found.password}`);
            if (loginEmail) loginEmail.value = found.email;
        } else {
            alert('⚠️ No se encontró ninguna cuenta registrada con ese correo. Te invitamos a registrarte.');
            switchAuthTab('register');
        }
    });
}

// ----------------------------------------------------------------------------
// ACTUALIZACIÓN DE LA INTERFAZ DE USUARIO (PERFIL Y CABECERA)
// ----------------------------------------------------------------------------
function updateAuthUI() {
    const currentUser = getCurrentUser();
    const authBox = document.getElementById('authBox');
    const userProfileBox = document.getElementById('userProfileBox');
    const usersDesktop = document.getElementById('usersDesktop');
    const usersMobile = document.getElementById('usersMobile');

    if (currentUser) {
        // --- CASO 1: EL USUARIO TIENE SESIÓN ACTIVA ---
        // Ocultamos la caja de login/registro y mostramos el panel de perfil
        if (authBox) authBox.classList.add('hidden');
        if (userProfileBox) userProfileBox.classList.remove('hidden');

        // Cargamos los datos en la tarjeta de perfil
        const profileAvatar = document.getElementById('profileAvatar');
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profilePoints = document.getElementById('profilePoints');

        if (profileAvatar) {
            // Obtenemos las iniciales del nombre (ej: "Juan Pérez" -> "JP")
            const initials = currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            profileAvatar.textContent = initials || '👤';
        }

        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
        if (profilePhone) profilePhone.textContent = currentUser.phone ? `📱 ${currentUser.phone}` : '';
        if (profilePoints) profilePoints.textContent = `${currentUser.points || 100} Puntos`;

        // Actualizamos la barra de navegación de escritorio con el nombre y botón de salida
        if (usersDesktop) {
            const firstName = currentUser.name.split(' ')[0];
            usersDesktop.innerHTML = `
                <div class="user-nav-logged">
                    <a href="login.html" class="nav-user-pill" title="Ver mi cuenta">
                        👤 ${firstName}
                    </a>
                    <button type="button" class="btn-nav-logout" id="desktopLogoutBtn">Salir</button>
                </div>
            `;
            document.getElementById('desktopLogoutBtn')?.addEventListener('click', handleLogout);
        }

        // Actualizamos la barra de navegación móvil
        if (usersMobile) {
            usersMobile.innerHTML = `
                <div class="user-nav-logged">
                    <a href="login.html" class="nav-user-pill">
                        👤 ${currentUser.name}
                    </a>
                    <button type="button" class="btn-nav-logout" id="mobileLogoutBtn">Cerrar Sesión</button>
                </div>
            `;
            document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => {
                if (typeof closeMenu === 'function') closeMenu();
                handleLogout();
            });
        }

    } else {
        // --- CASO 2: USUARIO VISITANTE (SIN SESIÓN) ---
        if (authBox) authBox.classList.remove('hidden');
        if (userProfileBox) userProfileBox.classList.add('hidden');

        // Mostramos botones estándar de "Ingresar" y "Registrarse"
        if (usersDesktop) {
            usersDesktop.innerHTML = `
                <a href="login.html" class="btn-usuario" id="navLoginBtn">Ingresar</a>
                <a href="login.html#registro" class="btn-usuario" id="navRegisterBtn">Registrarse</a>
            `;
        }

        if (usersMobile) {
            usersMobile.innerHTML = `
                <a href="login.html" class="btn-usuario" id="mobileLoginBtn">Ingresar</a>
                <a href="login.html#registro" class="btn-usuario" id="mobileRegisterBtn">Registrarse</a>
            `;
        }
    }
}

/**
 * Cierra la sesión activa del usuario y restaura la interfaz.
 */
function handleLogout() {
    clearSession();
    updateAuthUI();
    if (formLogin) {
        switchAuthTab('login');
        showAuthAlert('Has cerrado sesión correctamente. ¡Esperamos verte pronto!', 'info');
    }
}

// Botón de cerrar sesión dentro de la tarjeta de perfil
document.getElementById('btnLogoutProfile')?.addEventListener('click', handleLogout);

