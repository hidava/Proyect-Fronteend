import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }
    const apiUrl = `${EXTERNAL_API}/vacunacion/list`;
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying vacunacion list GET:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }
    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/vacunacion`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying vacunacion POST:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }
    const body = await request.json();
    const apiUrl = `${EXTERNAL_API}/vacunacion/${id}`;
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying vacunacion PUT:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const EXTERNAL_API = process.env.EXTERNAL_API_BASE || process.env.NEXT_PUBLIC_EXTERNAL_API_BASE;
    if (!EXTERNAL_API) {
      return NextResponse.json({ success: false, error: 'EXTERNAL_API_BASE no configurado' }, { status: 400 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 });
    }
    const apiUrl = `${EXTERNAL_API}/vacunacion/${id}`;
    const res = await fetch(apiUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('Error proxying vacunacion DELETE:', err?.message || err);
    return NextResponse.json({ success: false, error: 'Error del servidor', details: err?.message }, { status: 500 });
  }
}
