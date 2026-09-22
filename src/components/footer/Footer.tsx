"use client";

import React, { useState, useEffect, useRef, FormEvent } from "react";

// Configuration for social and contact destinations (configurable via env vars)
const CONTACT_CONFIG = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 98765 43210",
  phoneRaw: process.env.NEXT_PUBLIC_CONTACT_PHONE_RAW || "+919876543210",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@northframe.in",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/northframe",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/northframe",
  linkedinUrl: process.env.NEXT_PUBLIC_LINKEDIN_URL || "https://linkedin.com/company/northframe",
};

const SERVICE_CHIPS = [
  "Strategy",
  "Brand Identity",
  "Digital Marketing",
  "Technology",
  "Creative Production",
];


interface FormErrors {
  services?: string;
  name?: string;
  phone?: string;
}

interface FooterProps {
  hideBackground?: boolean;
}

export default function Footer({ hideBackground = false }: FooterProps = {}) {
  const footerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    motionQuery.addEventListener("change", handleChange);
    return () => motionQuery.removeEventListener("change", handleChange);
  }, []);

  // Pause video when offscreen and play when visible to optimize performance
  useEffect(() => {
    if (hideBackground || isReducedMotion || videoError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              const playPromise = videoRef.current.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  setVideoError(true);
                });
              }
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.05 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, [hideBackground, isReducedMotion, videoError]);

  const toggleService = (chip: string) => {
    setSelectedServices((prev) =>
      prev.includes(chip) ? prev.filter((s) => s !== chip) : [...prev, chip]
    );
    if (errors.services) {
      setErrors((prev) => ({ ...prev, services: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (selectedServices.length === 0) {
      newErrors.services = "Please select at least one service category.";
    }

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Please enter your phone number.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (e.g. +91 9876543210).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmissionNotice(null);

    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      // Report clear delivery status as no backend email/CRM delivery integration is currently configured in this repository environment
      setSubmissionNotice(
        "Notice: Form input validated successfully. No backend email/CRM delivery integration is currently configured in this environment."
      );
    }, 800);
  };

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="relative w-full bg-[#050D1A] text-white pt-20 sm:pt-28 md:pt-32 pb-12 px-5 sm:px-8 md:px-12 lg:px-16 overflow-hidden isolate"
    >
      {/* REUSED HERO BACKGROUND PRESENTATION (SKIPPED WHEN ROUTE HAS FIXED BACKGROUND) */}
      {!hideBackground && (
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden isolate">
          {!isReducedMotion && !videoError ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/images/studio_materials_bg.jpg"
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
            >
              <source src="/videos/northframe-hero.webm" type="video/webm" />
              <source src="/videos/northframe-hero.mp4" type="video/mp4" />
            </video>
          ) : (
            <img
              src="/images/studio_materials_bg.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 opacity-50 mix-blend-luminosity scale-105"
            />
          )}
          {/* SUBTLE NAVY OVERLAYS AND GRADIENTS FOR LEGIBILITY & VISIBLE BLUE LIGHT DETAILS */}
          <div className="absolute inset-0 bg-[#050D1A]/55 pointer-events-none z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050D1A] via-transparent to-[#050D1A]/80 pointer-events-none z-[1]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* HEADER INTRO */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="flex items-center mb-4">
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-widest text-[#004BFF] uppercase">
              GET IN TOUCH
            </span>
          </div>

          <h2 className="font-pixel text-white uppercase text-3xl min-[375px]:text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.05] mb-4 sm:mb-6">
            Let’s talk about your next move.
          </h2>

          <p className="text-slate-300 font-sans text-base sm:text-lg md:text-xl leading-[1.6] font-normal">
            Tell us a little about your business and what you need. We’ll help you find the right place to start.
          </p>
        </div>

        {/* MINIMAL FORM COMPOSITION: FORM ON LEFT (DESKTOP), OPEN SPACE ON RIGHT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 sm:pb-24 border-b border-[#18355B]/60">
          {/* FORM AREA (60% ON DESKTOP) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* SERVICE SELECTION CHIPS AT THE TOP */}
              <div>
                <label className="font-mono text-xs uppercase font-bold text-slate-300 tracking-wider block mb-3">
                  Select Services <span className="text-[#004BFF]">*</span>
                </label>

                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  {SERVICE_CHIPS.map((chip) => {
                    const isSelected = selectedServices.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleService(chip)}
                        className={`px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-mono tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#004BFF] focus:ring-offset-2 focus:ring-offset-[#050D1A] ${
                          isSelected
                            ? "bg-[#004BFF]/25 border-2 border-[#004BFF] text-white font-semibold"
                            : "bg-transparent border border-[#18355B] text-slate-300 hover:border-[#004BFF]/60 hover:text-white"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
                {errors.services && (
                  <span className="text-xs text-red-400 font-mono block mt-2">{errors.services}</span>
                )}
              </div>

              {/* MINIMAL UNDERLINE FORM FIELDS */}
              <div className="space-y-6">
                {/* NAME FIELD */}
                <div className="flex flex-col">
                  <label htmlFor="footer-name" className="font-mono text-xs uppercase font-bold text-slate-300 tracking-wider mb-1">
                    Name <span className="text-[#004BFF]">*</span>
                  </label>
                  <input
                    id="footer-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Enter your full name"
                    className={`w-full bg-transparent border-b ${
                      errors.name ? "border-red-500" : "border-[#18355B]"
                    } py-3.5 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-[#004BFF] transition-colors rounded-none`}
                  />
                  {errors.name && <span className="text-xs text-red-400 font-mono mt-1">{errors.name}</span>}
                </div>

                {/* PHONE & EMAIL ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {/* PHONE NUMBER FIELD */}
                  <div className="flex flex-col">
                    <label htmlFor="footer-phone" className="font-mono text-xs uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Phone Number <span className="text-[#004BFF]">*</span>
                    </label>
                    <input
                      id="footer-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-transparent border-b ${
                        errors.phone ? "border-red-500" : "border-[#18355B]"
                      } py-3.5 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-[#004BFF] transition-colors rounded-none`}
                    />
                    {errors.phone && <span className="text-xs text-red-400 font-mono mt-1">{errors.phone}</span>}
                  </div>

                  {/* EMAIL FIELD (OPTIONAL) */}
                  <div className="flex flex-col">
                    <label htmlFor="footer-email" className="font-mono text-xs uppercase font-bold text-slate-300 tracking-wider mb-1">
                      Email Address <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="footer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-transparent border-b border-[#18355B] py-3.5 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-[#004BFF] transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* PROJECT DETAILS MULTILINE FIELD */}
                <div className="flex flex-col">
                  <label htmlFor="footer-details" className="font-mono text-xs uppercase font-bold text-slate-300 tracking-wider mb-1">
                    Project Details <span className="text-slate-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="footer-details"
                    rows={3}
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    placeholder="Tell us a little about your project goals or timeline..."
                    className="w-full bg-transparent border-b border-[#18355B] py-3.5 text-base text-white placeholder:text-slate-600 focus:outline-none focus:border-[#004BFF] transition-colors rounded-none resize-none"
                  />
                </div>
              </div>

              {/* SUBMISSION STATUS NOTICE */}
              {submissionNotice && (
                <div className="p-4 bg-[#004BFF]/15 border border-[#004BFF]/50 text-slate-200 text-xs sm:text-sm font-sans leading-relaxed">
                  {submissionNotice}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#004BFF] hover:bg-[#003CD0] active:bg-[#0030A0] text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider py-4 px-8 sm:px-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#050D1A] disabled:opacity-60 cursor-pointer inline-block"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>

          {/* OPEN BACKGROUND SPACE / CONTACT QUICK SUMMARY ON RIGHT (40% ON DESKTOP) */}
          <div className="lg:col-span-5 flex flex-col space-y-8 pt-4 lg:pt-0 lg:pl-8 border-t lg:border-t-0 border-[#18355B]/40">
            <div className="space-y-4">
              <span className="font-mono text-xs font-semibold text-[#004BFF] uppercase tracking-wider block">
                DIRECT CONTACT
              </span>
              <div>
                <a
                  href={`tel:${CONTACT_CONFIG.phoneRaw}`}
                  className="font-sans text-xl sm:text-2xl font-medium text-white hover:text-[#004BFF] transition-colors block mb-2"
                >
                  {CONTACT_CONFIG.phone}
                </a>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="font-sans text-lg sm:text-xl font-medium text-slate-300 hover:text-white transition-colors block"
                >
                  {CONTACT_CONFIG.email}
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <span className="font-mono text-xs font-semibold text-[#004BFF] uppercase tracking-wider block">
                SOCIAL PROFILES
              </span>
              <div className="flex flex-col space-y-2">
                <a
                  href={CONTACT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-slate-300 hover:text-white transition-colors inline-block"
                >
                  INSTAGRAM →
                </a>
                <a
                  href={CONTACT_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-slate-300 hover:text-white transition-colors inline-block"
                >
                  FACEBOOK →
                </a>
                <a
                  href={CONTACT_CONFIG.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-slate-300 hover:text-white transition-colors inline-block"
                >
                  LINKEDIN →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BRAND ROW */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-400 font-mono text-xs space-y-4 sm:space-y-0">
          <span className="font-pixel text-white text-base tracking-widest">NORTHFRAME</span>
          <span>© {new Date().getFullYear()} NORTHFRAME. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
