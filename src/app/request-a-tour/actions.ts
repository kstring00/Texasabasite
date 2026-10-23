'use server';

import { getLocation } from '@/data/locations';

export type TourRequestResult =
  | { ok: true; name: string; center: string }
  | { ok: false; error: string; fields?: Record<string, string> };

const TIMES = ['mornings', 'afternoons', 'evenings', 'weekends'] as const;
const AGES = ['under-3', '3-6', '7-12', '13-plus'] as const;
const LANGS = ['en', 'es'] as const;

function clean(v: FormDataEntryValue | null, max = 200) {
  return (typeof v === 'string' ? v : '').trim().slice(0, max);
}

/**
 * Logs the request and, when RESEND_API_KEY is set, emails it.
 * Collects no protected health information by design: no diagnosis, no history, no insurance ids.
 */
export async function submitTourRequest(_prev: TourRequestResult | null, formData: FormData): Promise<TourRequestResult> {
  // Honeypot: real people never fill this.
  if (clean(formData.get('website'))) return { ok: true, name: 'there', center: 'your center' };

  const firstName = clean(formData.get('firstName'), 80);
  const phone = clean(formData.get('phone'), 40);
  const centerSlug = clean(formData.get('center'), 40);
  const times = formData.getAll('times').map((t) => clean(t)).filter((t) => (TIMES as readonly string[]).includes(t));
  const email = clean(formData.get('email'), 120);
  const age = clean(formData.get('age'), 20);
  const language = clean(formData.get('language'), 5) || 'en';
  const note = clean(formData.get('note'), 500);
  const about = clean(formData.get('about'), 40);
  const contact = clean(formData.get('contact'), 40);
  const attribution = clean(formData.get('attribution'), 1000);

  const fields: Record<string, string> = {};
  if (!firstName) fields.firstName = 'Your first name helps us know who to text.';
  if (!/^[\d\s().+-]{7,}$/.test(phone)) fields.phone = 'A phone number we can text, like 713-555-0100.';
  const center = getLocation(centerSlug);
  if (!center) fields.center = 'Pick the center you would like to visit.';
  if (times.length === 0) fields.times = 'Pick at least one time that usually works.';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'That email does not look right.';
  if (age && !(AGES as readonly string[]).includes(age)) fields.age = 'Pick an age range.';
  if (!(LANGS as readonly string[]).includes(language)) fields.language = 'Pick a language.';
  if (Object.keys(fields).length > 0 || !center) return { ok: false, error: 'A couple of things need a look.', fields };

  const payload = {
    receivedAt: new Date().toISOString(),
    firstName,
    phone,
    center: center.name,
    centerSlug: center.slug,
    times,
    email: email || null,
    childAge: age || null,
    language,
    note: note || null,
    about: about || 'tour',
    attribution: safeJson(attribution),
  };

  // Always log: the demo has no CRM yet. Vercel keeps function logs.
  console.log('[tour_request]', JSON.stringify(payload));

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const to = (process.env.TOUR_REQUEST_TO ?? 'kyle@stringhamwebdesign.com').split(',').map((s) => s.trim());
      await resend.emails.send({
        from: process.env.TOUR_REQUEST_FROM ?? 'Texas ABA Centers site <onboarding@resend.dev>',
        to,
        subject: `Tour request: ${center.name} · ${firstName}`,
        text: [
          `Center: ${center.name}`,
          `Name: ${firstName}`,
          `Phone: ${phone}`,
          `Email: ${email || '-'}`,
          `Preferred times: ${times.join(', ')}`,
          `Child's age: ${age || '-'}`,
          `Language: ${language}`,
          `Asked about: ${payload.about}`,
          `Note: ${note || '-'}`,
          `Ask for: ${contact || '-'}`,
          `Source: ${attribution || '-'}`,
          `Received: ${payload.receivedAt}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('[tour_request] email failed', err);
      // The family still gets the confirmation. The log has the request.
    }
  }

  return { ok: true, name: firstName, center: center.slug };
}

function safeJson(s: string) {
  try {
    return s ? JSON.parse(s) : null;
  } catch {
    return s;
  }
}
