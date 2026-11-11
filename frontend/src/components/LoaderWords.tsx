'use client';
import { useEffect } from 'react';

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
  useEffect(() => {
    try {
      const words = validateWords(serverWords);
      if (words && words.length > 0) {
        localStorage.setItem(LS_KEY, JSON.stringify(words));
      }
    } catch {
      // ignore
    }
  }, [serverWords]);

  return null;
}
