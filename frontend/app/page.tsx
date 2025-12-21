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
import { getLatestBlogPosts } from "@/data/blogPosts";
import { getLatestAnnouncements } from "@/data/announcements";
import { terminalCommands } from "@/data/terminalCommands";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { TerminalSection } from "@/components/sections/TerminalSection";
import { SeniorsSection } from "@/components/sections/SeniorsSection";
import { CurriculumSection } from "@/components/sections/CurriculumSection";
import { MonitoringSection } from "@/components/sections/MonitoringSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { AnnouncementsSection } from "@/components/sections/AnnouncementsSection";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get latest 3 blog posts
  const latestPosts = getLatestBlogPosts(3);
  
  // Get latest 3 announcements
  const latestAnnouncements = getLatestAnnouncements(3);

  // Dynamic page title update
  useEffect(() => {
    document.title = "Nangman Infra | We Build the Invisible";
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
            description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지",
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
            description: "국립한밭대학교 인프라 엔지니어링 팀, 낭만 인프라 공식 홈페이지",
            inLanguage: "ko-KR",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: "https://nangman.cloud/search?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
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

        {/* Monitoring Section */}
        <MonitoringSection />

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
