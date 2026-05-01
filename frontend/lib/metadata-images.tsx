import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

const BRAND_GRADIENT = "linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)";
const BRAND_BACKGROUND =
  "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)";

type BrandIconOptions = Readonly<{
  size: number;
  fontSize: number;
  borderRadius: number;
}>;

type SocialImageOptions = Readonly<{
  title?: string;
  subtitle?: string;
  description?: string;
}>;

export function renderBrandIcon({
  size,
  fontSize,
  borderRadius,
}: BrandIconOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          background: BRAND_GRADIENT,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0a0a0a",
          borderRadius: `${borderRadius}px`,
          fontWeight: 800,
          fontSize,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          letterSpacing: 0,
        }}
      >
        N
      </div>
    ),
    {
      width: size,
      height: size,
    },
  );
}

export function renderSocialImage({
  title = SITE_NAME,
  subtitle = SITE_TAGLINE,
  description = "Infra Community for Real-World Growth",
}: SocialImageOptions = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          background: BRAND_BACKGROUND,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#fbbf24",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(251, 191, 36, 0.11) 1px, transparent 0)",
            backgroundSize: "40px 40px",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(10, 10, 10, 0) 40%, rgba(10, 10, 10, 0.2) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
            zIndex: 1,
            padding: "0 96px",
          }}
        >
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: 32,
              background: BRAND_GRADIENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              fontWeight: 800,
              color: "#0a0a0a",
              boxShadow: "0 24px 72px rgba(0, 0, 0, 0.35)",
            }}
          >
            N
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 74,
                fontWeight: 800,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.12,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: "#fbbf24",
                textAlign: "center",
                opacity: 0.96,
              }}
            >
              {subtitle}
            </div>
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 400,
              color: "#d4d4d8",
              textAlign: "center",
              maxWidth: 860,
              lineHeight: 1.45,
            }}
          >
            {description}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 10,
            background: BRAND_GRADIENT,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
