"use client";

import * as React from "react";
import { X, Terminal as TerminalIcon, Minus, Maximize2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
      setTimeout(() => inputRef.current?.focus(), 100);
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
                <span className="text-[#0DBC79]">ls</span>
                <span>List available pages</span>
                <span className="text-[#0DBC79]">cd [page]</span>
                <span>Navigate to a page</span>
                <span className="text-[#0DBC79]">whoami</span>
                <span>Show visitor info</span>
                <span className="text-[#0DBC79]">clear</span>
                <span>Clear terminal history</span>
                <span className="text-[#0DBC79]">exit</span>
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
            <div className="grid grid-cols-3 gap-4 text-[#0DBC79]">
              <span>about/</span>
              <span>projects/</span>
              <span>members/</span>
              <span>blog/</span>
              <span>contact/</span>
              <span>monitoring/</span>
              <span>services/</span>
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
          const routes = ["about", "projects", "members", "blog", "contact", "monitoring", "services"];
          if (routes.includes(target)) {
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
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={cn(
                "group relative flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all font-mono text-xs",
                activeTab === index
                  ? "bg-[#0C0C0C]"
                  : "bg-transparent hover:bg-white/5"
              )}
              style={{
                color: activeTab === index ? '#CCCCCC' : '#888888',
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
                  style={{ color: '#CCCCCC' }}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {activeTab === index && (
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: '#0078D4' }}
                />
              )}
            </button>
          ))}
          <button
            className="p-2 rounded hover:bg-white/10 transition-colors ml-auto"
            style={{ color: '#CCCCCC' }}
            title="New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Controls */}
        <div 
          className="flex items-center justify-end gap-1 px-2 pb-2"
          style={{
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: '#CCCCCC' }}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-white/10 transition-colors"
            style={{ color: '#CCCCCC' }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded hover:bg-[#F14C4C]/20 transition-colors"
            style={{ color: '#F14C4C' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Terminal Body - Linux Style with Wide Layout */}
        <div 
          className="h-[70vh] max-h-[600px] min-h-[400px] p-4 md:p-6 overflow-y-auto font-mono text-xs md:text-sm"
          style={{
            backgroundColor: '#0C0C0C',
            color: '#CCCCCC',
          }}
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="space-y-1.5">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={cn("leading-relaxed", {
                  "text-[#F14C4C]": log.type === "error",
                  "text-[#3B78FF]": log.type === "system",
                  "text-[#CCCCCC]": log.type === "command",
                  "text-[#CCCCCC] opacity-90": log.type === "output"
                })}
              >
                {log.type === "command" && (
                  <span className="text-[#0DBC79] mr-2">➜</span>
                )}
                {log.content}
              </div>
            ))}
          </div>
          
          {/* Input Line - Linux Style */}
          <form onSubmit={handleSubmit} className="mt-3 flex items-center">
            <span className="text-[#0DBC79] mr-2 font-semibold">➜</span>
            <span className="text-[#CCCCCC] mr-1">{currentTab?.path || '~'}</span>
            <span className="text-[#CCCCCC] mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[#CCCCCC] placeholder-[#666666] focus:ring-0 p-0 font-mono"
              style={{ caretColor: '#0DBC79' }}
              autoComplete="off"
              autoFocus
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

