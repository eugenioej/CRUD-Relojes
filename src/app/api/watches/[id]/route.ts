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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await req.json();

    const updated = await prisma.watch.update({
      where: { id },
      data,
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Update failed', { status: 500 });
  }
}