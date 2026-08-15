'use client';

import { useEffect, useState } from 'react';
import { insforge } from '@/lib/insforge-client';

/* ── Types ─────────────────────────────────────────────────────────────── */
export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;       // 1–5
  title: string;
  comment: string;
  date: string;         // ISO date string
  verified: boolean;
};

/* ── Helpers ────────────────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function avg(reviews: Review[]) {
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
}

function countByRating(reviews: Review[], star: number) {
  return reviews.filter((r) => r.rating === star).length;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = [
  'var(--color-avatar-1)',
  'var(--color-avatar-2)',
  'var(--color-avatar-3)',
  'var(--color-avatar-4)',
  'var(--color-avatar-5)',
];
function avatarColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── Interactive Star Selector ─────────────────────────────────────────── */
function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-selector" aria-label="Choose a star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-select-btn ${star <= (hover || value) ? 'filled' : ''}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="star-select-label">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

/* ── Rating Summary Bar ─────────────────────────────────────────────────── */
function RatingSummary({ reviews }: { reviews: Review[] }) {
  const mean = avg(reviews);
  const total = reviews.length;

  return (
    <div className="review-summary">
      <div className="review-summary-score">
        <span className="review-big-num">{mean.toFixed(1)}</span>
        <div className="review-big-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= Math.round(mean) ? 'star-filled' : 'star-empty'}>★</span>
          ))}
        </div>
        <span className="review-total">{total} review{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="review-bars">
        {[5, 4, 3, 2, 1].map((star) => {
          const c = countByRating(reviews, star);
          const pct = total ? (c / total) * 100 : 0;
          return (
            <div key={star} className="review-bar-row">
              <span className="review-bar-label">{star}★</span>
              <div className="review-bar-track">
                <div className="review-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="review-bar-count">{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Review Card ────────────────────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="review-card">
      <div className="review-card-header">
        <div className="review-avatar" style={{ background: avatarColor(review.name) }}>
          {initials(review.name)}
        </div>
        <div className="review-meta">
          <div className="review-author">
            {review.name}
            {review.verified && (
              <span className="review-verified">✔ Verified Purchase</span>
            )}
          </div>
          <div className="review-date">{formatDate(review.date)}</div>
        </div>
        <div className="review-card-stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= review.rating ? 'star-filled' : 'star-empty'} style={{ fontSize: 14 }}>★</span>
          ))}
        </div>
      </div>
      {review.title && <div className="review-title">{review.title}</div>}
      <p className="review-comment">{review.comment}</p>
    </article>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────── */
export function ReviewSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState({ name: '', title: '', comment: '', rating: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await insforge.database
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          const mapped: Review[] = (data as unknown[]).map((r) => {
            const row = r as Record<string, unknown>;
            return {
              id: String(row.id),
              productId: String(row.product_id),
              name: String(row.user_name || 'Anonymous'),
              rating: Number(row.rating || 5),
              title: '',
              comment: String(row.comment || ''),
              date: String(row.created_at || new Date().toISOString()),
              verified: true,
            };
          });
          setReviews(mapped);
        }
      } catch (err) {
        console.error('Failed to load product reviews:', err);
      }
    }
    fetchReviews();
  }, [productId]);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Please enter your name';
    if (form.rating === 0) e.rating = 'Please choose a star rating';
    if (form.comment.trim().length < 5) e.comment = 'Review must be at least 5 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId,
      name: form.name.trim(),
      title: form.title.trim(),
      comment: form.comment.trim(),
      rating: form.rating,
      date: new Date().toISOString(),
      verified: true,
    };

    setReviews((prev) => [newReview, ...prev]);
    setForm({ name: '', title: '', comment: '', rating: 0 });
    setSubmitted(true);
    setShowForm(false);
    setTimeout(() => setSubmitted(false), 4000);

    try {
      await insforge.database.from('reviews').insert([{
        product_id: productId,
        user_name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
      }]);
    } catch (err) {
      console.error('Failed to save review to InsForge database:', err);
    }
  }

  return (
    <section className="review-section">
      {/* Section header */}
      <div className="review-section-header">
        <div>
          <span className="section-kicker">Customer feedback</span>
          <h2 className="section-title" style={{ margin: 0 }}>Ratings &amp; Reviews</h2>
        </div>
        {!showForm && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowForm(true)}
          >
            ✏️ Write a Review
          </button>
        )}
      </div>

      {/* Success toast */}
      {submitted && (
        <div className="review-toast" role="alert">
          ✅ Thank you! Your review has been posted.
        </div>
      )}

      {/* Rating summary */}
      {reviews.length > 0 && <RatingSummary reviews={reviews} />}

      {/* Write-a-review form */}
      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="review-form">
          <div className="review-form-title">Your Review</div>

          {/* Star selector */}
          <div className="form-field">
            <span className="form-label">Rating <span style={{ color: 'var(--color-accent)' }}>*</span></span>
            <StarSelector value={form.rating} onChange={(v) => set('rating', v)} />
            {errors.rating && <span className="review-error">{errors.rating}</span>}
          </div>

          {/* Name */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="review-name" className="form-label">
                Name <span style={{ color: 'var(--color-accent)' }}>*</span>
              </label>
              <input
                id="review-name"
                className="form-input"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
              {errors.name && <span className="review-error">{errors.name}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="review-title" className="form-label">Review title</label>
              <input
                id="review-title"
                className="form-input"
                type="text"
                placeholder="e.g. Love the fabric!"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </div>
          </div>

          {/* Comment */}
          <div className="form-field">
            <label htmlFor="review-comment" className="form-label">
              Review <span style={{ color: 'var(--color-accent)' }}>*</span>
            </label>
            <textarea
              id="review-comment"
              className="form-input review-textarea"
              placeholder="Tell us what you think — fabric quality, fit, delivery…"
              rows={4}
              value={form.comment}
              onChange={(e) => set('comment', e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', alignSelf: 'flex-end' }}>
              {form.comment.length} / 500
            </span>
            {errors.comment && <span className="review-error">{errors.comment}</span>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>
              Post Review
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setShowForm(false); setErrors({}); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'color-mix(in srgb, var(--color-text) 55%, transparent)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <p style={{ marginBottom: 16 }}>No reviews yet. Be the first to share your thoughts!</p>
          {!showForm && (
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(true)}>
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}
