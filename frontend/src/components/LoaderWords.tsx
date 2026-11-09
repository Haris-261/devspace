'use client';
import { useEffect, useLayoutEffect } from 'react';

const DEFAULT_WORDS = ['Ideate', 'Design', 'Develop', 'Innovate'];
const LS_KEY = 'loaderWords';

function validateWords(v: unknown): string[] | null {
  if (!Array.isArray(v) || v.length < 1 || v.length > 6) return null;
  const words = v.filter(
    (w): w is string =>
      typeof w === 'string' && w.trim().length > 0 && w.length <= 20,
  );
  return words.length >= 1 ? words : null;
}

export default function LoaderWords({ serverWords }: { serverWords: string[] }) {
  // Before animation starts: swap DOM from localStorage (cached from last visit)
  useLayoutEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(LS_KEY) ?? 'null');
      const words = validateWords(cached);
      if (!words) return;
      const container = document.getElementById('loader-steps');
      if (!container) return;
      container.innerHTML = '';
      words.forEach((w, i) => {
        const em = document.createElement('em');
        em.style.setProperty('--w', String(i));
        em.textContent = w.toUpperCase() + '.';
        container.appendChild(em);
      });
    } catch {
      // ignore
    }
  }, []);

  // Write latest server words to localStorage so next visit uses them
  useEffect(() => {
    try {
      const words = validateWords(serverWords);
      if (words) localStorage.setItem(LS_KEY, JSON.stringify(words));
    } catch {
      // ignore
    }
  }, [serverWords]);

  return null;
}

