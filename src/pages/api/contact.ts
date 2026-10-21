import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import settings from '../../content/settings.json';

// Se ejecuta en el servidor (Vercel). Requiere RESEND_API_KEY en las variables de entorno.
export const prerender = false;

const clean = (v: FormDataEntryValue | null, max = 5000) => String(v ?? '').trim().slice(0, max);
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const escape = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  const data = await request.formData();
  if (clean(data.get('website'))) return Response.json({ ok: true }); // honeypot: bots
  const name = clean(data.get('name'), 120);
  const email = clean(data.get('email'), 200);
  const company = clean(data.get('company'), 160);
  const message = clean(data.get('message'));
  const lang = clean(data.get('lang'), 2) === 'en' ? 'en' : 'es';
  if (!name || !isEmail(email) || !message) return Response.json({ ok: false, error: 'invalid' }, { status: 400 });

  const key = import.meta.env.RESEND_API_KEY;
  if (!key) return Response.json({ ok: false, error: 'not-configured' }, { status: 503 });

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: import.meta.env.CONTACT_FROM || 'Portafolio <onboarding@resend.dev>',
    to: import.meta.env.CONTACT_TO || settings.email,
    replyTo: email,
    subject: `Portafolio (${lang.toUpperCase()}): ${name}${company ? ` · ${company}` : ''}`,
    text: `${message}\n\n— ${name} <${email}>${company ? `\n${company}` : ''}`,
    html: `<p>${escape(message).replace(/\n/g, '<br>')}</p><p>— ${escape(name)} &lt;${escape(email)}&gt;${company ? `<br>${escape(company)}` : ''}</p>`,
  });
  if (error) return Response.json({ ok: false, error: 'send-failed' }, { status: 502 });
  return Response.json({ ok: true });
};
