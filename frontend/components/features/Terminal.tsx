"use client";

import * as React from "react";
import { X, Terminal as TerminalIcon, Minus, Maximize2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TERMINAL_INPUT_FOCUS_DELAY_MS } from "@/constants/animations";
import { TERMINAL_ROUTES, TERMINAL_COLORS } from "@/constants/terminal";

interface TerminalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface LogEntry {
  type: "command" | "output" | "error" | "system";
  content: React.ReactNode;
}

export function Terminal({ isOpen, setIsOpen }: TerminalProps) {
  const [input, setInput] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(0);
  const [tabs] = React.useState([
    { id: 0, name: "Bash", path: "~" },
  ]);
  const [logs, setLogs] = React.useState<LogEntry[]>([
    { type: "system", content: "Welcome to Nangman Infra v1.0.0" },
    { type: "system", content: "Type 'help' to see available commands." },
  ]);
  const [mounted, setMounted] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), TERMINAL_INPUT_FOCUS_DELAY_MS);
    }
  }, [isOpen]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const newLogs: LogEntry[] = [{ type: "command", content: cmd }];

    switch (trimmedCmd) {
      case "help":
        newLogs.push({
          type: "output",
          content: (
            <div className="space-y-1">
              <p>Available commands:</p>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span style={{ color: TERMINAL_COLORS.COMMAND }}>ls</span>
                <span>List available pages</span>
                <span style={{ color: TERMINAL_COLORS.COMMAND }}>cd [page]</span>
                <span>Navigate to a page</span>
                <span style={{ color: TERMINAL_COLORS.COMMAND }}>whoami</span>
                <span>Show visitor info</span>
                <span style={{ color: TERMINAL_COLORS.COMMAND }}>clear</span>
                <span>Clear terminal history</span>
                <span style={{ color: TERMINAL_COLORS.COMMAND }}>exit</span>
                <span>Close terminal</span>
              </div>
            </div>
          ),
        });
        break;
      case "ls":
        newLogs.push({
          type: "output",
          content: (
            <div className="grid grid-cols-3 gap-4" style={{ color: TERMINAL_COLORS.COMMAND }}>
              {TERMINAL_ROUTES.map((route) => (
                <span key={route}>{route}/</span>
              ))}
            </div>
          ),
        });
        break;
      case "whoami":
        newLogs.push({
          type: "output",
          content: "visitor@nangman-infra (Guest)",
        });
        break;
      case "clear":
        setLogs([]);
        return; // Special case: don't add new logs
      case "exit":
        setIsOpen(false);
        return;
      case "":
        break;
      default:
        if (trimmedCmd.startsWith("cd ")) {
          const target = trimmedCmd.split(" ")[1];
          if (TERMINAL_ROUTES.includes(target as typeof TERMINAL_ROUTES[number])) {
            newLogs.push({ type: "system", content: `Navigating to /${target}...` });
            window.location.href = `/${target}`;
          } else {
            newLogs.push({ type: "error", content: `Directory not found: ${target}` });
          }
        } else {
          newLogs.push({
            type: "error",
            content: `Command not found: ${trimmedCmd}. Type 'help' for help.`,
          });
        }
    }

    setLogs((prev) => [...prev, ...newLogs]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
    setInput("");
  };

  const currentTab = tabs[activeTab] || tabs[0];

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="p-0 gap-0 overflow-hidden [&>button]:hidden rounded-lg"
        style={{
          width: '95vw',
          maxWidth: '1152px',
          backgroundColor: 'rgba(12, 12, 12, 0.85)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        }}
      >
        <DialogTitle className="sr-only">터미널</DialogTitle>
        {/* Windows Terminal Style Tabs */}
        <div 
          className="flex items-center gap-0.5 px-2 pt-2"
          style={{
            backgroundColor: TERMINAL_COLORS.TAB_BACKGROUND,
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all font-mono text-xs",
                activeTab === index
                  ? undefined
                  : "bg-transparent hover:bg-white/5"
              )}
              style={{
                backgroundColor: activeTab === index ? TERMINAL_COLORS.TAB_ACTIVE_BACKGROUND : undefined,
                color: activeTab === index ? TERMINAL_COLORS.TEXT : TERMINAL_COLORS.TEXT_MUTED,
              }}
            >
              <TerminalIcon className="w-3 h-3" />
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Tab close logic can be added here
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 rounded p-0.5"
                  style={{ color: TERMINAL_COLORS.TEXT }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {activeTab === index && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: TERMINAL_COLORS.TAB_ACTIVE_INDICATOR }}
                />
              )}
            </button>
          ))}
          <button
            className="p-2 rounded hover:bg-white/10 transition-colors ml-auto"
            style={{ color: TERMINAL_COLORS.TEXT }}
            title="New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Controls */}
        <div 
          className="flex items-center justify-end gap-1 px-2 pb-2"
          style={{
            backgroundColor: TERMINAL_COLORS.TAB_BACKGROUND,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: TERMINAL_COLORS.TEXT }}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: TERMINAL_COLORS.TEXT }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ 
              color: TERMINAL_COLORS.CLOSE_BUTTON_HOVER,
              backgroundColor: `${TERMINAL_COLORS.CLOSE_BUTTON_HOVER}20`,
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Terminal Body - Linux Style with Wide Layout */}
        <div 
          className="h-[70vh] max-h-[600px] min-h-[400px] p-4 md:p-6 overflow-y-auto font-mono text-xs md:text-sm"
          style={{
            backgroundColor: TERMINAL_COLORS.BACKGROUND,
            color: TERMINAL_COLORS.TEXT,
          }}
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div 
                key={i} 
                style={{
                  color:
                    log.type === "error"
                      ? TERMINAL_COLORS.ERROR
                      : log.type === "system"
                        ? TERMINAL_COLORS.SYSTEM
                        : TERMINAL_COLORS.TEXT,
                  opacity: log.type === "output" ? 0.9 : 1,
                }}
                className="leading-relaxed"
              >
                {log.type === "command" && (
                  <span className="mr-2" style={{ color: TERMINAL_COLORS.COMMAND }}>➜</span>
                )}
                {log.content}
              </div>
            ))}
          </div>
          
          {/* Input Line - Linux Style */}
          <form onSubmit={handleSubmit} className="mt-3 flex items-center">
            <span className="mr-2 font-semibold" style={{ color: TERMINAL_COLORS.COMMAND }}>➜</span>
            <span className="mr-1" style={{ color: TERMINAL_COLORS.TEXT }}>{currentTab?.path || '~'}</span>
            <span className="mr-2" style={{ color: TERMINAL_COLORS.TEXT }}>$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 p-0 font-mono placeholder:text-muted-foreground/60"
              style={{ 
                color: TERMINAL_COLORS.TEXT,
                caretColor: TERMINAL_COLORS.COMMAND,
              }}
              placeholder="명령어를 입력하세요"
              autoComplete="off"
              autoFocus
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

