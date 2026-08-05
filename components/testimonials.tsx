import React from 'react';
import { testimonials } from '@/lib/data';

export function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="section">
        <span className="section-kicker" style={{ marginBottom: 28 }}>
          What our customers say
        </span>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <figure key={t.name} className="testimonial-card">
              <span aria-hidden="true" className="testimonial-quote-icon">
                “
              </span>
              <blockquote className="testimonial-quote">
                {t.quote}
              </blockquote>
              <figcaption className="testimonial-author">
                — {t.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
