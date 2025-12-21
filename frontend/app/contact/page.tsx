"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { sendContactMessage, type ContactFormData } from "@/lib/api";

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    document.title = "Contact Us | Nangman Infra";
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // 에러 상태 초기화
    if (submitStatus.type === "error") {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await sendContactMessage(formData);
      setSubmitStatus({
        type: "success",
        message: "메시지가 성공적으로 전송되었습니다!",
      });
      // 폼 초기화
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <p className="text-muted-foreground">judo0179@gmail.com</p>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                id="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Status Message */}
            {submitStatus.type && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  submitStatus.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-500"
                    : "bg-destructive/10 border border-destructive/20 text-destructive"
                }`}
              >
                {submitStatus.message}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full min-h-[44px] touch-manipulation"
              disabled={isSubmitting}
            >
              {isSubmitting ? "전송 중..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

