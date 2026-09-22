import { ImageResponse } from 'next/og';

/**
 * Home-screen icon for iOS. iOS applies its own rounded mask, so this is drawn
 * full-bleed with the monogram kept well inside the safe area.
 */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#c72e29',
          color: '#fce8d6',
        }}
      >
        <div style={{ fontSize: 104, fontWeight: 700, lineHeight: 1 }}>S</div>
        <div
          style={{
            marginTop: 10,
            fontSize: 15,
            letterSpacing: 4,
            color: '#fff7e9',
          }}
        >
          ETHNICS
        </div>
      </div>
    ),
    { ...size }
  );
}
