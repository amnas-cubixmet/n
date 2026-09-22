"use client";

import React from "react";
import Hero, { HeroProps } from "./Hero";

export default function HeroSection(props: HeroProps) {
  return <Hero {...props} />;
}
