import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const imageUrl = body.imageUrl;

  try {
    if (imageUrl) {
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      await supabase.storage.from('watches').remove([filename]);
    }

    await prisma.watch.delete({ where: { id } });
    return NextResponse.json({ message: 'Reloj eliminado' });
  } catch (error) {
    console.error('Error al eliminar reloj o imagen:', error);
    return NextResponse.json({ error: 'No se pudo eliminar el reloj' }, { status: 500 });
  }
}

// ESTA ES LA CLAVE: NO TIPO EXTERNO, SOLO DESTRUCTURACIÓN
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await req.json();

    const updatedWatch = await prisma.watch.update({
      where: { id },
      data: {
        name: body.name,
        brand: body.brand,
        price: body.price,
        description: body.description,
        imageUrl: body.imageUrl,
      },
    });

    return NextResponse.json(updatedWatch, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el reloj:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el reloj' }, { status: 500 });
  }
}