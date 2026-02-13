import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'edge' in globalThis ? 'edge' : 'nodejs';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9.\-_%]/g, '_');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/${fileName}`;
    return NextResponse.json({ success: true, url: publicUrl, name: file.name });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('Upload error:', err);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
