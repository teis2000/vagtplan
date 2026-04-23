import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FF6E3C',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="3" stroke="white" strokeWidth="2"/>
          <path d="M3 9h18" stroke="white" strokeWidth="2"/>
          <path d="M8 2v4M16 2v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <rect x="7" y="13" width="3" height="3" rx="1" fill="white"/>
          <rect x="11" y="13" width="3" height="3" rx="1" fill="white"/>
        </svg>
      </div>
    ),
    size
  )
}
