"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import { CONNECT_FRAMEWORK } from "@/lib/content";

export default function FrameworkPage() {
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
        <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Implementation Model</div>
        <h2 className="font-display text-3xl font-bold mb-4">The CONNECT Framework</h2>
        <p className="text-base text-gray-400 leading-relaxed mb-9">
          An evidence-based implementation model for organisations, communities, and individuals seeking to foster
          meaningful male social connection. Each letter represents an essential component grounded in the research.
        </p>
        {CONNECT_FRAMEWORK.map((item, i) => (
          <div key={i} className="flex gap-4 items-start mb-5 p-5 card-base hover:border-gold/10 transition-all">
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center font-display text-2xl font-black text-deep shrink-0"
              style={{ background: "linear-gradient(135deg, #D4A843, #C09430)" }}>
              {item.letter}
            </div>
            <div>
              <h3 className="font-display text-base font-bold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-snug">{item.desc}</p>
            </div>
          </div>
        ))}
        <div className="bg-gold/10 border border-gold/10 rounded-2xl p-6 mt-7">
          <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2.5">ð¡ Key Insight</div>
          <p className="font-display text-base italic leading-relaxed">
            "There is no quick fix to loneliness, but learnt practices, behaviours, and community connection
            should be built into one's lifestyle." â Morrish, Choudhury, & Medina-Lara (2023)
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
