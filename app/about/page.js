"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function AboutPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.user) router.push("/");
      else setUser(data.user);
    }).catch(() => router.push("/"));
  }, [router]);

  if (!user) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen relative">
      <Nav user={user} />
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-20 relative z-10">
        <div className="card-base border-gold/10 rounded-3xl p-10 md:p-12">
          <h1 className="font-display text-3xl font-black text-gold mb-6">About Brotherhood Connect</h1>
          <p className="text-base text-gray-400 leading-relaxed mb-4">
            Brotherhood Connect is a research-powered wellness and learning platform created specifically for
            Black and brown men. Built on the foundation of 85+ years of evidence from the Harvard Study of
            Adult Development and 33 peer-reviewed academic studies, this platform transforms rigorous research
            into practical, culturally grounded tools for connection, health, and growth.
          </p>
          <p className="text-base text-gray-400 leading-relaxed mb-4">
            The platform is organised around seven pillars of male social wellbeing: Physical Health & Longevity,
            Mental Health & Resilience, Cognitive Function & Brain Health, Economic & Professional Growth, Family &
            Relational Wellbeing, Identity & Cultural Belonging, and Community Safety & Civic Life. Each pillar
            offers evidence summaries, actionable practices, and reflective questions.
          </p>
          <p className="text-base text-gray-400 leading-relaxed mb-4">
            Special attention is given to the lived experiences, cultural strengths, and structural challenges
            facing Black men in the United States and the Caribbean â including the rich traditions of yard
            culture, liming, reasoning, barbershop fellowship, and faith-based brotherhood that represent
            powerful models for social connection worldwide.
          </p>
          <p className="text-base text-gray-400 leading-relaxed">
            The CONNECT implementation framework provides a practical model for building programmes, groups,
            and initiatives that foster male social wellbeing in culturally authentic ways.
          </p>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-sm text-gray-500">
            <p className="text-gold font-bold text-base">Created by Rohan Jowallah</p>
            <p className="mt-2">
              Senior Instructional Designer, University of Central Florida â¢ Inclusive Educator, UCCI â¢
              AI Consultant, UTech Jamaica â¢ Honorary Advisor, Farquharson Institute of Public Affairs â¢
              Fellow, AAC&U Faculty AI Institute â¢ Fellow, UK Higher Education Academy
            </p>
            <p className="mt-2 italic">
              Author of <em>AI, Pedagogy and Inclusion: Shaping Pedagogy in a Changing World</em> (2025)
            </p>
            <p className="mt-4 text-gray-600">
              Based on the academic research paper "Brotherhood, Belonging, and Beyond: Why Men Need Social
              Groups More Than Ever" (Campbell-Patterson, 2026), integrating findings from the Consensus
              academic research database.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
