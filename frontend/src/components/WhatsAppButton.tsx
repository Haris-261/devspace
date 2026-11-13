const ENV_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';
const ENV_MESSAGE = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || '';
const DEFAULT_MESSAGE = 'Hi Muhammad, I found your portfolio and would like to connect.';

/** Number and message come from the admin panel (Profile); env vars are only a fallback. */
export default function WhatsAppButton({ number: n, message: m }: { number?: string; message?: string }) {
  const number = (n || ENV_NUMBER).replace(/\D/g, '');
  const message = (m && m.trim()) || ENV_MESSAGE || DEFAULT_MESSAGE;
  if (!number) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return (
    <a
      className="wa-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
    >
      <span className="wa-pulse" />
      <span className="wa-pulse wa-pulse-2" />
      <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
        <path d="M16.004 3C9.38 3 4 8.376 4 14.995c0 2.116.553 4.18 1.6 6.002L4 29l8.18-1.57a12.03 12.03 0 0 0 3.824.62C22.628 28.05 28 22.67 28 16.05 28 9.43 22.628 3 16.004 3zm0 2.2c5.4 0 9.796 4.39 9.796 9.795 0 5.405-4.396 9.8-9.796 9.8-1.2 0-2.37-.22-3.48-.65l-.5-.19-4.85.93.95-4.72-.3-.5a9.74 9.74 0 0 1-1.42-5.07c0-5.4 4.4-9.8 9.8-9.8zm-3.6 4.6c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.5 2.5 1.08 3 .87 3.55.82.55-.05 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57z" />
      </svg>
    </a>
  );
}
