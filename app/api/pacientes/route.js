import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nombreMascota,
      especie,
      raza,
      edad,
      peso,
      altura,
      cedulaPropietario,
      propietarios_cedula,
    } = body || {};

    // Normalize cedula: accept either `cedulaPropietario` (frontend older) or `propietarios_cedula` (API payload)
    const cedula = (cedulaPropietario || propietarios_cedula || '').toString().trim();

    // Validaciones servidor
    if (!nombreMascota || typeof nombreMascota !== 'string' || nombreMascota.trim() === '') {
      return NextResponse.json({ error: 'Nombre de la mascota es obligatorio' }, { status: 400 });
    }
    if (!especie || typeof especie !== 'string' || especie.trim() === '') {
      return NextResponse.json({ error: 'Especie es obligatoria' }, { status: 400 });
    }
    if (!cedulaPropietario || typeof cedulaPropietario !== 'string' || cedulaPropietario.trim() === '') {
      return NextResponse.json({ error: 'Cédula del propietario es obligatoria' }, { status: 400 });
    }

    const edadNum = (edad !== undefined && edad !== null && edad !== '') ? Number(edad) : null;
    const pesoNum = (peso !== undefined && peso !== null && peso !== '') ? Number(peso) : null;
    const alturaNum = (altura !== undefined && altura !== null && altura !== '') ? Number(altura) : null;

    if (edadNum !== null && (Number.isNaN(edadNum) || edadNum < 0)) {
      return NextResponse.json({ error: 'Edad debe ser un número válido mayor o igual a 0' }, { status: 400 });
    }
    if (pesoNum !== null && (Number.isNaN(pesoNum) || pesoNum < 0)) {
      return NextResponse.json({ error: 'Peso debe ser un número válido mayor o igual a 0' }, { status: 400 });
    }
    if (alturaNum !== null && (Number.isNaN(alturaNum) || alturaNum < 0)) {
      return NextResponse.json({ error: 'Altura debe ser un número válido mayor o igual a 0' }, { status: 400 });
    }

    // Verificar existencia del propietario
    const [ownerRows] = await pool.query('SELECT cedula FROM propietarios WHERE cedula = ? LIMIT 1', [cedula]);
    if (ownerRows.length === 0) {
      return NextResponse.json({ error: 'Cédula del propietario no encontrada' }, { status: 400 });
    }

    // Evitar duplicados: mismo nombre de mascota para el mismo propietario
    const [existing] = await pool.query('SELECT id_mascota FROM pacientes WHERE LOWER(nombre) = LOWER(?) AND propietarios_cedula = ? LIMIT 1', [nombreMascota.trim(), cedula]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Paciente ya registrado para este propietario' }, { status: 409 });
    }

    // Insertar en tabla pacientes
    const insertQuery = `INSERT INTO pacientes (nombre, especie, raza, edad, peso, altura, propietarios_cedula) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(insertQuery, [
      nombreMascota.trim(),
      especie.trim(),
      raza ? raza.trim() : null,
      edadNum,
      pesoNum,
      alturaNum,
      cedula,
    ]);

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error creating paciente:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
