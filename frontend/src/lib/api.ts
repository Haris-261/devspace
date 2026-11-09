import { PortfolioData, Testimonial } from './types';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function getPortfolio(): Promise<PortfolioData> {
  const fallback = await import('./fallback').then((m) => m.default as PortfolioData);
  try {
    const r = await fetch(`${API}/portfolio`, { next: { revalidate: 60 } });
    if (!r.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[API] getPortfolio failed with status ${r.status}`);
      }
      return fallback;
    }
    const data = await r.json();
    if (!data || typeof data !== 'object') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[API] getPortfolio received unexpected response shape', data);
      }
      return fallback;
    }
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[API] getPortfolio network/fetch error:', err);
    }
    return fallback;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const r = await fetch(`${API}/testimonials`, { next: { revalidate: 60 } });
    if (!r.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[API] getTestimonials failed with status ${r.status}`);
      }
      return [];
    }
    const data = await r.json();
    if (!Array.isArray(data)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[API] getTestimonials received non-array data', data);
      }
      return [];
    }
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[API] getTestimonials network/fetch error:', err);
    }
    return [];
  }
}

export async function sendMessage(body: Record<string, string>) {
  const r = await fetch(`${API}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.message || 'Unable to send message');
  return d;
}
