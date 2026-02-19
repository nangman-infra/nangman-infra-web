"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { getLatestBlogPosts, type BlogPost } from "@/data/blogPosts";
import type { Announcement } from "@/lib/domain/announcement";
import { getLatestAnnouncementsUseCase } from "@/lib/application/use-cases/announcements/get-latest-announcements";
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

interface HomeClientProps {
    latestPosts: BlogPost[];
}

export default function HomeClient({ latestPosts }: HomeClientProps) {
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(latestPosts);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic page title update
    useEffect(() => {
        document.title = "Nangman Infra | We Build the Invisible";
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function loadBlogPosts() {
            const posts = await getLatestBlogPosts(4);
            if (isMounted) {
                setBlogPosts(posts);
            }
        }

        async function loadAnnouncements() {
            const latest = await getLatestAnnouncementsUseCase({
                count: 3,
            });

            if (isMounted) {
                setAnnouncements(latest);
            }
        }

        void loadBlogPosts();
        void loadAnnouncements();

        return () => {
            isMounted = false;
        };
    }, []);

    // Mouse tracking for parallax effect (desktop only)
    useEffect(() => {
        let rafId: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            // Skip parallax on touch devices
            if (window.matchMedia("(pointer: coarse)").matches) {
                return;
            }

            // Cancel previous animation frame if exists
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }

            // Schedule update for next animation frame
            rafId = requestAnimationFrame(() => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    setMousePosition({ x, y });
                }
                rafId = null;
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsTerminalOpen((prev) => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Parallax values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: SPRING_DAMPING, stiffness: SPRING_STIFFNESS };
    const x = useSpring(useTransform(mouseX, [0, 1], [PARALLAX_X_MIN, PARALLAX_X_MAX]), springConfig);
    const y = useSpring(useTransform(mouseY, [0, 1], [PARALLAX_Y_MIN, PARALLAX_Y_MAX]), springConfig);

    useEffect(() => {
        mouseX.set(mousePosition.x);
        mouseY.set(mousePosition.y);
    }, [mousePosition, mouseX, mouseY]);

    return (
        <>
            {/* Structured Data (JSON-LD) */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        name: "Nangman Infra",
                        alternateName: "낭만 인프라",
                        url: "https://nangman.cloud",
                        logo: "https://nangman.cloud/icon.png",
                        description:
                            "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티",
                        address: {
                            "@type": "PostalAddress",
                            addressLocality: "대전광역시 유성구",
                            addressRegion: "대전광역시",
                            streetAddress: "동서대로 125",
                            addressCountry: "KR",
                        },
                        contactPoint: {
                            "@type": "ContactPoint",
                            email: "judo0179@gmail.com",
                            contactType: "문의",
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
                        name: "Nangman Infra",
                        url: "https://nangman.cloud",
                        description:
                            "현업 엔지니어와 멘티가 함께 성장하며, 실무 중심의 인프라 경험을 축적하는 커뮤니티",
                        inLanguage: "ko-KR",
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
                <BlogSection latestPosts={blogPosts} />

                {/* Announcements Section */}
                <AnnouncementsSection latestAnnouncements={announcements} />

                {/* Contact Section */}
                <ContactSection />
            </div>
        </>
    );
}
