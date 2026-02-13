import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cedula } = body;

    if (!cedula || typeof cedula !== 'string' || cedula.trim() === '') {
      return NextResponse.json({ error: 'Cédula inválida' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT 1 FROM propietarios WHERE cedula = ? LIMIT 1', [cedula.trim()]);

    return NextResponse.json({ exists: rows.length > 0 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error checking cedula:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
