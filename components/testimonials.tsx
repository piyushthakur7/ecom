'use client';

import React, { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';
import type { DBReview } from '@/lib/types';

export function Testimonials() {
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        const { data, error } = await insforge.database
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
        if (data && !error) {
          setReviews(data as DBReview[]);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-section">
      <div className="section">
        <span className="section-kicker" style={{ marginBottom: 28 }}>
          What our customers say
        </span>
        <div className="testimonials-grid">
          {reviews.map((t) => (
            <figure key={t.id} className="testimonial-card">
              <span aria-hidden="true" className="testimonial-quote-icon">
                “
              </span>
              <blockquote className="testimonial-quote">
                {t.comment}
              </blockquote>
              <figcaption className="testimonial-author">
                — {t.user_name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
