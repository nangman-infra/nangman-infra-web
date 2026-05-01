"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useMotionValue, useSpring, useTransform } from "framer-motion";
import { Terminal } from "@/components/features/Terminal";
import { Background } from "@/components/features/Background";
import { FloatingParticles } from "@/components/features/FloatingParticles";
import {
    SPRING_DAMPING,
    SPRING_STIFFNESS,
    PARALLAX_X_MIN,
    PARALLAX_X_MAX,
    PARALLAX_Y_MIN,
    PARALLAX_Y_MAX,
} from "@/constants/parallax";
import type { BlogPost } from "@/data/blogPosts";
import type { Announcement } from "@/lib/domain/announcement";
import { terminalCommands } from "@/data/terminalCommands";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { TerminalSection } from "@/components/sections/TerminalSection";
import { SeniorsSection } from "@/components/sections/SeniorsSection";
import { CurriculumSection } from "@/components/sections/CurriculumSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { AnnouncementsSection } from "@/components/sections/AnnouncementsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { BASE_URL, ORGANIZATION_LOGO_URL, SITE_NAME } from "@/lib/site";

type HomeClientProps = Readonly<{
    latestPosts: BlogPost[];
    latestAnnouncements: Announcement[];
}>;

export default function HomeClient({
    latestPosts,
    latestAnnouncements,
}: HomeClientProps) {
    const locale = useLocale();
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Mouse tracking for parallax effect (desktop only)
    useEffect(() => {
        let rafId: number | null = null;
        let nextX = 0.5;
        let nextY = 0.5;

        if (globalThis.matchMedia("(pointer: coarse)").matches) {
            return;
        }

        const applyMousePosition = () => {
            mouseX.set(nextX);
            mouseY.set(nextY);
            rafId = null;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            nextX = (e.clientX - rect.left) / rect.width;
            nextY = (e.clientY - rect.top) / rect.height;

            rafId ??= requestAnimationFrame(applyMousePosition);
        };

        globalThis.addEventListener("mousemove", handleMouseMove, { passive: true });
        return () => {
            globalThis.removeEventListener("mousemove", handleMouseMove);
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [mouseX, mouseY]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsTerminalOpen((prev) => !prev);
            }
        };

        globalThis.addEventListener("keydown", handleKeyDown);
        return () => globalThis.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Parallax values
    const springConfig = { damping: SPRING_DAMPING, stiffness: SPRING_STIFFNESS };
    const x = useSpring(useTransform(mouseX, [0, 1], [PARALLAX_X_MIN, PARALLAX_X_MAX]), springConfig);
    const y = useSpring(useTransform(mouseY, [0, 1], [PARALLAX_Y_MIN, PARALLAX_Y_MAX]), springConfig);
    const organizationDescription =
        locale === "en"
            ? "An infrastructure engineering community where working engineers and mentees grow together through practical systems work."
            : "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티";
    const websiteDescription =
        locale === "en"
            ? "An infrastructure engineering community focused on practical learning and shared growth."
            : "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티";
    const organizationAlternateName = locale === "en" ? "Nangman Infra" : "낭만 인프라";
    const contactType = locale === "en" ? "Contact" : "문의";
    const addressLocality = locale === "en" ? "Yuseong-gu, Daejeon" : "대전광역시 유성구";
    const addressRegion = locale === "en" ? "Daejeon" : "대전광역시";
    const streetAddress = locale === "en" ? "125 Dongseo-daero" : "동서대로 125";

    return (
        <>
            {/* Structured Data (JSON-LD) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: SITE_NAME,
                        alternateName: organizationAlternateName,
                        url: `${BASE_URL}/${locale}`,
                        logo: {
                            "@type": "ImageObject",
                            url: ORGANIZATION_LOGO_URL,
                            width: 180,
                            height: 180,
                        },
                        image: [ORGANIZATION_LOGO_URL],
                        description: organizationDescription,
                        address: {
                            "@type": "PostalAddress",
                            addressLocality,
                            addressRegion,
                            streetAddress,
                            addressCountry: "KR",
                        },
                        contactPoint: {
                            "@type": "ContactPoint",
                            email: "contact@nangman.cloud",
                            contactType,
                        },
                        sameAs: [
                            "https://github.com/nangman-infra",
                        ],
                    }),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        name: SITE_NAME,
                        url: `${BASE_URL}/${locale}`,
                        description: websiteDescription,
                        inLanguage: locale === "en" ? "en-US" : "ko-KR",
                    }),
                }}
            />
            <div
                ref={containerRef}
                className="min-h-screen bg-background text-foreground relative selection:bg-primary/30"
            >
                {/* Web Terminal */}
                <Terminal isOpen={isTerminalOpen} setIsOpen={setIsTerminalOpen} />

                {/* Background Elements - extends behind header */}
                <div className="fixed inset-0 z-0">
                    <Background />
                    {/* Animated Grid Overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03] animate-grid-move"
                        style={{
                            backgroundImage: `
                linear-gradient(rgba(251, 191, 36, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(251, 191, 36, 0.1) 1px, transparent 1px)
              `,
                            backgroundSize: '50px 50px',
                        }}
                    />
                    {/* Subtle Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_60%,rgba(0,0,0,0.4)_100%)]"></div>
                </div>

                {/* Floating Particles - Only render on client to prevent hydration mismatch */}
                <FloatingParticles />

                {/* Hero Section */}
                <HeroSection x={x} y={y} setIsTerminalOpen={setIsTerminalOpen} />

                {/* About Section */}
                <AboutSection />

                {/* Tech Stack Section */}
                <TechStackSection />

                {/* Terminal Section */}
                <TerminalSection terminalCommands={terminalCommands} />

                {/* Seniors Section */}
                <SeniorsSection />

                {/* Curriculum Section */}
                <CurriculumSection />

                {/* Blog Section */}
                <BlogSection latestPosts={latestPosts} />

                {/* Announcements Section */}
                <AnnouncementsSection latestAnnouncements={latestAnnouncements} />

                {/* Contact Section */}
                <ContactSection />
            </div>
        </>
    );
}
