import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// DELETE Handler
export async function DELETE(
  req: NextRequest,
  context: { params: Record<string, string> }
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
    return NextResponse.json({ message: 'Watch deleted successfully' });
  } catch (error) {
    console.error('Error deleting watch or image:', error);
    return NextResponse.json({ error: 'Failed to delete watch' }, { status: 500 });
  }
}

// PUT Handler
export async function PUT(
  req: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params;

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

    return new Response(JSON.stringify(updatedWatch), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating watch:', error);
    return new Response('Failed to update watch', { status: 500 });
  }
}