import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/propietarios`;

    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying propietarios:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
