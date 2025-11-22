import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 20,
          background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)', // Amber to Orange gradient
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'black',
          borderRadius: '6px', // rounded-lg relative to 32px
          fontWeight: 700,
          fontFamily: 'monospace',
        }}
      >
        N
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}

