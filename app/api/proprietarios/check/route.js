import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[propietarios check POST] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[propietarios check POST] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/propietarios/check`;
    console.log('[propietarios check POST] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[propietarios check POST] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying propietarios check POST:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}
