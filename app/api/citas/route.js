import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[citas GET] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[citas GET] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    // Extraer query params (puede ser /list, /fecha/2026-02-27, /horarios/2026-02-28, /propietario/123, etc)
    const url = new URL(request.url);
    const pathname = url.pathname.replace('/api/citas', '');
    const queryParams = url.search;

    const apiUrl = `${EXTERNAL_API}/citas${pathname}${queryParams}`;
    console.log('[citas GET] Calling:', apiUrl);
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    console.log('[citas GET] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas GET:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[citas POST] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[citas POST] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/citas`;
    console.log('[citas POST] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[citas POST] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas POST:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[citas PUT] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[citas PUT] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de cita requerido' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/citas/${id}`;
    console.log('[citas PUT] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[citas PUT] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas PUT:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[citas DELETE] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[citas DELETE] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de cita requerido' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/citas/${id}`;
    console.log('[citas DELETE] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('[citas DELETE] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas DELETE:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}
