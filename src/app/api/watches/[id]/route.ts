import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// DELETE handler
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const body = await req.json();
  const imageUrl = body.imageUrl;

  try {
    if (imageUrl) {
      const filename = imageUrl.split('/').pop();
      if (filename) {
        await supabase.storage.from('watches').remove([filename]);
      }
    }

    await prisma.watch.delete({ where: { id } });

    return NextResponse.json({ message: 'Reloj eliminado' });
  } catch (error) {
    console.error('Error al eliminar:', error);
    return NextResponse.json({ error: 'Error al eliminar reloj' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();

    const updated = await prisma.watch.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        price: body.price,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error al actualizar:', error);
    return NextResponse.json({ error: 'Error al actualizar reloj' }, { status: 500 });
  }
}