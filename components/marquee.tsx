import { Fragment } from 'react';
import { marqueeItems } from '@/lib/data';

/** The track holds two identical groups so the -50% keyframe loops seamlessly. */
export function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {[0, 1].map((group) => (
          <div className="marquee-group" key={group} aria-hidden={group === 1}>
            {marqueeItems.map((item) => (
              <Fragment key={item}>
                <span>{item}</span>
                <span className="marquee-dot" />
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
