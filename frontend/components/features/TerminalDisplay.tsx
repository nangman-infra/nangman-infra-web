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

type TerminalPhase = "command" | "output" | "clearing";

interface TerminalCommand {
  command: string;
  output: React.ReactNode[];
}

type TerminalDisplayProps = Readonly<{
  commands: TerminalCommand[];
  onCycleComplete?: () => void;
}>;

function startTypingAnimation(
  command: string,
  onType: (value: string) => void,
  onComplete: () => void,
): () => void {
  let currentIndex = 0;
  let outputDelayTimer: ReturnType<typeof setTimeout> | null = null;

  const typingInterval = setInterval(() => {
    if (currentIndex < command.length) {
      onType(command.slice(0, currentIndex + 1));
      currentIndex += 1;
      return;
    }

    clearInterval(typingInterval);
    outputDelayTimer = setTimeout(onComplete, OUTPUT_DELAY_MS);
  }, TYPING_SPEED_MS);

  return () => {
    clearInterval(typingInterval);
    if (outputDelayTimer) {
      clearTimeout(outputDelayTimer);
    }
  };
}

function startOutputAnimation(
  lineCount: number,
  onLineVisible: (visibleLineCount: number) => void,
  onOutputComplete: () => void,
): () => void {
  let lineIndex = 0;
  let waitTimer: ReturnType<typeof setTimeout> | null = null;

  const outputInterval = setInterval(() => {
    if (lineIndex < lineCount) {
      lineIndex += 1;
      onLineVisible(lineIndex);
      return;
    }

    clearInterval(outputInterval);
    waitTimer = setTimeout(() => {
      onOutputComplete();
    }, OUTPUT_COMPLETE_WAIT_MS);
  }, OUTPUT_LINE_DISPLAY_SPEED_MS);

  return () => {
    clearInterval(outputInterval);
    if (waitTimer) {
      clearTimeout(waitTimer);
    }
  };
}

export function TerminalDisplay({ commands, onCycleComplete }: TerminalDisplayProps) {
  const [currentPhase, setCurrentPhase] = useState<TerminalPhase>("command");
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
    if (currentPhase === "command" && currentCommand) {
      setTypedText("");
      return startTypingAnimation(currentCommand.command, setTypedText, () => {
        setCurrentPhase("output");
        setShowOutput(true);
        setVisibleLines(0);
      });
    }

    if (currentPhase === "output" && showOutput && currentCommand) {
      return startOutputAnimation(
        currentCommand.output.length,
        setVisibleLines,
        () => {
          setCurrentPhase("clearing");
          setIsCleared(true);
          setShowOutput(false);
          setVisibleLines(0);
          setTypedText("");
        },
      );
    }

    if (currentPhase === "clearing") {
      const clearTimer = setTimeout(() => {
        setIsCleared(false);
        if (currentCommandIndex < commands.length - 1) {
          setCurrentCommandIndex(currentCommandIndex + 1);
          setCurrentPhase("command");
          return;
        }

        setCurrentCommandIndex(0);
        setCurrentPhase("command");
        onCycleComplete?.();
      }, CLEAR_DELAY_MS);

      return () => clearTimeout(clearTimer);
    }
  }, [currentPhase, currentCommand, showOutput, currentCommandIndex, commands.length, onCycleComplete]);

  // Get current display text based on phase
  const getDisplayText = () => {
    if (currentPhase === "command") {
      return typedText;
    }
    return "";
  };

  const shouldShowCursor = () => {
    if (currentPhase === "command") {
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
      {showOutput && currentPhase === "output" && currentCommand && (
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
