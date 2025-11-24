import { ImageResponse } from 'next/og'

// Open Graph 이미지 메타데이터
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Open Graph 이미지 생성
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fbbf24',
          fontFamily: 'monospace',
          position: 'relative',
        }}
      >
        {/* 배경 패턴 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
          }}
        />
        
        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            zIndex: 1,
          }}
        >
          {/* 로고/아이콘 */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
              fontWeight: 700,
              color: '#0a0a0a',
              marginBottom: 8,
            }}
          >
            N
          </div>
          
          {/* 타이틀 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#ffffff',
                textAlign: 'center',
                lineHeight: 1.2,
              }}
            >
              Nangman Infra
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 400,
                color: '#fbbf24',
                textAlign: 'center',
                opacity: 0.9,
              }}
            >
              We Build the Invisible
            </div>
          </div>
          
          {/* 서브타이틀 */}
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: '#a3a3a3',
              textAlign: 'center',
              marginTop: 24,
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            국립한밭대학교 인프라 엔지니어링 팀
          </div>
        </div>
        
        {/* 하단 장식 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: 'linear-gradient(90deg, #fbbf24 0%, #ea580c 100%)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

