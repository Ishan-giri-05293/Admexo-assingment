import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createServerClient();

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }

  const totalLeads = leads?.length || 0;
  const emailsSent = leads?.filter((l) => l.email_sent).length || 0;
  const emailsOpened = leads?.filter((l) => l.opened).length || 0;
  const linkClicks = leads?.filter((l) => l.clicked).length || 0;

  const openRate = emailsSent > 0 ? (emailsOpened / emailsSent) * 100 : 0;
  const clickRate = emailsSent > 0 ? (linkClicks / emailsSent) * 100 : 0;

  return NextResponse.json({
    leads,
    stats: {
      totalLeads,
      emailsSent,
      emailsOpened,
      linkClicks,
      openRate,
      clickRate,
    },
  });
}
