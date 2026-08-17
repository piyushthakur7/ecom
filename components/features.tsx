import React from 'react';

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'var(--color-accent)',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const features = [
  {
    title: 'Fast shipping',
    body: 'Dispatched in 24–48 hours across India.',
    icon: (
      <svg {...iconProps}>
        <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
        <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: 'Secure payments',
    body: 'UPI, cards & net banking — 100% safe.',
    icon: (
      <svg {...iconProps}>
        <path d="M20 13c0 5-3.5 7.5-7.7 9a.6.6 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      </svg>
    ),
  },
  {
    title: 'Easy returns',
    body: '3-day hassle-free returns on every order.',
    icon: (
      <svg {...iconProps}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </svg>
    ),
  },
  {
    title: 'Quality fabric',
    body: 'Handloom cotton, chanderi and mul.',
    icon: (
      <svg {...iconProps}>
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export function Features() {
  return (
    <section className="features-section">
      <div className="section features-container">
        {features.map((feature) => (
          <div key={feature.title} className="feature-item">
            <div className="feature-icon-wrap">
              {feature.icon}
            </div>
            <div className="feature-text">
              <p className="feature-title">{feature.title}</p>
              <p className="feature-body">{feature.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
