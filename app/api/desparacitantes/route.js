import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[desparacitacion list GET] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[desparacitacion list GET] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/desparacitacion/list`;
    console.log('[desparacitacion list GET] Calling:', apiUrl);
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    console.log('[desparacitacion list GET] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying desparacitacion list GET:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[desparacitacion POST] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[desparacitacion POST] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/desparacitacion`;
    console.log('[desparacitacion POST] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[desparacitacion POST] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying desparacitacion POST:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[desparacitacion PUT] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[desparacitacion PUT] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/desparacitacion/${id}`;
    console.log('[desparacitacion PUT] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    console.log('[desparacitacion PUT] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying desparacitacion PUT:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    console.log('[desparacitacion DELETE] EXTERNAL_API:', EXTERNAL_API);
    
    if (!EXTERNAL_API) {
      console.error('[desparacitacion DELETE] EXTERNAL_API_BASE no configurado');
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }

    const apiUrl = `${EXTERNAL_API}/desparacitacion/${id}`;
    console.log('[desparacitacion DELETE] Calling:', apiUrl);

    const res = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('[desparacitacion DELETE] Response status:', res.status);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying desparacitacion DELETE:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}
