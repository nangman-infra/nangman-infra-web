import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: "standalone",
  // 서버 컴포넌트에서 pino 관련 패키지를 외부 패키지로 처리
  // Next.js 빌드 시 thread-stream 테스트 파일 포함 문제 방지
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        pathname: '/npm/simple-icons@v11/icons/**',
      },
    ],
  },
};

export default nextConfig;
