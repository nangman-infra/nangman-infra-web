"use client";

import { motion, MotionValue } from "framer-motion";
import { Terminal as TerminalIcon } from "lucide-react";

interface HeroSectionProps {
  x: MotionValue<number>;
  y: MotionValue<number>;
  setIsTerminalOpen: (open: boolean) => void;
}

export function HeroSection({ x, y, setIsTerminalOpen }: HeroSectionProps) {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pb-4 md:pb-6">
      {/* Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          className="gpu-accelerated-blur mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium font-mono backdrop-blur-sm"
          style={{
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          System Operational
        </div>
      </motion.div>

      {/* Main Title with Parallax */}
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{ x, y }}
        className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 relative px-2"
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="block"
          style={{
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          We Build the
        </motion.span>
        <br className="md:hidden" />
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-primary via-orange-500 to-amber-400"
          style={{
            textShadow: '0 0 20px rgba(251, 191, 36, 0.4), 0 2px 8px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)',
            filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.3))',
          }}
        >
          Invisible.
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block ml-1"
          >
            |
          </motion.span>
        </motion.span>
      </motion.h1>

      {/* Sub Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-2xl text-base sm:text-lg md:text-xl mb-8 md:mb-10 px-4"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-muted-foreground"
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          국립한밭대학교 인프라 엔지니어링 팀,{" "}
          <span className="text-foreground font-semibold relative">
            <span className="relative z-10" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.4)' }}>
              낭만 인프라
            </span>
            <motion.span
              className="absolute bottom-0 left-0 right-0 h-2 bg-primary/30 z-0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            />
          </span>
          입니다.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-2 text-muted-foreground"
          style={{
            textShadow: '0 1px 3px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
          }}
        >
          견고한 아키텍처 위에 뜨거운 열정을 담습니다.
        </motion.p>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center px-4"
      >
        <motion.button 
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group relative px-6 sm:px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold transition-all shadow-[0_0_20px_-5px_var(--primary)] hover:shadow-[0_0_40px_-5px_var(--primary)] overflow-hidden min-h-[44px] touch-manipulation"
        >
          <motion.span
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10">Deploy Your Dream</span>
          <span className="absolute inset-0 rounded-lg ring-2 ring-white/20 group-hover:ring-white/40 transition-all"></span>
        </motion.button>
        
        <motion.button 
          onClick={() => setIsTerminalOpen(true)}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2 px-6 sm:px-8 py-3 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all font-mono text-sm cursor-pointer relative overflow-hidden min-h-[44px] touch-manipulation"
        >
          <motion.span
            className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <TerminalIcon className="w-4 h-4 relative z-10" />
          <span className="relative z-10">Open Terminal</span>
          <kbd className="gpu-accelerated-blur ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border/40 bg-background/30 px-1.5 font-mono text-[10px] font-medium text-foreground/80 opacity-100 relative z-10 backdrop-blur-sm">
            <span className="text-xs">⌘</span>K
          </kbd>
        </motion.button>
      </motion.div>
    </main>
  );
}
