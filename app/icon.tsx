import { ImageResponse } from 'next/og';

/**
 * Browser tab favicon, generated at build time as a real PNG so it renders
 * everywhere (SVG favicons still miss older Safari).
 *
 * Deliberately just the monogram: at 16px in a tab strip, anything more
 * detailed turns to mud.
 */
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#6b1d2f',
          color: '#c59b27',
          fontSize: 24,
          fontWeight: 700,
          // Optical centring: the cap sits slightly high in the box otherwise.
          paddingBottom: 2,
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
