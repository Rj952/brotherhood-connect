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
  const [feedNews, setFeedNews] = useState([]);
  const [feedVideos, setFeedVideos] = useState([]);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.user) { router.push("/"); return; }
      setUser(data.user);
      if (data.user.first_login) setShowWelcome(true);
      setLoading(false);
    }).catch(() => router.push("/"));
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/feed").then(r => r.json()).then(data => {
      setFeedNews(data.news || []);
      setFeedVideos(data.videos || []);
    }).catch(() => {});
  }, [user]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    fetch("/api/auth/welcome-seen", { method: "POST" }).catch(() => {});
  };

  const openPillar = (id) => { setSelectedPillar(id); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handleCheck = (pillarId, idx) => {
    setChecked(prev => {
      const key = pillarId + "-" + idx;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/)?)([\w-]{11})/);
    return m ? m[1] : null;
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#d4af37", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;

  const pillar = selectedPillar ? PILLARS.find(p => p.id === selectedPillar) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e" }}>
      <Nav user={user} />
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ color: "#d4af37", fontSize: "1.6rem", marginBottom: 4 }}>Welcome back{user?.name ? ", " + user.name : ""}</h1>
        <p style={{ color: "#aaa", marginBottom: 24 }}>Your wellness journey continues. Explore the pillars below.</p>

        {!selectedPillar && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16, marginBottom: 32 }}>
              {PILLARS.map(p => (
                <div key={p.id} onClick={() => openPillar(p.id)} style={{ background: "#252540", borderRadius: 12, padding: 20, cursor: "pointer", border: "1px solid #333", transition: "border-color 0.2s" }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>{p.icon}</div>
                  <h3 style={{ color: "#d4af37", margin: "0 0 6px" }}>{p.title}</h3>
                  <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>{p.description}</p>
                </div>
              ))}
            </div>

            {/* NEWS & VIDEOS FEED */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ color: "#d4af37", fontSize: "1.3rem", marginBottom: 16, borderBottom: "1px solid #333", paddingBottom: 8 }}>Latest News & Videos</h2>

              {feedNews.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: "#e0e0e0", fontSize: "1rem", marginBottom: 12 }}>\uD83D\uDCF0 News Updates</h3>
                  <div style={{ background: "#252540", borderRadius: 12, border: "1px solid #333", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #444" }}>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "#d4af37", fontSize: "0.8rem", fontWeight: 600 }}>Title</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "#d4af37", fontSize: "0.8rem", fontWeight: 600 }}>Group</th>
                          <th style={{ textAlign: "left", padding: "10px 14px", color: "#d4af37", fontSize: "0.8rem", fontWeight: 600 }}>Type</th>
                          <th style={{ textAlign: "right", padding: "10px 14px", color: "#d4af37", fontSize: "0.8rem", fontWeight: 600 }}>Posted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedNews.slice(0, 8).map(n => (
                          <tr key={n.id} onClick={() => router.push("/groups/" + n.group_id)} style={{ borderBottom: "1px solid #333", cursor: "pointer" }}>
                            <td style={{ padding: "10px 14px", color: "#e0e0e0", fontSize: "0.85rem" }}>{n.title}</td>
                            <td style={{ padding: "10px 14px", color: "#aaa", fontSize: "0.85rem" }}>{n.group_name}</td>
                            <td style={{ padding: "10px 14px" }}><span style={{ background: n.news_type === "announcement" ? "#f97316" : n.news_type === "video" ? "#a78bfa" : "#d4af37", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem" }}>{n.news_type}</span></td>
                            <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem", textAlign: "right" }}>{timeAgo(n.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {feedVideos.length > 0 && (
                <div>
                  <h3 style={{ color: "#e0e0e0", fontSize: "1rem", marginBottom: 12 }}>\uD83C\uDFAC Shared Videos</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {feedVideos.slice(0, 6).map(v => (
                      <div key={v.id} onClick={() => router.push("/groups/" + v.group_id)} style={{ background: "#252540", borderRadius: 12, overflow: "hidden", border: "1px solid #333", cursor: "pointer" }}>
                        {getYouTubeId(v.youtube_url) && (
                          <img src={"https://img.youtube.com/vi/" + getYouTubeId(v.youtube_url) + "/mqdefault.jpg"} alt={v.title} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                        )}
                        <div style={{ padding: 10 }}>
                          <h4 style={{ margin: 0, color: "#e0e0e0", fontSize: "0.85rem" }}>{v.title}</h4>
                          <p style={{ color: "#888", fontSize: "0.75rem", margin: "4px 0 0" }}>{v.group_name} \u00B7 {v.poster_name || "Member"} \u00B7 {timeAgo(v.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {feedNews.length === 0 && feedVideos.length === 0 && (
                <p style={{ color: "#888", textAlign: "center", padding: 20 }}>No news or videos yet. Join a group to see updates here!</p>
              )}
            </div>
          </>
        )}

        {selectedPillar && pillar && (
          <div>
            <button onClick={() => setSelectedPillar(null)} style={{ background: "transparent", border: "none", color: "#d4af37", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem" }}>\u2190 Back to Pillars</button>
            <div style={{ background: "#252540", borderRadius: 12, padding: 24, border: "1px solid #333" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>{pillar.icon}</div>
              <h2 style={{ color: "#d4af37", marginBottom: 8 }}>{pillar.title}</h2>
              <p style={{ color: "#aaa", lineHeight: 1.6, marginBottom: 16 }}>{pillar.detail}</p>
              {pillar.checklist && (
                <div>
                  <h3 style={{ color: "#e0e0e0", fontSize: "1rem", marginBottom: 12 }}>Weekly Checklist</h3>
                  {pillar.checklist.map((item, idx) => {
                    const key = pillar.id + "-" + idx;
                    return (
                      <label key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", cursor: "pointer", color: checked[key] ? "#888" : "#e0e0e0", textDecoration: checked[key] ? "line-through" : "none" }}>
                        <input type="checkbox" checked={!!checked[key]} onChange={() => handleCheck(pillar.id, idx)} style={{ accentColor: "#d4af37" }} />
                        {item}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
