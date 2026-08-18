'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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

  // Only the loading frame is hidden. With no reviews yet the section still
  // renders an empty state, so it never silently disappears from the page.
  if (loading) return null;

  return (
    <section className="testimonials-section">
      <div className="section">
        <span className="section-kicker" style={{ marginBottom: 28 }}>
          What our customers say
        </span>

        {reviews.length === 0 ? (
          <div className="testimonials-empty">
            <p className="testimonials-empty-title">No reviews yet</p>
            <p className="testimonials-empty-body">
              Be the first to share how your Saanshika piece fit and felt. Open any
              product and tap &ldquo;Write a Review&rdquo;.
            </p>
            <Link href="/shop" className="btn btn-secondary">Browse products</Link>
          </div>
        ) : (
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
        )}
      </div>
    </section>
  );
}
