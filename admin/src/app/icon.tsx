import { ImageResponse } from 'next/og';

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
          background: '#0d0b14',
          color: '#c084fc',
          fontSize: 15,
          fontWeight: 800,
          border: '2px solid #a855f7',
          borderRadius: '50%',
          boxSizing: 'border-box',
        }}
      >
        MH
      </div>
    ),
    { ...size }
  );
}
