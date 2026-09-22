"use client";

import React, { useState, useRef, FormEvent } from "react";

const CONTACT_CONFIG = {
  phone: "+91 807 555 9044",
  phoneRaw: "+918075559044",
  whatsappUrl: "https://wa.me/918075559044",
  email: "of.northframe@gmail.com",
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

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectDetails, setProjectDetails] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

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
      newErrors.phone = "Please enter a valid phone number.";
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
      setSubmissionNotice(
        "Notice: Form input validated successfully. We will get back to you shortly."
      );
    }, 800);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full bg-transparent text-white pt-20 sm:pt-24 lg:pt-28 pb-16 px-6 sm:px-10 lg:px-16 overflow-x-clip pointer-events-auto z-30 select-none min-h-[100svh]"
    >
      <div className="relative z-10 max-w-[1400px] mx-auto w-full">
        {/* TOP TEXT LAYOUT */}
        <div className="w-full max-w-[1000px] mb-12 sm:mb-16">
          {/* COMPACT CONTACT LABEL IN UPPER-LEFT */}
          <div className="flex items-center mb-6 sm:mb-8">
            <span className="font-pixel inline-block bg-white text-black px-2.5 py-1 text-xs sm:text-sm font-bold uppercase tracking-wider leading-none">
              CONTACT
            </span>
          </div>

          {/* MAIN EDITORIAL CONTACT COPY — COMPACT TYPOGRAPHY */}
          <h2 className="font-sans font-normal text-white text-[clamp(24px,2.4vw,42px)] leading-[1.12] tracking-[-0.02em] m-0 text-left w-full lg:max-w-[1000px]">
            Ready to take your brand to the next level? Don’t wait. Fill out the
            form or drop us a{" "}
            <a
              href={CONTACT_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 text-white hover:text-[#1677FF] transition-colors"
            >
              WhatsApp message
            </a>
            . Let’s connect, share ideas, and create something that makes people
            say WOOOOOW.
          </h2>
        </div>

        {/* FORM & DIRECT CONTACT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-white/10">
          {/* FORM AREA (7 COLS ON DESKTOP) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              {/* SERVICE SELECTION CHIPS */}
              <div>
                <label className="font-mono text-xs uppercase font-bold text-white/70 tracking-wider block mb-3">
                  Select Services <span className="text-[#1677FF]">*</span>
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
                        className={`px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-mono tracking-wider transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1677FF] ${
                          isSelected
                            ? "bg-[#1677FF] text-white font-semibold"
                            : "bg-[#151515]/60 backdrop-blur-sm border border-white/10 text-white/70 hover:border-white/40 hover:text-white"
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

              {/* FORM INPUTS */}
              <div className="space-y-6">
                {/* NAME */}
                <div className="flex flex-col">
                  <label htmlFor="contact-name" className="font-mono text-xs uppercase font-bold text-white/70 tracking-wider mb-1">
                    Name <span className="text-[#1677FF]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="Enter your full name"
                    className={`w-full bg-transparent border-b ${
                      errors.name ? "border-red-500" : "border-white/20"
                    } py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#1677FF] transition-colors rounded-none`}
                  />
                  {errors.name && <span className="text-xs text-red-400 font-mono mt-1">{errors.name}</span>}
                </div>

                {/* PHONE & EMAIL ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {/* PHONE */}
                  <div className="flex flex-col">
                    <label htmlFor="contact-phone" className="font-mono text-xs uppercase font-bold text-white/70 tracking-wider mb-1">
                      Phone Number <span className="text-[#1677FF]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="+91 807 555 9044"
                      className={`w-full bg-transparent border-b ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      } py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#1677FF] transition-colors rounded-none`}
                    />
                    {errors.phone && <span className="text-xs text-red-400 font-mono mt-1">{errors.phone}</span>}
                  </div>

                  {/* EMAIL */}
                  <div className="flex flex-col">
                    <label htmlFor="contact-email" className="font-mono text-xs uppercase font-bold text-white/70 tracking-wider mb-1">
                      Email Address <span className="text-white/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="of.northframe@gmail.com"
                      className="w-full bg-transparent border-b border-white/20 py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#1677FF] transition-colors rounded-none"
                    />
                  </div>
                </div>

                {/* PROJECT DETAILS */}
                <div className="flex flex-col">
                  <label htmlFor="contact-details" className="font-mono text-xs uppercase font-bold text-white/70 tracking-wider mb-1">
                    Project Details <span className="text-white/40 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="contact-details"
                    rows={3}
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    placeholder="Tell us a little about your project goals or timeline..."
                    className="w-full bg-transparent border-b border-white/20 py-3.5 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-[#1677FF] transition-colors rounded-none resize-none"
                  />
                </div>
              </div>

              {/* SUBMISSION NOTICE */}
              {submissionNotice && (
                <div className="p-4 bg-[#1677FF]/15 border border-[#1677FF]/50 text-white text-xs sm:text-sm font-sans leading-relaxed">
                  {submissionNotice}
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#1677FF] hover:bg-[#1260CC] text-white font-mono text-sm sm:text-base font-bold uppercase tracking-wider py-4 px-8 sm:px-10 transition-colors duration-200 focus:outline-none cursor-pointer inline-block"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE CONTACT INFORMATION */}
          <div className="lg:col-span-5 flex flex-col space-y-8 pt-4 lg:pt-0 lg:pl-8 border-t lg:border-t-0 border-white/10">
            <div className="space-y-6">
              <div>
                <span className="font-mono text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
                  EMAIL
                </span>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="font-sans text-lg sm:text-xl font-medium text-white hover:text-[#1677FF] transition-colors block break-all"
                >
                  {CONTACT_CONFIG.email}
                </a>
              </div>

              <div>
                <span className="font-mono text-xs font-semibold text-[#1677FF] uppercase tracking-wider block mb-1">
                  PHONE / WHATSAPP
                </span>
                <a
                  href={`tel:${CONTACT_CONFIG.phoneRaw}`}
                  className="font-sans text-xl sm:text-2xl font-medium text-white hover:text-[#1677FF] transition-colors block mb-2"
                >
                  {CONTACT_CONFIG.phone}
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="font-mono text-xs font-semibold text-[#1677FF] uppercase tracking-wider block">
                SOCIAL PROFILES
              </span>
              <div className="flex flex-col space-y-2">
                <a
                  href={CONTACT_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-white/70 hover:text-white transition-colors inline-block"
                >
                  INSTAGRAM →
                </a>
                <a
                  href={CONTACT_CONFIG.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-white/70 hover:text-white transition-colors inline-block"
                >
                  FACEBOOK →
                </a>
                <a
                  href={CONTACT_CONFIG.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-white/70 hover:text-white transition-colors inline-block"
                >
                  LINKEDIN →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BRAND ROW */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-white/40 font-mono text-xs space-y-4 sm:space-y-0">
          <span className="font-pixel text-white text-base tracking-widest">NORTHFRAME</span>
          <span>© {new Date().getFullYear()} NORTHFRAME. All rights reserved.</span>
        </div>
      </div>
    </section>
  );
}
