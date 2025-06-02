import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// DELETE handler
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  let imageUrl = '';
  try {
    // Leer body (JSON)
    const body = await req.json();
    imageUrl = body.imageUrl;

    // Si hay URL de imagen, extraemos filename y lo borramos de Supabase Storage
    if (imageUrl) {
      const filename = imageUrl.split('/').pop();
      if (filename) {
        await supabase.storage.from('watches').remove([filename]);
      }
    }

    // Borrar el registro en la base de datos con Prisma
    await prisma.watch.delete({ where: { id } });

    return NextResponse.json({ message: 'Watch deleted successfully' });
  } catch (error) {
    console.error('Error deleting watch or image:', error);
    return NextResponse.json(
      { error: 'Failed to delete watch' },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    // Leer body (JSON) con datos a actualizar
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
    console.error('Error updating watch:', error);
    return NextResponse.json(
      { error: 'Failed to update watch' },
      { status: 500 }
    );
  }
}