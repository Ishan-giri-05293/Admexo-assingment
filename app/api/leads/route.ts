import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, requirement } = body;

    if (!name || !email || !phone || !requirement) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Insert lead into database
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        company: company || null,
        requirement,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Send email via Resend
    const emailSent = await sendEmail(lead);

    // Update email_sent status
    if (emailSent) {
      await supabase
        .from('leads')
        .update({ email_sent: true })
        .eq('id', lead.id);
    }

    return NextResponse.json({ success: true, id: lead.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendEmail(lead: { id: string; name: string; email: string; requirement: string }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not configured, skipping email');
    return false;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const trackingPixel = `${baseUrl}/api/track/open?id=${lead.id}`;
  const ctaLink = `${baseUrl}/api/track/click?id=${lead.id}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
      <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1e40af; font-size: 24px; margin: 0;">LeadFlow AI</h1>
        </div>

        <p style="color: #0f172a; font-size: 16px; line-height: 1.6;">
          Hi <strong>${escapeHtml(lead.name)}</strong>,
        </p>

        <p style="color: #334155; font-size: 16px; line-height: 1.6;">
          Thank you for contacting us. We have received your inquiry and our team will get back to you shortly.
        </p>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #1e40af;">
          <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 600;">Your Requirement:</p>
          <p style="margin: 0; color: #0f172a; font-size: 15px; line-height: 1.6;">"${escapeHtml(lead.requirement)}"</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${escapeHtml(ctaLink)}" style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Learn More About Our Services
          </a>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          Best regards,<br>The LeadFlow AI Team
        </p>
      </div>

      <img src="${escapeHtml(trackingPixel)}" width="1" height="1" alt="" style="border: 0; display: block; height: 1px; width: 1px;" />
    </body>
    </html>
  `;

  const text = `
Hi ${lead.name},

Thank you for contacting us. We have received your inquiry and our team will get back to you shortly.

Your Requirement:
"${lead.requirement}"

Best regards,
The LeadFlow AI Team
  `.trim();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "LeadFlow AI <onboarding@resend.dev>",
        to: lead.email,
        subject: 'Thank you for contacting LeadFlow AI',
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
