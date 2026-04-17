"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { sendContactMessage, type ContactFormData } from "@/lib/api";

export default function ContactPage() {
  const locale = useLocale();
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

  const copy =
    locale === "ko"
      ? {
          title: "문의하기",
          subtitle: "프로젝트 협업, 채용, 기술 교류 등 언제든 환영합니다.",
          location: "위치",
          email: "이메일",
          success: "메시지가 성공적으로 전송되었습니다!",
          fallbackError: "메시지 전송에 실패했습니다. 잠시 후 다시 시도해주세요.",
          fields: {
            name: "이름",
            email: "이메일",
            subject: "제목",
            message: "메시지",
          },
          placeholders: {
            name: "이름",
            email: "이메일",
            subject: "제목",
            message: "메시지를 입력하세요...",
          },
          submit: "메시지 보내기",
          submitting: "전송 중...",
          address: "대전광역시 유성구 동서대로 125",
        }
      : {
          title: "Contact Us",
          subtitle: "We welcome collaboration, hiring, and technical exchange.",
          location: "Location",
          email: "Email",
          success: "Your message was sent successfully.",
          fallbackError: "Failed to send the message. Please try again later.",
          fields: {
            name: "Name",
            email: "Email",
            subject: "Subject",
            message: "Message",
          },
          placeholders: {
            name: "Name",
            email: "Email",
            subject: "Subject",
            message: "Your message...",
          },
          submit: "Send Message",
          submitting: "Sending...",
          address: "125 Dongseo-daero, Yuseong-gu, Daejeon",
        };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // 에러 상태 초기화
    if (submitStatus.type === "error") {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      await sendContactMessage(formData);
      setSubmitStatus({
        type: "success",
        message: copy.success,
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
            : copy.fallbackError,
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
        <h1 className="text-4xl font-bold mb-4">{copy.title}</h1>
        <p className="text-muted-foreground">
          {copy.subtitle}
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
            <h3 className="text-lg font-bold mb-2 text-primary">{copy.location}</h3>
            <p className="text-muted-foreground">
              {copy.address}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2 text-primary">{copy.email}</h3>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  {copy.fields.name} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  placeholder={copy.placeholders.name}
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {copy.fields.email} <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  placeholder={copy.placeholders.email}
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
                {copy.fields.subject} <span className="text-destructive">*</span>
              </label>
              <Input
                id="subject"
                placeholder={copy.placeholders.subject}
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                {copy.fields.message} <span className="text-destructive">*</span>
              </label>
              <textarea
                id="message"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={copy.placeholders.message}
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
              {isSubmitting ? copy.submitting : copy.submit}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
