import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/lib/data';

export function Categories() {
  return (
    <section id="categories" style={{ background: 'var(--color-neutral-100)' }}>
      <div className="section">
        <span className="section-kicker">Shop by category</span>
        <h2 className="section-title" style={{ marginBottom: 36 }}>
          Seven ways to wear it
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
                  src={cat.src}
                  alt={cat.alt}
                  fill
                  sizes="(max-width: 480px) 76px, (max-width: 900px) 96px, 128px"
                  style={{ objectFit: 'cover' }}
                  title={cat.credit}
                />
              </div>
              <div>
                <div className="category-circle-name">{cat.name}</div>
                <div className="category-circle-count">{cat.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
