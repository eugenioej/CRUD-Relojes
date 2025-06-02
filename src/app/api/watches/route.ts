import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// GET: Obtener todos los relojes
export async function GET() {
  try {
    const watches = await prisma.watch.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(watches);
  } catch (error) {
    console.error('GET /api/watches error:', error);
    return NextResponse.json({ error: 'Error al obtener relojes' }, { status: 500 });
  }
}

// POST: Crear un nuevo reloj
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, brand, price, description, imageUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const newWatch = await prisma.watch.create({
      data: {
        id: uuidv4(), // ✅ Generar UUID correctamente
        name,
        brand,
        price: price !== undefined && price !== null ? parseFloat(price) : null,
        description,
        imageUrl,
      },
    });

    return NextResponse.json(newWatch);
  } catch (error) {
    console.error('POST /api/watches error:', error);
    return NextResponse.json({ error: 'Error al crear reloj' }, { status: 500 });
  }
}