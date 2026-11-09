'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Testimonial } from '@/lib/types';
import { PiStarFill } from '@/lib/icons';

function getInitials(name: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const cleanWord = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, '');
  const firstClean = cleanWord(words[0]);
  const lastClean = cleanWord(words[words.length - 1]);
  if (!firstClean && !lastClean) return '?';
  if (words.length === 1 || !lastClean) {
    return (firstClean[0] || '?').toUpperCase();
  }
  return (firstClean[0] + lastClean[0]).toUpperCase();
}

function optimizeCloudinaryAvatar(url?: string): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }
  const uploadIndex = url.indexOf('/upload/');
  const afterUpload = url.slice(uploadIndex + '/upload/'.length);
  if (/^[a-z]_[^/]+/.test(afterUpload)) {
    return url;
  }
  return url.replace('/upload/', '/upload/c_fill,g_face,w_112,h_112,f_auto,q_auto/');
}

function TestimonialAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const optimizedUrl = avatarUrl ? optimizeCloudinaryAvatar(avatarUrl) : '';

  if (!optimizedUrl || imgFailed) {
    return (
      <div className="testimonial-avatar testimonial-avatar--initials" aria-hidden="true">
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={optimizedUrl}
      alt={name}
      width={56}
      height={56}
      loading="lazy"
      onError={() => setImgFailed(true)}
      className="testimonial-avatar"
    />
  );
}

function TestimonialMessage({ message }: { message: string }) {
  const textRef = useRef<HTMLQuoteElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkTruncation = () => {
      if (!isExpanded) {
        setIsClamped(el.scrollHeight > el.clientHeight);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [message, isExpanded]);

  return (
    <div className="testimonial-message-wrap">
      <blockquote
        ref={textRef}
        className={`testimonial-message${isExpanded ? ' is-expanded' : ''}`}
      >
        {message}
      </blockquote>
      {(isClamped || isExpanded) && (
        <button
          type="button"
          className="testimonial-read-more"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}

function TestimonialCard({
  item,
  index,
  isRevealed,
  isWaiting,
}: {
  item: Testimonial;
  index: number;
  isRevealed: boolean;
  isWaiting: boolean;
}) {
  const rating = Math.max(1, Math.min(5, Math.round(item.rating ?? 5)));
  const subtitle = [item.role?.trim(), item.company?.trim()].filter(Boolean).join(', ');
  const delay = Math.min(400, (index % 6) * 80);
  const itemClass = isRevealed
    ? 'testimonial-item is-revealed'
    : isWaiting
    ? 'testimonial-item is-waiting'
    : 'testimonial-item';

  return (
    <li
      className={itemClass}
      style={{ '--review-delay': `${delay}ms` } as React.CSSProperties}
    >
      <figure className="testimonial-card">
        <div className="testimonial-top">
          <TestimonialAvatar name={item.name} avatarUrl={item.avatarUrl} />
        </div>

        <TestimonialMessage message={item.message} />

        <figcaption className="testimonial-bottom">
          <div className="testimonial-name">{item.name}</div>
          {subtitle ? <div className="testimonial-role">{subtitle}</div> : null}
          <div
            className="testimonial-stars"
            role="img"
            aria-label={`${rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <PiStarFill
                key={star}
                size={20}
                className={star <= rating ? 'testimonial-star-filled' : 'testimonial-star-empty'}
                aria-hidden="true"
                focusable="false"
              />
            ))}
          </div>
        </figcaption>
      </figure>
    </li>
  );
}

export default function TestimonialsSection({
  testimonials,
}: {
  testimonials?: Testimonial[];
}) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [revealed, setRevealed] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;

    if (inView) {
      setRevealed(true);
      return;
    }

    setWaiting(true);

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setWaiting(false);
          setRevealed(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const visibleList = testimonials.slice(0, visibleCount);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      aria-labelledby="testimonials-heading"
      className="page-section testimonials-section"
    >
      <h2 id="testimonials-heading" className="section-heading">
        Client Reviews - <span>WHAT CLIENTS SAY!</span>
      </h2>

      <ul className="testimonials-grid">
        {visibleList.map((item, index) => (
          <TestimonialCard
            key={item.id}
            item={item}
            index={index}
            isRevealed={revealed}
            isWaiting={waiting}
          />
        ))}
      </ul>

      {visibleCount < testimonials.length && (
        <div className="testimonials-more-wrap">
          <button
            type="button"
            className="testimonials-more-btn"
            onClick={() => setVisibleCount((c) => c + 6)}
          >
            Show more reviews
          </button>
        </div>
      )}
    </section>
  );
}
