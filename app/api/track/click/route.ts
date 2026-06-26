import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (id) {
    try {
      const supabase = createServerClient();
      await supabase
        .from('leads')
        .update({ clicked: true })
        .eq('id', id);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  }

  return NextResponse.redirect('https://openai.com', {
    status: 302,
  });
}
