import React from 'react';
import { ImageSlot } from './image-slot';
import { hero, stats } from '@/lib/data';

export function Hero() {
  return (
    <section className="hero-section">
      {/* Content Side */}
      <div className="hero-content">
        <span className="tag tag-accent hero-tag">
          New collection — Festive ’26
        </span>

        <h1 className="hero-title">
          <span className="hero-title-line">Every thread,</span>
          <br />
          <span className="hero-title-line">a celebration.</span>
        </h1>

        <p className="hero-description">
          Kurtis, co-ord sets, suits, sarees and dupattas in everyday fabrics — block prints,
          chanderi and handloom cotton, cut to be worn, not saved for later.
        </p>

        <div className="hero-cta-wrap">
          <a className="btn btn-primary hero-btn" href="#featured">
            Shop new arrivals
          </a>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hero-stat-item">
              <p className="stat-value">{stat.value}</p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Image Side */}
      <div className="media-clip hero-image-wrap">
        <ImageSlot
          src={hero.src}
          alt={hero.alt}
          credit={hero.credit}
          sizes="(max-width: 840px) 100vw, 50vw"
          priority
        />
      </div>
    </section>
  );
}
