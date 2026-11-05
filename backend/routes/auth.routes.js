// ============================================================================
// RUTAS DE AUTENTICACIÓN (LOGIN, REGISTRO Y GESTIÓN DE USUARIOS)
// ============================================================================

// Importamos el enrutador de Express y el módulo del sistema de archivos (fs)
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta absoluta hacia el archivo de almacenamiento de usuarios
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

/**
 * Función auxiliar para leer los usuarios desde el archivo JSON.
 * @returns {Array} Lista de usuarios registrados.
 */
function readUsersFromFile() {
    try {
        // Leemos el archivo sincrónicamente codificado en UTF-8
        const rawData = fs.readFileSync(USERS_FILE, 'utf8');
        // Parseamos el texto JSON a un arreglo de objetos JavaScript
        return JSON.parse(rawData);
    } catch (error) {
        // Si el archivo no existe o está dañado, mostramos el error y retornamos arreglo vacío
        console.error('Error al leer el archivo de usuarios:', error.message);
        return [];
    }
}

/**
 * Función auxiliar para guardar la lista de usuarios en el archivo JSON.
 * @param {Array} users - Arreglo de usuarios a persistir.
 */
function writeUsersToFile(users) {
    try {
        // Escribimos el JSON con indentación de 2 espacios para que sea legible
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error al escribir el archivo de usuarios:', error.message);
    }
}

// ----------------------------------------------------------------------------
// POST /api/auth/register - Registrar un nuevo usuario
// ----------------------------------------------------------------------------
router.post('/register', (req, res) => {
    // Obtenemos los campos enviados en el cuerpo de la petición (body)
    const { name, email, phone, password } = req.body;

    // 1. Validamos que el nombre tenga al menos 2 caracteres
    if (!name || name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'El nombre completo debe tener al menos 2 caracteres.'
        });
    }

    // 2. Validamos el formato del correo electrónico con una expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, ingresa un correo electrónico válido.'
        });
    }

    // 3. Validamos que la contraseña cumpla con la longitud mínima de 6 caracteres
    if (!password || password.length < 6) {
        return res.status(400).json({
            success: false,
            message: 'La contraseña debe tener un mínimo de 6 caracteres.'
        });
    }

    // 4. Normalizamos el correo (en minúsculas y sin espacios laterales)
    const normalizedEmail = email.trim().toLowerCase();

    // 5. Leemos la lista de usuarios existentes
    const users = readUsersFromFile();

    // 6. Verificamos si ya existe una cuenta con este mismo correo
    const emailAlreadyExists = users.some(u => u.email.toLowerCase() === normalizedEmail);
    if (emailAlreadyExists) {
        return res.status(409).json({
            success: false,
            message: 'Ya existe una cuenta registrada con este correo electrónico.'
        });
    }

    // 7. Creamos el nuevo objeto de usuario con puntos de bienvenida
    const newUser = {
        id: 'user-' + Date.now(), // Identificador único basado en la marca de tiempo
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : '',
        password: password, // En producción se aplicaría hashing con bcrypt
        points: 100, // Bono de fidelidad por bienvenida
        createdAt: new Date().toISOString()
    };

    // 8. Agregamos el usuario y guardamos en el archivo JSON
    users.push(newUser);
    writeUsersToFile(users);

    // 9. Respondemos con éxito retornando la información del usuario (sin exponer riesgos)
    return res.status(201).json({
        success: true,
        message: '¡Usuario registrado exitosamente!',
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            points: newUser.points,
            createdAt: newUser.createdAt
        }
    });
});

// ----------------------------------------------------------------------------
// POST /api/auth/login - Iniciar sesión de usuario
// ----------------------------------------------------------------------------
router.post('/login', (req, res) => {
    // Obtenemos las credenciales enviadas
    const { email, password } = req.body;

    // Validamos que se hayan proporcionado ambos campos
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Debes proporcionar correo electrónico y contraseña.'
        });
    }

    // Normalizamos el correo
    const normalizedEmail = email.trim().toLowerCase();

    // Leemos la lista de usuarios
    const users = readUsersFromFile();

    // Buscamos el usuario por su correo
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    // Verificamos si el usuario existe y si la contraseña coincide
    if (!user || user.password !== password) {
        return res.status(401).json({
            success: false,
            message: 'Correo electrónico o contraseña incorrectos.'
        });
    }

    // Inicio de sesión exitoso: devolvemos los datos del usuario
    return res.json({
        success: true,
        message: `¡Bienvenido de vuelta, ${user.name}!`,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            points: user.points,
            createdAt: user.createdAt
        }
    });
});

// ----------------------------------------------------------------------------
// GET /api/auth/users - Obtener lista de usuarios (solo para administración/pruebas)
// ----------------------------------------------------------------------------
router.get('/users', (req, res) => {
    const users = readUsersFromFile();
    // Excluimos la contraseña antes de responder
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        points: u.points
    }));
    return res.json({ success: true, users: safeUsers });
});

// Exportamos el enrutador para su uso en server.js
module.exports = router;

