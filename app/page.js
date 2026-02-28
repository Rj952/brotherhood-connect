"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regCode, setRegCode] = useState("");
  const [regReason, setRegReason] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setMsg({ type: "error", text: "Connection error. Please try again." });
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPw, inviteCode: regCode, reason: regReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: "error", text: data.error });
      } else {
        setMsg({ type: "success", text: data.message });
        setRegName(""); setRegEmail(""); setRegPw(""); setRegCode(""); setRegReason("");
      }
    } catch {
      setMsg({ type: "error", text: "Connection error. Please try again." });
    }
    setLoading(false);
  };

  const msgClass = msg?.type === "error"
    ? "bg-red-900/20 border border-red-800/30 text-red-300"
    : msg?.type === "success"
    ? "bg-green-900/20 border border-green-800/30 text-green-300"
    : "bg-blue-900/20 border border-blue-800/30 text-blue-300";

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(212,168,67,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(64,145,108,0.06) 0%, transparent 50%), #0A0A0F" }}>

      {view === "login" ? (
        <form onSubmit={handleLogin} className="w-full max-w-md p-10 card-base border-gold/10 rounded-3xl text-center animate-fade-up relative z-10">
          <div className="text-5xl mb-4">ð¤</div>
          <h1 className="font-display text-3xl font-black text-gold mb-2">Brotherhood Connect</h1>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">Sign in to access your brotherhood circle</p>

          <div className="text-left mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Email Address</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </div>
          <div className="text-left mb-4">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Password</label>
            <input type="password" className="input-field" placeholder="Enter your password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} required />
          </div>

          <button type="submit" className="btn-gold mt-2" disabled={loading}>
            {loading ? "Signing in..." : "Enter the Circle"}
          </button>

          {msg && <div className={`mt-4 p-3 rounded-lg text-sm ${msgClass}`}>{msg.text}</div>}

          <p className="mt-6 text-sm text-gray-500">
            New here?{" "}
            <button type="button" onClick={() => { setView("register"); setMsg(null); }}
              className="text-gold font-semibold underline bg-transparent border-none cursor-pointer">
              Request Access
            </button>
          </p>
          <p className="mt-6 text-xs text-gray-600 leading-relaxed">
            Created by <strong className="text-gold">Rohan Jowallah</strong><br />
            Built on 85+ years of Harvard research
          </p>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="w-full max-w-md p-10 card-base border-gold/10 rounded-3xl text-center animate-fade-up relative z-10">
          <div className="text-5xl mb-4">â</div>
          <h1 className="font-display text-3xl font-black text-gold mb-2">Request Access</h1>
          <p className="text-sm text-gray-400 mb-7 leading-relaxed">
            Brotherhood Connect is a private space. Tell us about yourself and we'll review your request.
          </p>

          <div className="text-left mb-3">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Full Name</label>
            <input className="input-field" placeholder="Your full name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
          </div>
          <div className="text-left mb-3">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Email Address</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
          </div>
          <div className="text-left mb-3">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Create a Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" value={regPw} onChange={(e) => setRegPw(e.target.value)} required />
          </div>
          <div className="text-left mb-3">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">
              Invite Code <span className="font-normal text-gray-600">(optional)</span>
            </label>
            <input className="input-field" placeholder="e.g. BRO-A3K7YP" value={regCode} onChange={(e) => setRegCode(e.target.value)} />
          </div>
          <div className="text-left mb-3">
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 tracking-wide">Why do you want to join?</label>
            <textarea className="input-field min-h-[80px] resize-y" placeholder="Tell us a bit about yourself..." value={regReason} onChange={(e) => setRegReason(e.target.value)} />
          </div>

          <button type="submit" className="btn-gold mt-2" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </button>

          {msg && <div className={`mt-4 p-3 rounded-lg text-sm ${msgClass}`}>{msg.text}</div>}

          <p className="mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <button type="button" onClick={() => { setView("login"); setMsg(null); }}
              className="text-gold font-semibold underline bg-transparent border-none cursor-pointer">
              Sign In
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
