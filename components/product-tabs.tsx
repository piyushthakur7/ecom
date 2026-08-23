'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { ReviewSection } from '@/components/review-section';
import type { DBProduct } from '@/lib/types';

type TabId = 'description' | 'details' | 'shipping' | 'reviews';

type TabDef = { id: TabId; label: string };

/**
 * Product detail tabs: description, spec table, policies and reviews.
 *
 * Follows the WAI-ARIA tabs pattern - a roving tabindex on the tablist plus
 * arrow/Home/End keys, so the whole strip is one tab stop for keyboard users.
 * Panels stay mounted-on-demand (only the active one renders) to keep the
 * review fetch from firing until someone actually opens that tab.
 */
export function ProductTabs({ product }: { product: DBProduct }) {
  const uid = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const detailEntries = product.details ? Object.entries(product.details) : [];

  const tabs: TabDef[] = [
    { id: 'description', label: 'Description' },
    ...(detailEntries.length > 0 ? [{ id: 'details' as const, label: 'Product Details' }] : []),
    { id: 'shipping', label: 'Shipping & Returns' },
    { id: 'reviews', label: product.reviews_count > 0 ? `Reviews (${product.reviews_count})` : 'Reviews' },
  ];

  const [active, setActive] = useState<TabId>('description');

  const focusTab = useCallback((id: TabId) => {
    setActive(id);
    tabRefs.current[id]?.focus();
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = tabs.findIndex((t) => t.id === active);
    let next: number | null = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    focusTab(tabs[next].id);
  }

  const tabId = (id: TabId) => `${uid}-tab-${id}`;
  const panelId = (id: TabId) => `${uid}-panel-${id}`;

  return (
    <div className="product-tabs">
      <div className="product-tablist" role="tablist" aria-label="Product information">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={tabId(t.id)}
            ref={(el) => { tabRefs.current[t.id] = el; }}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            aria-controls={panelId(t.id)}
            tabIndex={active === t.id ? 0 : -1}
            className={`product-tab ${active === t.id ? 'active' : ''}`}
            onClick={() => setActive(t.id)}
            onKeyDown={handleKeyDown}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        id={panelId(active)}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        tabIndex={0}
        className="product-tabpanel"
      >
        {active === 'description' && (
          <p className="product-desc" style={{ maxWidth: '70ch', fontSize: 15 }}>
            {product.description}
          </p>
        )}

        {active === 'details' && (
          <dl className="product-spec-list">
            {detailEntries.map(([k, v]) => (
              <div key={k} className="product-spec-row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {active === 'shipping' && (
          <div className="product-policy" style={{ maxWidth: '70ch' }}>
            <h3>Shipping</h3>
            <p>
              Free standard shipping on orders over ₹999. Orders are dispatched within
              1–2 business days and typically arrive in 3–7 business days depending on
              your pincode. You&apos;ll get a tracking link by email as soon as your
              parcel leaves our warehouse.
            </p>
            <h3>Returns &amp; Exchanges</h3>
            <p>
              Not the right fit? Raise a return or exchange within 3 days of delivery.
              Items must be unworn, unwashed and have their original tags attached.
              Refunds are processed to the original payment method once the item passes
              our quality check.
            </p>
          </div>
        )}

        {active === 'reviews' && <ReviewSection productId={product.id} embedded />}
      </div>
    </div>
  );
}
