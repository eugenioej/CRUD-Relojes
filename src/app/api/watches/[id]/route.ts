// src/app/api/watches/[id]/route.ts

import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

// DELETE handler
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const { id } = params;
  try {
    const body = await request.json();
    const imageUrl = body.imageUrl as string | undefined;

    if (imageUrl) {
      const filename = imageUrl.split('/').pop()!;
      await supabase.storage.from('watches').remove([filename]);
    }

    await prisma.watch.delete({ where: { id } });
    return new Response(
      JSON.stringify({ message: 'Watch deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error deleting watch or image:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete watch' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PUT handler
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const { id } = params;
  try {
    const body = await request.json();

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
    return new Response(
      JSON.stringify({ error: 'Failed to update watch' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}