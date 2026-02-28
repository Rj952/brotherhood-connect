"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";
import WelcomeModal from "@/app/components/WelcomeModal";
import { PILLARS } from "@/lib/content";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.user) { router.push("/"); return; }
      setUser(data.user);
      if (data.user.first_login) setShowWelcome(true);
      setLoading(false);
    }).catch(() => router.push("/"));
  }, [router]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    fetch("/api/auth/welcome-seen", { method: "POST" }).catch(() => {});
  };

  const openPillar = (id) => { setSelectedPillar(id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const closePillar = () => { setSelectedPillar(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleCheck = (key) => setChecked(p => ({ ...p, [key]: !p[key] }));

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const pillar = PILLARS.find(p => p.id === selectedPillar);

  return (
    <div className="min-h-screen relative">
      {showWelcome && <WelcomeModal name={user?.name?.split(" ")[0]} onClose={handleCloseWelcome} />}
      <Nav user={user} />

      {!pillar ? (
        <>
          {/* Hero */}
          <section className="max-w-7xl mx-auto pt-20 pb-16 px-6 text-center relative z-10">
            <div className="inline-block px-5 py-1.5 bg-gold/10 border border-gold/15 rounded-full text-xs font-semibold text-gold tracking-widest uppercase mb-6 animate-fade-up">
              Research-Powered Wellness Platform
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-black leading-tight mb-5 animate-fade-up animate-fade-up-1">
              Brotherhood, <span className="text-gold">Belonging</span>,{" "}
              <span className="text-accent-green">& Beyond</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-fade-up-2">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Explore the seven pillars of
              wellbeing, engage with peer-reviewed findings, and practice strategies designed for Black and brown men.
            </p>
            <div className="flex justify-center gap-12 flex-wrap animate-fade-up animate-fade-up-3">
              {[
                ["33", "Peer-reviewed studies"],
                ["7", "Pillars of wellbeing"],
                ["15", "Evidence-based strategies"],
                ["1", "Mission: your wellbeing"],
              ].map(([num, label]) => (
                <div key={num} className="text-center">
                  <div className="font-display text-4xl font-black text-gold">{num}</div>
                  <div className="text-xs text-gray-500 max-w-[130px] mt-1">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Pillars Grid */}
          <section className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
            <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2">Explore & Learn</div>
            <h2 className="font-display text-3xl font-bold mb-10">The Seven Pillars of Connection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {PILLARS.map((p) => (
                <div key={p.id} onClick={() => openPillar(p.id)}
                  className="card-base p-7 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: p.gradient }} />
                  <div className="text-3xl mb-4">{p.icon}</div>
                  <h3 className="font-display text-lg font-bold mb-1.5">{p.title}</h3>
                  <p className="text-sm text-gray-400 italic mb-3">{p.tagline}</p>
                  <div className="inline-flex items-baseline gap-1.5 px-3.5 py-1.5 bg-white/[0.03] rounded-lg text-xs text-gray-400">
                    <strong className="font-display text-base font-black" style={{ color: p.color }}>{p.stat}</strong>
                    {p.statLabel}
                  </div>
                  <div className="absolute bottom-6 right-6 text-lg text-gray-600 group-hover:text-gold group-hover:translate-x-1 transition-all">→</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Pillar Detail */
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-20 relative z-10">
          <button onClick={closePillar}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-400 bg-white/[0.03] border border-white/[0.06] rounded-lg cursor-pointer hover:text-gold hover:border-gold/20 transition-all mb-8">
            ← Back to Pillars
          </button>
          <div className="text-5xl mb-4">{pillar.icon}</div>
          <h1 className="font-display text-3xl font-black mb-2">{pillar.title}</h1>
          <p className="text-lg text-gray-400 italic mb-7">{pillar.tagline}</p>

          <div className="flex items-center gap-4 p-5 rounded-xl mb-9" style={{ background: pillar.gradient }}>
            <div className="font-display text-4xl font-black text-white">{pillar.stat}</div>
            <div className="text-sm text-white/80 leading-snug">{pillar.statLabel}</div>
          </div>

          <div className="mb-9">
            <h2 className="font-display text-xl font-bold text-gold mb-4">Understanding the Evidence</h2>
            <p className="text-base text-gray-400 leading-relaxed">{pillar.overview}</p>
          </div>

          <div className="mb-9">
            <h2 className="font-display text-xl font-bold text-gold mb-4">What the Research Says</h2>
            {pillar.research.map((r, i) => (
              <div key={i} className="bg-elevated rounded-r-xl p-5 mb-3.5 border-l-[3px]" style={{ borderColor: pillar.color }}>
                <div className="text-sm leading-relaxed mb-1.5">{r.finding}</div>
                <div className="font-mono text-xs text-gray-500">{r.source}</div>
              </div>
            ))}
          </div>

          <div className="mb-9">
            <h2 className="font-display text-xl font-bold text-gold mb-4">Practices for Brotherhood</h2>
            {pillar.practices.map((pr, i) => {
              const key = `${pillar.id}-${i}`;
              return (
                <div key={i} className="flex items-start gap-3.5 py-3.5 border-b border-white/[0.04] last:border-b-0">
                  <div onClick={() => toggleCheck(key)}
                    className={`w-5.5 h-5.5 min-w-[22px] min-h-[22px] rounded-md border-2 flex items-center justify-center text-xs cursor-pointer transition-all mt-0.5 ${
                      checked[key] ? "border-gold bg-gold text-deep" : "border-gray-500 text-transparent"
                    }`}>
                    {checked[key] ? "✓" : ""}
                  </div>
                  <div className="text-sm text-gray-400 leading-snug">{pr}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-gold/10 border border-gold/10 rounded-2xl p-6">
            <div className="text-xs font-bold tracking-widest uppercase text-gold mb-2.5">🪞 Reflection Question</div>
            <p className="font-display text-lg italic leading-relaxed">{pillar.reflection}</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
