import Image from 'next/image';
import { photoClass } from '@/lib/site';

type ImageSlotProps = {
  src: string;
  alt: string;
  /** Photographer credit — kept as the image title so attribution survives the port. */
  credit?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * The Next port of the design's `<image-slot>`: a cover-cropped photo that
 * fills its frame. The frame is what scales on hover, so the transition lives
 * on `.media-frame` in globals.css, not here.
 */
export function ImageSlot({ src, alt, credit, sizes, priority, className }: ImageSlotProps) {
  return (
    <div className={['media-frame', photoClass, className].filter(Boolean).join(' ')}>
      <Image src={src} alt={alt} title={credit} fill sizes={sizes} priority={priority} />
    </div>
  );
}
