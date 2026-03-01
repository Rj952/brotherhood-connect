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
  const [feedError, setFeedError] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

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
    fetch("/api/feed")
      .then(r => {
        if (!r.ok) throw new Error("Feed fetch failed");
        return r.json();
      })
      .then(data => {
        if (data && Array.isArray(data.news)) setFeedNews(data.news);
        else setFeedNews([]);
        if (data && Array.isArray(data.videos)) setFeedVideos(data.videos);
        else setFeedVideos([]);
      })
      .catch(() => { setFeedError(true); });
  }, [user]);

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    fetch("/api/auth/welcome-seen", { method: "POST" }).catch(() => {});
  };

  const openPillar = (id) => {
    setSelectedPillar(id);
    setExpandedSections({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheck = (pillarId, idx) => {
    setChecked(prev => {
      const key = pillarId + "-" + idx;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const timeAgo = (date) => {
    try {
      if (!date) return "";
      const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
      if (isNaN(s) || s < 0) return "";
      if (s < 60) return "just now";
      if (s < 3600) return Math.floor(s / 60) + "m ago";
      if (s < 86400) return Math.floor(s / 3600) + "h ago";
      return Math.floor(s / 86400) + "d ago";
    } catch (e) { return ""; }
  };

  const getYouTubeId = (url) => {
    try {
      if (!url || typeof url !== "string") return null;
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\/\w-]{11})/);
      return m ? m[1] : null;
    } catch (e) { return null; }
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
                <div key={p.id} onClick={() => openPillar(p.id)} style={{
                  background: "#252540", borderRadius: 12, padding: 20, cursor: "pointer",
                  border: "1px solid #333", transition: "border-color 0.2s, transform 0.2s",
                }}>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>{p.icon}</div>
                  <h3 style={{ color: "#d4af37", margin: "0 0 6px" }}>{p.title}</h3>
                  <p style={{ color: "#aaa", fontSize: "0.85rem", margin: "0 0 8px" }}>{p.tagline}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ color: "#d4af37", fontSize: "1.4rem", fontWeight: "bold" }}>{p.stat}</span>
                    <span style={{ color: "#888", fontSize: "0.75rem" }}>{p.statLabel}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* NEWS & VIDEOS FEED */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ color: "#d4af37", fontSize: "1.3rem", marginBottom: 16, borderBottom: "1px solid #333", paddingBottom: 8 }}>Latest News & Videos</h2>

              {feedError && (
                <p style={{ color: "#888", textAlign: "center", padding: 20 }}>Could not load feed. Please try again later.</p>
              )}

              {!feedError && feedNews.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: "#e0e0e0", fontSize: "1rem", marginBottom: 12 }}>📰 News Updates</h3>
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
                        {feedNews.slice(0, 8).map((n, idx) => (
                          <tr key={n?.id || idx} onClick={() => n?.group_id && router.push("/groups/" + n.group_id)} style={{ borderBottom: "1px solid #333", cursor: "pointer" }}>
                            <td style={{ padding: "10px 14px", color: "#e0e0e0", fontSize: "0.85rem" }}>{n?.title || "Untitled"}</td>
                            <td style={{ padding: "10px 14px", color: "#aaa", fontSize: "0.85rem" }}>{n?.group_name || ""}</td>
                            <td style={{ padding: "10px 14px" }}>
                              {n?.news_type ? (
                                <span style={{ background: n.news_type === "announcement" ? "#f97316" : n.news_type === "video" ? "#a78bfa" : "#d4af37", color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem" }}>{n.news_type}</span>
                              ) : null}
                            </td>
                            <td style={{ padding: "10px 14px", color: "#888", fontSize: "0.8rem", textAlign: "right" }}>{timeAgo(n?.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!feedError && feedVideos.length > 0 && (
                <div>
                  <h3 style={{ color: "#e0e0e0", fontSize: "1rem", marginBottom: 12 }}>🎬 Shared Videos</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                    {feedVideos.slice(0, 6).map((v, idx) => {
                      const ytId = getYouTubeId(v?.youtube_url);
                      return (
                        <div key={v?.id || idx} onClick={() => v?.group_id && router.push("/groups/" + v.group_id)} style={{ background: "#252540", borderRadius: 12, overflow: "hidden", border: "1px solid #333", cursor: "pointer" }}>
                          {ytId && (
                            <img src={"https://img.youtube.com/vi/" + ytId + "/mqdefault.jpg"} alt={v?.title || "Video"} style={{ width: "100%", height: 150, objectFit: "cover" }} />
                          )}
                          <div style={{ padding: 10 }}>
                            <h4 style={{ margin: 0, color: "#e0e0e0", fontSize: "0.85rem" }}>{v?.title || "Untitled"}</h4>
                            <p style={{ color: "#888", fontSize: "0.75rem", margin: "4px 0 0" }}>{v?.group_name || ""} · {v?.poster_name || "Member"} · {timeAgo(v?.created_at)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!feedError && feedNews.length === 0 && feedVideos.length === 0 && (
                <p style={{ color: "#888", textAlign: "center", padding: 20 }}>No news or videos yet. Join a group to see updates here!</p>
              )}
            </div>
          </>
        )}

        {selectedPillar && pillar && (
          <div>
            <button onClick={() => setSelectedPillar(null)} style={{ background: "transparent", border: "none", color: "#d4af37", cursor: "pointer", marginBottom: 16, fontSize: "0.9rem" }}>← Back to Pillars</button>

            <div style={{ background: pillar.gradient || "#252540", borderRadius: 16, padding: "28px 24px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: "2.5rem" }}>{pillar.icon}</span>
                <div>
                  <h2 style={{ color: "#fff", margin: 0, fontSize: "1.5rem" }}>{pillar.title}</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: "0.9rem", fontStyle: "italic" }}>{pillar.tagline}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                <span style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold" }}>{pillar.stat}</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem" }}>{pillar.statLabel}</span>
              </div>
            </div>

            {/* Overview */}
            <div style={{ background: "#252540", borderRadius: 12, padding: 20, border: "1px solid #333", marginBottom: 16 }}>
              <h3 style={{ color: "#d4af37", margin: "0 0 10px", fontSize: "1.1rem" }}>Overview</h3>
              <p style={{ color: "#ccc", lineHeight: 1.7, margin: 0, fontSize: "0.9rem" }}>{pillar.overview}</p>
            </div>

            {/* Research Findings - Collapsible */}
            <div style={{ background: "#252540", borderRadius: 12, border: "1px solid #333", marginBottom: 16, overflow: "hidden" }}>
              <button onClick={() => toggleSection("research")} style={{
                width: "100%", background: "transparent", border: "none", padding: "16px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
              }}>
                <h3 style={{ color: "#d4af37", margin: 0, fontSize: "1.1rem" }}>📚 Research Findings ({pillar.research?.length || 0})</h3>
                <span style={{ color: "#d4af37", fontSize: "1.2rem" }}>{expandedSections.research ? "▲" : "▼"}</span>
              </button>
              {expandedSections.research && pillar.research && (
                <div style={{ padding: "0 20px 16px" }}>
                  {pillar.research.map((r, idx) => (
                    <div key={idx} style={{ background: "#1a1a2e", borderRadius: 8, padding: 14, marginBottom: 10, borderLeft: "3px solid " + (pillar.color || "#d4af37") }}>
                      <p style={{ color: "#e0e0e0", margin: "0 0 6px", fontSize: "0.85rem", lineHeight: 1.5 }}>{r.finding}</p>
                      <p style={{ color: "#888", margin: 0, fontSize: "0.75rem", fontStyle: "italic" }}>{r.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practices - Checkable */}
            <div style={{ background: "#252540", borderRadius: 12, border: "1px solid #333", marginBottom: 16, overflow: "hidden" }}>
              <button onClick={() => toggleSection("practices")} style={{
                width: "100%", background: "transparent", border: "none", padding: "16px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
              }}>
                <h3 style={{ color: "#d4af37", margin: 0, fontSize: "1.1rem" }}>✅ Wellness Practices ({pillar.practices?.length || 0})</h3>
                <span style={{ color: "#d4af37", fontSize: "1.2rem" }}>{expandedSections.practices ? "▲" : "▼"}</span>
              </button>
              {expandedSections.practices && pillar.practices && (
                <div style={{ padding: "0 20px 16px" }}>
                  {pillar.practices.map((item, idx) => {
                    const key = pillar.id + "-" + idx;
                    return (
                      <label key={idx} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                        background: checked[key] ? "#1a2e1a" : "#1a1a2e", borderRadius: 8, marginBottom: 8,
                        cursor: "pointer", transition: "background 0.2s",
                        color: checked[key] ? "#4ade80" : "#e0e0e0",
                      }}>
                        <input type="checkbox" checked={!!checked[key]} onChange={() => handleCheck(pillar.id, idx)}
                          style={{ accentColor: "#d4af37", width: 18, height: 18 }} />
                        <span style={{ fontSize: "0.85rem", textDecoration: checked[key] ? "line-through" : "none" }}>{item}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reflection */}
            <div style={{ background: "#252540", borderRadius: 12, border: "1px solid #333", marginBottom: 16, overflow: "hidden" }}>
              <button onClick={() => toggleSection("reflection")} style={{
                width: "100%", background: "transparent", border: "none", padding: "16px 20px",
                display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer"
              }}>
                <h3 style={{ color: "#d4af37", margin: 0, fontSize: "1.1rem" }}>💭 Reflection Question</h3>
                <span style={{ color: "#d4af37", fontSize: "1.2rem" }}>{expandedSections.reflection ? "▲" : "▼"}</span>
              </button>
              {expandedSections.reflection && (
                <div style={{ padding: "0 20px 16px" }}>
                  <div style={{ background: "#1a1a2e", borderRadius: 8, padding: 16, borderLeft: "3px solid #d4af37" }}>
                    <p style={{ color: "#e0e0e0", margin: 0, fontSize: "0.9rem", lineHeight: 1.6, fontStyle: "italic" }}>{pillar.reflection}</p>
                  </div>
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

