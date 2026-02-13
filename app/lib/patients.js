import api from './api';
import axios from 'axios';

const isDev = process.env.NODE_ENV !== 'production';
const devLog = (...args) => { if (isDev) console.warn(...args); };

/**
 * Crea un paciente tras validar datos y verificar que la cédula del propietario exista.
 * @param {Object} data
 */
export async function createPatient({ nombreMascota, especie, raza, edad, peso, altura, cedulaPropietario }) {
  // Validaciones mínimas
  if (!nombreMascota || typeof nombreMascota !== 'string' || nombreMascota.trim() === '') {
    throw new Error('Nombre de la mascota es obligatorio');
  }
  if (!especie || typeof especie !== 'string' || especie.trim() === '') {
    throw new Error('Especie es obligatoria');
  }
  if (!cedulaPropietario || typeof cedulaPropietario !== 'string' || cedulaPropietario.trim() === '') {
    throw new Error('Cédula del propietario es obligatoria');
  }

  const numericFields = { edad, peso, altura };
  for (const [key, val] of Object.entries(numericFields)) {
    if (val !== '' && val !== null && val !== undefined) {
      const n = Number(val);
      if (Number.isNaN(n) || n < 0) {
        throw new Error(`${key} debe ser un número válido mayor o igual a 0`);
      }
    }
  }

  try {
    // 1. verificar cedula (API Express)
    const checkRes = await api.post('/api/v1/propietarios/check', { cedula: cedulaPropietario.trim() });
    if (!checkRes || !checkRes.data) throw new Error('Error al verificar la cédula del propietario');
    if (!checkRes.data.exists) {
      throw new Error('Cédula no encontrada en la base de datos. Ingrese una cédula existente.');
    }

    // 1b. (UX) comprobar si el paciente ya existe mediante el API interno de Next.js
    try {
      const dupCheck = await api.post('/api/pacientes/check', { nombre: nombreMascota.trim(), propietarios_cedula: cedulaPropietario.trim() });
      if (dupCheck?.data?.exists) {
        throw new Error('Paciente ya registrado para este propietario');
      }
    } catch (e) {
      if (e.message && e.message.includes('Paciente ya registrado')) throw e;
      // Si hay error diferente al duplicado, ignoramos (la verificación de duplicados es opcional)
    }

    // 2. crear paciente (endpoint del API Express)
    const payload = {
      nombreMascota: nombreMascota.trim(),
      especie: especie.trim(),
      raza: raza ? raza.trim() : '',
      edad: edad === '' ? '' : Number(edad),
      peso: peso === '' ? '' : Number(peso),
      altura: altura === '' ? '' : Number(altura),
      propietarios_cedula: cedulaPropietario.trim(), // nombre columna en tu BD
    };

    // Usamos el endpoint interno de Next.js para que la validación/prevención de duplicados se aplique en servidor
    const createRes = await api.post('/api/pacientes', payload);

    if (createRes?.data?.error) {
      throw new Error(createRes.data.error);
    }

    if (createRes?.data?.success) {
      return createRes.data;
    }

    throw new Error('Respuesta inesperada del servidor al crear paciente');

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const msg = error.response?.data?.message || error.response?.data?.error || error.response.statusText;
      devLog('createPatient error response:', error.response.status, error.response.data);
      throw new Error(msg || 'Error del servidor');
    } else if (error.message) {
      throw error;
    }
    throw new Error('Error desconocido al crear paciente');
  }
}
