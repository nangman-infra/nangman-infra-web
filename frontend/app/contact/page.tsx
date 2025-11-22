"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact Us | Nangman Infra";
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground">
          프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-lg font-bold mb-2 text-primary">Location</h3>
            <p className="text-muted-foreground">
              대전광역시 유성구 동서대로 125<br />
              국립한밭대학교 N5동
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2 text-primary">Email</h3>
            <p className="text-muted-foreground">contact@nangman.cloud</p>
          </div>

          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm font-mono">
              $ ping contact.nangman.cloud<br/>
              PING contact.nangman.cloud (127.0.0.1): 56 data bytes<br/>
              64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms<br/>
              <span className="animate-pulse">_</span>
            </p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input id="name" placeholder="Name" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" placeholder="Email" type="email" />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject</label>
            <Input id="subject" placeholder="Subject" />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <textarea 
              id="message" 
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
              placeholder="Your message..."
            />
          </div>
          <Button className="w-full min-h-[44px] touch-manipulation">Send Message</Button>
        </motion.div>
      </div>
    </div>
  );
}

