import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/citas/list`;
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas list:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
