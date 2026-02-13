import axios from 'axios'; // Importa la librería 'axios' para hacer peticiones HTTP.
import api from './api';
import { deleteCookie } from 'cookies-next'; // Necesario para la función logoutUser
import { getCookie } from 'cookies-next';

// Entorno de desarrollo (logs condicionales)
const isDev = process.env.NODE_ENV !== 'production';
const devLog = (...args) => { if (isDev) console.warn(...args); };


/**
 * Realiza la petición de login al servidor de backend.
 * @param {string} email - Correo electrónico del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<{token: string, userInfo: object}>} El token JWT y los datos del usuario si el login es exitoso.
 * @throws {Error} Si el login falla o no se recibe el token.
 */
export async function loginUser(email, password) { // Función asíncrona para iniciar sesión.
    // RUTA DEFINITIVA: Coincide con API_PREFIX=/api/v1 y router montado en /auth
    const AUTH_ENDPOINT = '/api/v1/auth/login'; // Define la ruta específica para la API de login.

    try {
        // Usamos el cliente `api` con baseURL configurada
        const response = await api.post(AUTH_ENDPOINT,
            { // ARGUMENTO 2: DATA (Body) - Envía el email y password.
                email,
                password
            }
        );

        // EXTRAEMOS LAS PROPIEDADES DE FORMA ROBUSTA PARA ACEPTAR VARIOS FORMATOS DE RESPUESTA
        // El backend puede responder { token, user } o { data: { token, user } }
        // Comprobamos ambas ubicaciones para evitar errores por cambios de formato.
        const token = response.data?.token || response.data?.data?.token;
        const userInfo = response.data?.user || response.data?.data?.user; 

        if (token && userInfo) {
            // Devolvemos ambos: el token y la información del usuario
            return { token, userInfo };
        }

        // Si la llamada fue 200 OK, pero faltaron los datos, lanzamos un error específico
        throw new Error('No se recibió token y/o información del usuario del servidor (Respuesta 200 sin datos).');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;
            let serverMsg = error.response.statusText;

            if (error.response.data) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                    serverMsg = error.response.data.errors.map(e => e.msg).join(', ');
                }
                else if (error.response.data.message) {
                    serverMsg = error.response.data.message;
                }
            }

            devLog('Login error response:', status, error.response.data);
            
            // Si es un error 401, damos un mensaje más amigable
            if (status === 401) {
                throw new Error("Credenciales inválidas. Por favor, verifica tu correo y contraseña.");
            }
            
            throw new Error(serverMsg);

        } else if (error.request) {
            devLog('No response from server:', error.request);
            throw new Error('No hay respuesta del servidor. ¿Está corriendo en la dirección ' + (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '?');
        } else {
            devLog('Error general:', error.message);
            throw new Error(error.message);
        }
    }
}

// --------------------------------------------------

/**
 * Realiza la petición de registro al servidor de backend.
 * @param {Object} userData - Datos del usuario.
 * @returns {Promise<any>} Promesa que resuelve si el registro es exitoso.
 * @throws {Error} Si el registro falla.
 */
export async function registerUser({ nombre, apellido, email, cedula, telefono, direccion, password }) {
    // RUTA DEFINITIVA: /api/v1/auth/register
    const AUTH_ENDPOINT = '/api/v1/auth/register';

    try {
        const response = await api.post(AUTH_ENDPOINT, { nombre, apellido, cedula, email, telefono, direccion, password });

        if (response.data.success || response.status === 201 || response.status === 200) {
            return response.data;
        }

        throw new Error('Registro fallido sin mensaje de error claro (respuesta 200/201 sin propiedad success).');

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;

            if (status === 400 && error.response.data?.errors) {
                if (process.env.NODE_ENV !== 'production') console.error('❌ ERRORES DE VALIDACIÓN DETALLADOS (400):', error.response.data.errors);
            }

            let serverMsg = error.response.statusText;

            if (error.response.data) {
                if (error.response.data.errors && Array.isArray(error.response.data.errors) && error.response.data.errors.length > 0) {
                    serverMsg = error.response.data.errors.map(e => e.msg).join(', ');
                }
                else if (error.response.data.message) {
                    serverMsg = error.response.data.message;
                }
            }

            devLog('Registro error response:', status, error.response.data);
            throw new Error(serverMsg);

        } else if (error.request) {
            devLog('No response from server:', error.request);
            throw new Error('No hay respuesta del servidor. ¿Está corriendo?');
        } else {
            devLog('Axios error:', error.message);
            throw new Error(error.message);
        }
    }
}

// --------------------------------------------------
// ✅ FUNCIÓN PARA VERIFICAR LA VALIDEZ DEL TOKEN
// --------------------------------------------------

/**
 * Verifica la validez del token JWT con el servidor de backend.
 * @param {string} token - El token JWT.
 * @returns {Promise<boolean>} True si el token es válido, false en caso contrario.
 */
export async function verifyToken(token) {
    // 💡 IMPORTANTE: Debes asegurarte de que tu backend tenga este endpoint 
    // que reciba el token y devuelva 200 OK si es válido, o 401/403 si no lo es.
    const VERIFY_ENDPOINT = '/api/v1/auth/verify-token';

    if (!token) {
        devLog("No hay token para verificar.");
        return false;
    }

    try {
        // Usamos el cliente `api` (baseURL configurada) y enviamos token explícitamente en headers por si se pasa como parámetro
        const response = await api.post(VERIFY_ENDPOINT, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        });

        // Si el backend responde 200 OK (o el código de éxito que uses), el token es válido.
        return response.status === 200 || response.status === 204; 

    } catch (error) {
        // Axios lanza un error si el estado de la respuesta es 4xx o 5xx.
        if (axios.isAxiosError(error) && error.response) {
             // Si el estado es 401 (No Autorizado) o 403 (Prohibido), el token es inválido o expiró.
             if (error.response.status === 401 || error.response.status === 403) {
                if (process.env.NODE_ENV !== 'production') console.warn("Verificación de token fallida. Status:", error.response.status);
                return false;
             }
        }
        // Para cualquier otro error (red, servidor caído), asumimos que no se puede autenticar.
        devLog("Error al verificar el token:", error.message);
        return false;
    }
}

// --------------------------------------------------
// ✅ FUNCIÓN PARA CERRAR SESIÓN (LOGOUT)
// --------------------------------------------------

/**
 * Función que realiza el cierre de sesión eliminando el token JWT de la cookie.
 * @returns {void}
 */
export function logoutUser() {
    devLog("Cerrando sesión, eliminando authToken...");
    // Elimina la cookie 'authToken'. Asegúrate de usar los mismos parámetros de path 
    // que usaste en setCookie, si aplica, para garantizar que se elimine correctamente.
    deleteCookie('authToken', { path: '/' }); 
    // Opcional: podrías hacer window.location.href = '/' si quieres forzar un refresh completo
}
