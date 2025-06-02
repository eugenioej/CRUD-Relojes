import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
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

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const body = await req.json();
    const { name, brand, price, description, imageUrl } = body;

    const currentWatch = await prisma.watch.findUnique({ where: { id } });
    if (!currentWatch) {
      return NextResponse.json({ error: 'Reloj no encontrado' }, { status: 404 });
    }

    const updatedWatch = await prisma.watch.update({
      where: { id },
      data: {
        name: name ?? currentWatch.name,
        brand: brand ?? currentWatch.brand,
        price: typeof price === 'number' ? price : currentWatch.price,
        description: description ?? currentWatch.description,
        imageUrl: imageUrl ?? currentWatch.imageUrl,
      },
    });

    return NextResponse.json({ message: 'Reloj actualizado', watch: updatedWatch });
  } catch (error) {
    console.error('Error al actualizar reloj:', error);
    return NextResponse.json({ error: 'No se pudo actualizar el reloj' }, { status: 500 });
  }
}