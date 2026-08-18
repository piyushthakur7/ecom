'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCategories } from '@/lib/services/products.service';
import type { DBCategory } from '@/lib/types';

export function Categories() {
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section id="categories" style={{ background: 'var(--color-neutral-100)' }}>
        <div className="section">
          <span className="section-kicker">Shop by category</span>
          <h2 className="section-title" style={{ marginBottom: 36 }}>Explore Collections</h2>
          <div className="categories-scroll">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div className="category-circle" style={{ background: 'var(--color-neutral-200)', border: 'none', animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: 60, height: 12, borderRadius: 4, background: '#e5e5e5' }} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section id="categories" style={{ background: 'var(--color-neutral-100)' }}>
      <div className="section">
        <span className="section-kicker">Shop by category</span>
        <h2 className="section-title" style={{ marginBottom: 36 }}>
          Explore Collections
        </h2>

        <div className="categories-scroll">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="category-circle-link"
            >
              <div className="category-circle">
                <Image
                  src={cat.src || '/images/hero/banner-1.jpg'}
                  alt={cat.alt || cat.name}
                  fill
                  sizes="(max-width: 480px) 108px, (max-width: 900px) 128px, 152px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div>
                <div className="category-circle-name">{cat.name}</div>
                {cat.count && <div className="category-circle-count">{cat.count}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
