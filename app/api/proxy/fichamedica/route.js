import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const EXTERNAL = process.env.EXTERNAL_API_BASE;
    if (!EXTERNAL) {
      return NextResponse.json({ success: false, error: 'No EXTERNAL_API_BASE configured' }, { status: 400 });
    }

    const url = new URL(EXTERNAL);
    // append path `/fichamedica` by default
    url.pathname = (url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname) + '/fichamedica';

    const headers = {};
    // forward authorization cookie if present
    const cookie = request.headers.get('cookie');
    if (cookie) headers['cookie'] = cookie;

    const res = await fetch(url.toString(), { method: 'GET', headers, cache: 'no-store' });
    const contentType = res.headers.get('content-type') || '';

    // If JSON return as JSON, otherwise return text/html preserving content-type
    if (contentType.includes('application/json')) {
      const json = await res.json();
      return NextResponse.json({ success: true, data: json });
    }
    const text = await res.text();
    return new NextResponse(text, { headers: { 'Content-Type': contentType || 'text/html' } });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Proxy fichamedica error:', err);
    return NextResponse.json({ success: false, error: 'Proxy error' }, { status: 500 });
  }
}
