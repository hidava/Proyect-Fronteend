import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    // Construir la ruta desde los params dinámicos
    const slug = params.slug.join('/');
    const searchParams = new URL(request.url).search;
    
    const apiUrl = `${EXTERNAL_API}/citas/${slug}${searchParams}`;
    
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/citas`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas POST:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const body = await request.json();
    const slug = params.slug.join('/');
    const apiUrl = `${EXTERNAL_API}/citas/${slug}`;

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas PUT:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }

    const slug = params.slug.join('/');
    const apiUrl = `${EXTERNAL_API}/citas/${slug}`;

    const res = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying citas DELETE:', err);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}
