"use client";

export default function WelcomeModal({ name, onClose }) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-xl p-10 card-base border-gold/10 rounded-3xl text-center animate-fade-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="text-6xl mb-3">🤝</div>
        <h1 className="font-display text-2xl font-black text-gold mb-5">
          Welcome to the Circle{name ? `, ${name}` : ""}
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed text-left mb-3">
          You've just entered a private space created for Black and brown men to learn, connect, and grow
          together. This platform is grounded in 85+ years of research from the Harvard Study of Adult
          Development and 33 peer-reviewed academic studies.
        </p>
        <p className="text-sm text-gray-400 leading-relaxed text-left mb-5">
          Everything here is designed to support your wellbeing across seven areas of life — from physical
          health and mental resilience to family, identity, and community.
        </p>
        <div className="text-left p-5 rounded-xl bg-gold/10 border border-gold/10 mb-5">
          <div className="py-1 text-sm">🛡️ <strong>Privacy</strong> — What happens in the circle stays in the circle</div>
          <div className="py-1 text-sm">💪 <strong>Strength</strong> — Vulnerability is a sign of courage, not weakness</div>
          <div className="py-1 text-sm">🌍 <strong>Culture</strong> — Our heritage and traditions are sources of power</div>
          <div className="py-1 text-sm">🤝 <strong>Brotherhood</strong> — We rise by lifting each other</div>
          <div className="py-1 text-sm">📚 <strong>Evidence</strong> — Every strategy here is backed by research</div>
        </div>
        <p className="font-display italic text-gold text-sm mb-5">
          "The good life is built with good relationships." — The Harvard Study
        </p>
        <button className="btn-gold" onClick={onClose}>Enter Brotherhood Connect</button>
      </div>
    </div>
  );
}
