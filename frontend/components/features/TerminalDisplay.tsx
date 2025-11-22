"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CURSOR_BLINK_INTERVAL_MS,
  TYPING_SPEED_MS,
  OUTPUT_DELAY_MS,
  OUTPUT_LINE_DISPLAY_SPEED_MS,
  OUTPUT_COMPLETE_WAIT_MS,
  CLEAR_DELAY_MS,
  OUTPUT_FADE_DURATION_MS,
} from "@/constants/animations";

interface TerminalCommand {
  command: string;
  output: React.ReactNode[];
}

interface TerminalDisplayProps {
  commands: TerminalCommand[];
  onCycleComplete?: () => void;
}

export function TerminalDisplay({ commands, onCycleComplete }: TerminalDisplayProps) {
  const [currentPhase, setCurrentPhase] = useState<'command' | 'output' | 'clearing'>('command');
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isCleared, setIsCleared] = useState(false);

  const currentCommand = commands[currentCommandIndex];

  useEffect(() => {
    // Cursor blink
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, CURSOR_BLINK_INTERVAL_MS);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (currentPhase === 'command' && currentCommand) {
      // Typing command
      let currentIndex = 0;
      setTypedText("");
      const typingInterval = setInterval(() => {
        if (currentIndex < currentCommand.command.length) {
          setTypedText(currentCommand.command.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setCurrentPhase('output');
            setShowOutput(true);
            setVisibleLines(0);
          }, OUTPUT_DELAY_MS);
        }
      }, TYPING_SPEED_MS);

      return () => clearInterval(typingInterval);
    } else if (currentPhase === 'output' && showOutput) {
      // Showing output lines
      let lineIndex = 0;
      const outputInterval = setInterval(() => {
        if (lineIndex < currentCommand.output.length) {
          setVisibleLines(lineIndex + 1);
          lineIndex++;
        } else {
          clearInterval(outputInterval);
          // Wait a bit then clear screen and move to next command
          setTimeout(() => {
            setCurrentPhase('clearing');
            setIsCleared(true);
            setShowOutput(false);
            setVisibleLines(0);
            setTypedText("");
            
            // Clear screen and move to next command
            setTimeout(() => {
              setIsCleared(false);
              // Move to next command or cycle
              if (currentCommandIndex < commands.length - 1) {
                setCurrentCommandIndex(currentCommandIndex + 1);
                setCurrentPhase('command');
              } else {
                // Cycle complete, restart from beginning
                setCurrentCommandIndex(0);
                setCurrentPhase('command');
                onCycleComplete?.();
              }
            }, CLEAR_DELAY_MS);
          }, OUTPUT_COMPLETE_WAIT_MS);
        }
      }, OUTPUT_LINE_DISPLAY_SPEED_MS);

      return () => clearInterval(outputInterval);
    }
  }, [currentPhase, currentCommand, showOutput, currentCommandIndex, commands.length, onCycleComplete]);

  // Get current display text based on phase
  const getDisplayText = () => {
    if (currentPhase === 'command') {
      return typedText;
    }
    return "";
  };

  const shouldShowCursor = () => {
    if (currentPhase === 'command') {
      return typedText.length < (currentCommand?.command.length || 0);
    }
    return false;
  };

  // Don't render anything while clearing
  if (isCleared) {
    return null;
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Current Command Prompt */}
      <div className="mb-2 shrink-0">
        <span className="text-[#00ff00]">user@nangman-infra</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-[#00aaff]">~</span>
        <span className="text-muted-foreground">$</span>
        <span className="ml-2">{getDisplayText()}</span>
        {shouldShowCursor() && (
          <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}>|</span>
        )}
      </div>

      {/* Current Output - Full screen, scrollable if needed */}
      {showOutput && currentPhase === 'output' && currentCommand && (
        <div className="flex-1 space-y-1 text-[#cccccc] overflow-y-auto min-h-0">
          {currentCommand.output.slice(0, visibleLines).map((line, idx) => {
            const key = React.isValidElement(line) && line.key ? line.key : idx;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: OUTPUT_FADE_DURATION_MS / 1000 }}
              >
                {line}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

