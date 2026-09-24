"use client";

import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const CONTACT_CONFIG = {
  phone: "+91 807 555 9044",
  phoneRaw: "+918075559044",
  whatsappUrl: "https://wa.me/918075559044",
  email: "of.northframe@gmail.com",
  instagramUrl:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://instagram.com/northframe",
  facebookUrl:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://facebook.com/northframe",
  linkedinUrl:
    process.env.NEXT_PUBLIC_LINKEDIN_URL ||
    "https://linkedin.com/company/northframe",
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const formAreaRef = useRef<HTMLDivElement>(null);
  const contactAreaRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

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

    const handleMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
      return () =>
        motionQuery.removeEventListener("change", handleMotionChange);
    }

    motionQuery.addListener(handleMotionChange);
    return () => motionQuery.removeListener(handleMotionChange);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;

    if (!section || !video || isReducedMotion || videoError) return;

    const pauseVideo = () => {
      if (!video.paused) {
        video.pause();
      }
    };

    const playVideo = () => {
      if (document.visibilityState !== "visible") return;

      const promise = video.play();
      if (promise) {
        promise.catch(() => {
          setVideoError(true);
        });
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          playVideo();
        } else {
          pauseVideo();
        }
      },
      {
        threshold: 0.06,
      }
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const rect = section.getBoundingClientRect();
        const isVisible =
          rect.bottom > 0 && rect.top < window.innerHeight;

        if (isVisible) {
          playVideo();
        }
      } else {
        pauseVideo();
      }
    };

    observer.observe(section);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      pauseVideo();
    };
  }, [isReducedMotion, videoError]);

  useGSAP(
    () => {
      if (
        typeof window === "undefined" ||
        !sectionRef.current ||
        isReducedMotion
      ) {
        return;
      }

      const targets = [
        introRef.current,
        formAreaRef.current,
        contactAreaRef.current,
        brandRef.current,
      ].filter(Boolean);

      gsap.set(targets, {
        autoAlpha: 0,
        y: 14,
        force3D: true,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 84%",
          once: true,
          invalidateOnRefresh: true,
        },
        defaults: {
          ease: "power3.out",
          overwrite: "auto",
        },
      });

      timeline
        .to(introRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.42,
        })
        .to(
          [formAreaRef.current, contactAreaRef.current],
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.48,
            stagger: 0.06,
          },
          "-=0.24"
        )
        .to(
          brandRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
          },
          "-=0.28"
        );

      return () => timeline.kill();
    },
    {
      scope: sectionRef,
      dependencies: [isReducedMotion],
      revertOnUpdate: true,
    }
  );

  const toggleService = (chip: string) => {
    setSelectedServices((previous) =>
      previous.includes(chip)
        ? previous.filter((service) => service !== chip)
        : [...previous, chip]
    );

    if (errors.services) {
      setErrors((previous) => ({
        ...previous,
        services: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (selectedServices.length === 0) {
      nextErrors.services = "Please select at least one service category.";
    }

    if (!name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Please enter your phone number.";
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmissionNotice(null);

    if (!validate()) return;

    setIsSubmitting(true);

    window.setTimeout(() => {
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
      className="relative z-30 m-0 min-h-[100svh] w-full overflow-hidden bg-[#040507] px-[max(1.1rem,env(safe-area-inset-left))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 pr-[max(1.1rem,env(safe-area-inset-right))] text-white pointer-events-auto sm:px-10 sm:pt-20 lg:px-16 lg:pt-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {!isReducedMotion && !videoError ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/studio_materials_bg.jpg"
            onError={() => setVideoError(true)}
            className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.2]"
          >
            <source src="/videos/northframe-hero.webm" type="video/webm" />
            <source src="/videos/northframe-hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <Image
            src="/images/studio_materials_bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center opacity-[0.16]"
          />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,5,7,0.76)_0%,rgba(4,5,7,0.91)_48%,#040507_100%)]" />
        <div className="absolute bottom-[12%] right-[6%] h-[22%] w-[30%] bg-white/[0.025]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px]">
        <div
          ref={introRef}
          className="mb-12 w-full max-w-[1050px] sm:mb-16"
        >
          <div className="mb-6 flex items-center sm:mb-8">
            <span className="inline-block bg-white px-2.5 py-1 font-pixel text-xs font-bold uppercase leading-none tracking-wider text-black sm:text-sm">
              CONTACT
            </span>
          </div>

          <h2 className="m-0 w-full text-left font-sans text-[clamp(25px,6.2vw,36px)] font-normal leading-[1.08] tracking-[-0.025em] text-white sm:text-[clamp(30px,3.4vw,44px)] lg:max-w-[1000px] lg:text-[clamp(34px,2.5vw,46px)]">
            Ready to take your brand to the next level? Fill out the form or
            drop us a{" "}
            <a
              href={CONTACT_CONFIG.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/50 underline-offset-4 transition-colors lg:hover:text-[#1677FF]"
            >
              WhatsApp message
            </a>
            . Let’s connect, share ideas, and create something that makes
            people say WOOOOOW.
          </h2>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 border-b border-white/10 pb-14 lg:grid-cols-12 lg:gap-16 lg:pb-16">
          <div ref={formAreaRef} className="lg:col-span-7">
            <form onSubmit={handleSubmit} noValidate className="space-y-8">
              <div>
                <label className="mb-3 block font-mono text-xs font-bold uppercase tracking-wider text-white/65">
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
                        className={`min-h-[42px] cursor-pointer px-4 py-2.5 font-mono text-xs tracking-wider transition-[background-color,border-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-[#1677FF] sm:px-5 sm:text-sm ${
                          isSelected
                            ? "bg-[#1677FF] font-semibold text-white"
                            : "border border-white/10 bg-white/[0.035] text-white/65 lg:hover:border-white/35 lg:hover:text-white"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {errors.services && (
                  <span className="mt-2 block font-mono text-xs text-red-400">
                    {errors.services}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <label
                    htmlFor="contact-name"
                    className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-white/65"
                  >
                    Name <span className="text-[#1677FF]">*</span>
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (errors.name) {
                        setErrors((previous) => ({
                          ...previous,
                          name: undefined,
                        }));
                      }
                    }}
                    placeholder="Enter your full name"
                    className={`w-full rounded-none border-b bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF] ${
                      errors.name ? "border-red-500" : "border-white/20"
                    }`}
                  />

                  {errors.name && (
                    <span className="mt-1 font-mono text-xs text-red-400">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                  <div className="flex flex-col">
                    <label
                      htmlFor="contact-phone"
                      className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-white/65"
                    >
                      Phone Number <span className="text-[#1677FF]">*</span>
                    </label>

                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);
                        if (errors.phone) {
                          setErrors((previous) => ({
                            ...previous,
                            phone: undefined,
                          }));
                        }
                      }}
                      placeholder="+91 807 555 9044"
                      className={`w-full rounded-none border-b bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF] ${
                        errors.phone ? "border-red-500" : "border-white/20"
                      }`}
                    />

                    {errors.phone && (
                      <span className="mt-1 font-mono text-xs text-red-400">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="contact-email"
                      className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-white/65"
                    >
                      Email Address{" "}
                      <span className="font-normal text-white/35">
                        (Optional)
                      </span>
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="of.northframe@gmail.com"
                      className="w-full rounded-none border-b border-white/20 bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF]"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="contact-details"
                    className="mb-1 font-mono text-xs font-bold uppercase tracking-wider text-white/65"
                  >
                    Project Details{" "}
                    <span className="font-normal text-white/35">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="contact-details"
                    rows={3}
                    value={projectDetails}
                    onChange={(event) =>
                      setProjectDetails(event.target.value)
                    }
                    placeholder="Tell us a little about your project goals or timeline..."
                    className="w-full resize-none rounded-none border-b border-white/20 bg-transparent py-3.5 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-[#1677FF]"
                  />
                </div>
              </div>

              {submissionNotice && (
                <div className="border border-[#1677FF]/50 bg-[#1677FF]/15 p-4 font-sans text-xs leading-relaxed text-white sm:text-sm">
                  {submissionNotice}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[48px] cursor-pointer items-center justify-center bg-[#1677FF] px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-10 sm:text-base lg:hover:bg-[#1260CC]"
              >
                {isSubmitting ? "Sending..." : "Send Enquiry"}
              </button>
            </form>
          </div>

          <div
            ref={contactAreaRef}
            className="flex flex-col space-y-8 border-t border-white/10 pt-8 lg:col-span-5 lg:border-t-0 lg:pl-8 lg:pt-0"
          >
            <div className="space-y-6">
              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
                  EMAIL
                </span>
                <a
                  href={`mailto:${CONTACT_CONFIG.email}`}
                  className="block break-all font-sans text-lg font-medium text-white transition-colors sm:text-xl lg:hover:text-[#1677FF]"
                >
                  {CONTACT_CONFIG.email}
                </a>
              </div>

              <div>
                <span className="mb-1 block font-mono text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
                  PHONE / WHATSAPP
                </span>
                <a
                  href={`tel:${CONTACT_CONFIG.phoneRaw}`}
                  className="mb-2 block font-sans text-xl font-medium text-white transition-colors sm:text-2xl lg:hover:text-[#1677FF]"
                >
                  {CONTACT_CONFIG.phone}
                </a>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="block font-mono text-xs font-semibold uppercase tracking-wider text-[#1677FF]">
                SOCIAL PROFILES
              </span>

              <div className="flex flex-col space-y-2">
                {[
                  ["INSTAGRAM", CONTACT_CONFIG.instagramUrl],
                  ["FACEBOOK", CONTACT_CONFIG.facebookUrl],
                  ["LINKEDIN", CONTACT_CONFIG.linkedinUrl],
                ].map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block font-mono text-sm text-white/65 transition-colors lg:hover:text-white"
                  >
                    {label} →
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="relative pt-10 sm:pt-12">
          <div
            ref={brandRef}
            className="overflow-hidden border-b border-white/10 pb-6"
          >
            <div
              aria-label="NORTHFRAME"
              className="whitespace-nowrap font-sans text-[clamp(3.1rem,14vw,12.5rem)] font-bold uppercase leading-[0.78] tracking-[-0.07em] text-white"
            >
              NORTHFRAME
            </div>
          </div>

          <div className="flex flex-col gap-3 py-6 font-mono text-[10px] uppercase tracking-[0.08em] text-white/40 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
            <span>Creative · Digital · Technology</span>
            <span>
              © {new Date().getFullYear()} NORTHFRAME. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}
