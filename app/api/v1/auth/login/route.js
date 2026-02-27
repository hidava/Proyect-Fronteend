import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[auth/v1/login POST] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[auth/v1/login POST] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/auth/login`;
    console.log('[auth/v1/login POST] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[auth/v1/login POST] Response status:', res.status);
    
    // Verificar si la respuesta es JSON válido
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('[auth/v1/login POST] API no devolvió JSON:', text.substring(0, 200));
      return NextResponse.json({ 
        success: false, 
        error: 'La API externa no está disponible. El servidor en Vercel puede estar teniendo problemas.',
        apiUrl 
      }, { status: 503 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying auth login POST:', err?.message || err);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al conectar con la API externa', 
      details: err?.message 
    }, { status: 500 });
  }
}

