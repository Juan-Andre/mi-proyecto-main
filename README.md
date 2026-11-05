# 🍔 Restaurante Donde Juan - Arquitectura Web Completa (Frontend & Backend)

Bienvenido a la documentación técnica del proyecto **Donde Juan**. Este repositorio contiene una solución web integral y modular para un restaurante de hamburguesas artesanales, que incluye frontend interactivo, backend con API REST en Node.js/Express y persistencia de datos.

---

## 📁 Distribución y Organización de Carpetas

El proyecto ha sido reestructurado en una arquitectura modular limpia para facilitar su comprensión, mantenimiento y escalabilidad:

```text
mi-proyecto-main/
│
├── 📁 backend/                       # Servidor y API REST
│   ├── server.js                     # Servidor Express principal (puerto 3000)
│   ├── 📁 data/                      # Persistencia de datos en formato JSON
│   │   ├── users.json                # Base de datos de usuarios registrados
│   │   ├── products.json             # Catálogo oficial de platillos y precios
│   │   └── orders.json               # Historial de pedidos realizados
│   └── 📁 routes/                    # Enrutadores modulares de la API
│       ├── auth.routes.js            # Endpoints: /api/auth (Login, Registro, Usuarios)
│       ├── products.routes.js        # Endpoints: /api/products (Listar, Filtrar, Buscar)
│       ├── orders.routes.js          # Endpoints: /api/orders (Crear y Consultar órdenes)
│       └── coupons.routes.js         # Endpoints: /api/coupons (Validar cupones de descuento)
│
├── 📁 js/                            # Lógica del Frontend dividida en módulos
│   ├── api.js                        # Cliente HTTP (fetch) con fallback inteligente a localStorage
│   ├── auth.js                       # Formularios de Login, Registro, validaciones y Perfil
│   ├── cart.js                       # Carrito de compras, cupones, drawer, checkout y WhatsApp
│   ├── menu.js                       # Catálogo interactivo de platillos, filtros y buscador en vivo
│   └── main.js                       # Coordinador global, menú móvil y cabecera dinámica
│
├── 📁 css/                           # Estilos visuales
│   └── style.css                     # Hoja de estilos documentada línea por línea y responsiva
│
├── 📁 img/                           # Recursos gráficos (hamburguesas, combos, acompañamientos)
├── 📁 logo/                          # Logotipo oficial del restaurante
│
├── index.html                        # Página principal (Inicio, Especialidades, Nosotros)
├── login.html                        # Página dedicada de Autenticación y Perfil de Usuario
├── menu.html                         # Página dedicada del Menú con Carrito de Compras integrado
│
├── package.json                      # Configuración de dependencias (Express, CORS) y scripts
└── README.md                         # Documentación técnica del proyecto
```

---

## 🚀 Cómo Iniciar el Servidor Backend

El backend está desarrollado sobre **Node.js** con **Express** y **CORS**. Para iniciarlo, abre tu terminal en la carpeta del proyecto y ejecuta:

### 1. Iniciar el servidor
```bash
npm start
```
*(También puedes ejecutarlo directamente con `node backend/server.js`)*

### 2. Modo Desarrollo con recarga automática
```bash
npm run dev
```

Una vez iniciado, el servidor servirá tanto la API REST como la aplicación web en:
* 🌐 **Página Principal:** [http://localhost:3000](http://localhost:3000)
* 📋 **Menú y Carrito:** [http://localhost:3000/menu.html](http://localhost:3000/menu.html)
* 👤 **Iniciar Sesión y Registro:** [http://localhost:3000/login.html](http://localhost:3000/login.html)
* 📡 **Verificación de Salud de la API:** [http://localhost:3000/api/health](http://localhost:3000/api/health)

> [!NOTE]
> **Compatibilidad Híbrida (Offline / Online):**
> Gracias al cliente [`js/api.js`](file:///c:/Users/juana/Downloads/mi-proyecto-main/mi-proyecto-main/js/api.js), si abres los archivos `.html` directamente en tu navegador (mediante doble clic o protocolo `file://`), el sistema detecta que el servidor no está corriendo y conmuta automáticamente a **almacenamiento local (`localStorage`)**, asegurando que **la página nunca se rompa**.

---

## 📡 Endpoints de la API REST

### 1. Autenticación (`/api/auth`)
* `POST /api/auth/register`: Registra un nuevo usuario validando nombre, correo único y contraseña (mínimo 6 caracteres).
* `POST /api/auth/login`: Autentica credenciales contra `backend/data/users.json`.
* `GET /api/auth/users`: Lista los usuarios registrados (protegiendo contraseñas).

### 2. Productos y Menú (`/api/products`)
* `GET /api/products`: Lista los platillos. Soporta filtros:
  * `?category=hamburguesas`
  * `?search=deluxe`
* `GET /api/products/:id`: Retorna la información de un platillo específico por su identificador.

### 3. Pedidos y Facturación (`/api/orders`)
* `POST /api/orders`: Recibe cliente, items y totales; genera un número de orden único (`DJ-XXXX`) y persiste en `backend/data/orders.json`.
* `GET /api/orders`: Consulta el historial de órdenes registradas.
* `GET /api/orders/:id`: Consulta los datos de un pedido por su código.

### 4. Cupones de Descuento (`/api/coupons`)
* `POST /api/coupons/validate`: Valida códigos promocionales (ej. `DONDEJUAN10` para 10% OFF o `HAMBURGUESA5K` para $5.000 COP de descuento).

---

## 🔑 Credenciales de Prueba Rápida

* **Correo:** `juan@ejemplo.com`
* **Contraseña:** `password123`
*(En [login.html](file:///c:/Users/juana/Downloads/mi-proyecto-main/mi-proyecto-main/login.html) dispones de un botón amarillo de "Autocompletar datos de prueba" para ingresar con un solo clic)*

---

## 📝 Documentación en el Código

Cada archivo JavaScript (`backend/` y `js/`), CSS y HTML cuenta con **comentarios explicativos en español** que detallan:
* El propósito de cada función y componente.
* Qué parámetros recibe y qué valores retorna.
* La lógica detrás de expresiones regulares y validaciones.
* El flujo de datos entre el Frontend, la API y el almacenamiento.
Cualquier persona que lea el código podrá comprenderlo y continuar su desarrollo sin dificultad.

