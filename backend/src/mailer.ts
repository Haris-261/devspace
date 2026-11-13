import * as nodemailer from 'nodemailer';

type ContactPayload = { name: string; email: string; subject: string; message: string };

const escapeHtml = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Strips CR/LF so user input can never inject extra mail headers. */
const oneLine = (v: unknown) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim();

function createTransport() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, ''); // Gmail shows app passwords with spaces
  if (!user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });
}

/**
 * Emails the portfolio owner when someone submits the contact form.
 * Never throws: the message is already saved in the database, so a mail
 * failure must not make the visitor's submission fail.
 */
export async function notifyOwnerOfContact(c: ContactPayload): Promise<void> {
  const transport = createTransport();
  const to = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;
  if (!transport || !to) {
    console.warn('[mailer] SMTP_USER / SMTP_PASS not set - skipping contact email notification');
    return;
  }
  try {
    const info = await transport.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to,
      replyTo: `"${oneLine(c.name).replace(/"/g, '')}" <${oneLine(c.email)}>`,
      subject: `New portfolio message: ${oneLine(c.subject)}`.slice(0, 200),
      text: `Name: ${oneLine(c.name)}\nEmail: ${oneLine(c.email)}\nSubject: ${oneLine(c.subject)}\n\n${c.message}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px">
        <h2 style="color:#8a1fd6">New message from your portfolio</h2>
        <p><b>Name:</b> ${escapeHtml(c.name)}</p>
        <p><b>Email:</b> <a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></p>
        <p><b>Subject:</b> ${escapeHtml(c.subject)}</p>
        <hr/>
        <p style="white-space:pre-wrap">${escapeHtml(c.message)}</p>
        <p style="color:#888;font-size:12px">Hit Reply to answer ${escapeHtml(c.name)} directly.</p>
      </div>`,
    });
    console.log('[mailer] contact notification sent:', info.messageId);
  } catch (err) {
    console.error('[mailer] failed to send contact notification:', (err as Error).message);
  }
}
