import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, propietarios_cedula } = body || {};

    if (!nombre || !propietarios_cedula) {
      return NextResponse.json({ error: 'Nombre y cédula son obligatorios' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT id_mascota FROM pacientes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND propietarios_cedula = ? LIMIT 1',
      [nombre.trim(), propietarios_cedula.trim()]
    );

    return NextResponse.json({ exists: rows.length > 0 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error checking paciente:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
