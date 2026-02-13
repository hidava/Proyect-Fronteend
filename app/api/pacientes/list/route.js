import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id_mascota AS id, nombre FROM pacientes ORDER BY nombre ASC');
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching pacientes list:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
