"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function GroupDetail({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("forum");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [replyText, setReplyText] = useState({});
  const [replies, setReplies] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [news, setNews] = useState([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsYouTube, setNewsYouTube] = useState("");
  const [newsType, setNewsType] = useState("update");
  const [postingNews, setPostingNews] = useState(false);
  const [videos, setVideos] = useState([]);
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidUrl, setVidUrl] = useState("");
  const [postingVid, setPostingVid] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && user.role === "admin";

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) router.push("/login");
      else setUser(d.user);
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/groups/" + params.id)
      .then(r => r.json())
      .then(d => {
        setGroup(d.group);
        setMembers(d.members || []);
        setIsMember(d.isMember);
        setLoading(false);
      });
  }, [user, params.id]);

  useEffect(() => {
    if (isMember || isAdmin) {
      loadPosts();
      loadNews();
      loadVideos();
    }
  }, [isMember, isAdmin]);

  const loadPosts = async () => {
    const res = await fetch("/api/posts?groupId=" + params.id);
    const data = await res.json();
    setPosts(data.posts || []);
  };

  const loadNews = async () => {
    const res = await fetch("/api/groups/" + params.id + "/news");
    const data = await res.json();
    setNews(data.news || []);
  };

  const loadVideos = async () => {
    const res = await fetch("/api/groups/" + params.id + "/videos");
    const data = await res.json();
    setVideos(data.videos || []);
  };

  const joinGroup = async () => {
    await fetch("/api/groups/" + params.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join" }),
    });
    setIsMember(true);
    setMembers(prev => [...prev, { name: "You" }]);
  };

  const leaveGroup = async () => {
    await fetch("/api/groups/" + params.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });
    setIsMember(false);
  };

  const createPost = async () => {
    if (!newPost.trim()) return;
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: params.id, content: newPost }),
    });
    setNewPost("");
    loadPosts();
  };

  const loadReplies = async (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    const res = await fetch("/api/replies?postId=" + postId);
    const data = await res.json();
    setReplies(prev => ({ ...prev, [postId]: data.replies || [] }));
    setExpandedPost(postId);
  };

  const createReply = async (postId) => {
    if (!replyText[postId]?.trim()) return;
    await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: replyText[postId] }),
    });
    setReplyText(prev => ({ ...prev, [postId]: "" }));
    loadReplies(postId);
  };

  const createNews = async () => {
    if (!newsTitle.trim() || !newsContent.trim()) return;
    setPostingNews(true);
    await fetch("/api/groups/" + params.id + "/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newsTitle, content: newsContent, youtubeUrl: newsYouTube, newsType }),
    });
    setNewsTitle(""); setNewsContent(""); setNewsYouTube(""); setNewsType("update");
    setPostingNews(false);
    loadNews();
  };

  const deleteNews = async (newsId) => {
    if (!confirm("Delete this news item?")) return;
    await fetch("/api/groups/" + params.id + "/news?newsId=" + newsId, { method: "DELETE" });
    loadNews();
  };

  const createVideo = async () => {
    if (!vidTitle.trim() || !vidUrl.trim()) return;
    setPostingVid(true);
    await fetch("/api/groups/" + params.id + "/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: vidTitle, description: vidDesc, youtubeUrl: vidUrl }),
    });
    setVidTitle(""); setVidDesc(""); setVidUrl("");
    setPostingVid(false);
    loadVideos();
  };

  const deleteVideo = async (videoId) => {
    if (!confirm("Delete this video?")) return;
    await fetch("/api/groups/" + params.id + "/videos?videoId=" + videoId, { method: "DELETE" });
    loadVideos();
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/)?)([\\w-]{11})/);
    return m ? m[1] : null;
  };

  const typeIcon = (type) => {
    if (type === "video") return "\uD83C\uDFAC";
    if (type === "announcement") return "\uD83D\uDCE2";
    return "\uD83D\uDCF0";
  };

  const typeColor = (type) => {
    if (type === "video") return "#a78bfa";
    if (type === "announcement") return "#f97316";
    return "#d4af37";
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#d4af37", display: "flex", justifyContent: "center", alignItems: "center" }}>Loading...</div>;

  const tabs = ["forum", "news", "videos", "directory"];

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#e0e0e0" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px" }}>
        <h1 style={{ color: "#d4af37", fontSize: "1.8rem" }}>{group?.name}</h1>
        <p style={{ color: "#aaa" }}>{group?.description}</p>
        <p style={{ color: "#888", fontSize: "0.85rem" }}>{members.length} members</p>

        {!isMember && !isAdmin && (
          <button onClick={joinGroup} style={{ background: "#d4af37", color: "#1a1a2e", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginTop: 8 }}>Join Group</button>
        )}
        {isMember && (
          <button onClick={leaveGroup} style={{ background: "transparent", color: "#f87171", border: "1px solid #f87171", padding: "8px 20px", borderRadius: 8, cursor: "pointer", marginTop: 8, fontSize: "0.85rem" }}>Leave Group</button>
        )}

        {(isMember || isAdmin) && (
          <>
            <div style={{ display: "flex", gap: 8, margin: "24px 0 16px", borderBottom: "1px solid #333", paddingBottom: 8 }}>
              {tabs.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: tab === t ? "bold" : "normal", background: tab === t ? "#d4af37" : "transparent", color: tab === t ? "#1a1a2e" : "#aaa", textTransform: "capitalize" }}>{t}</button>
              ))}
            </div>

            {/* FORUM TAB */}
            {tab === "forum" && (
              <div>
                <div style={{ background: "#252540", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #333" }}>
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share with your brothers..." rows={3} style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 12, resize: "vertical" }} />
                  <button onClick={createPost} style={{ background: "#d4af37", color: "#1a1a2e", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: "bold", cursor: "pointer", marginTop: 8 }}>Post</button>
                </div>
                {posts.map(p => (
                  <div key={p.id} style={{ background: "#252540", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ color: "#d4af37" }}>{p.author_name || "Member"}</strong>
                      <span style={{ color: "#888", fontSize: "0.8rem" }}>{timeAgo(p.created_at)}</span>
                    </div>
                    <p style={{ marginTop: 8, lineHeight: 1.5 }}>{p.content}</p>
                    <button onClick={() => loadReplies(p.id)} style={{ background: "transparent", border: "none", color: "#d4af37", cursor: "pointer", fontSize: "0.85rem", marginTop: 8 }}>
                      {expandedPost === p.id ? "Hide Replies" : "Replies (" + (p.reply_count || 0) + ")"}
                    </button>
                    {expandedPost === p.id && (
                      <div style={{ marginTop: 12, paddingLeft: 16, borderLeft: "2px solid #d4af37" }}>
                        {(replies[p.id] || []).map(r => (
                          <div key={r.id} style={{ marginBottom: 8 }}>
                            <strong style={{ color: "#d4af37", fontSize: "0.85rem" }}>{r.author_name}</strong>
                            <span style={{ color: "#888", fontSize: "0.75rem", marginLeft: 8 }}>{timeAgo(r.created_at)}</span>
                            <p style={{ fontSize: "0.9rem", marginTop: 2 }}>{r.content}</p>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <input value={replyText[p.id] || ""} onChange={e => setReplyText(prev => ({ ...prev, [p.id]: e.target.value }))} placeholder="Reply..." style={{ flex: 1, background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 8 }} />
                          <button onClick={() => createReply(p.id)} style={{ background: "#d4af37", color: "#1a1a2e", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>Reply</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {!posts.length && <p style={{ textAlign: "center", color: "#888" }}>No posts yet. Start the conversation!</p>}
              </div>
            )}

            {/* NEWS TAB */}
            {tab === "news" && (
              <div>
                {isAdmin && (
                  <div style={{ background: "#252540", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #333" }}>
                    <h3 style={{ margin: "0 0 12px", color: "#e0e0e0" }}>Post News or Update</h3>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      {["update", "announcement", "video"].map(t => (
                        <button key={t} onClick={() => setNewsType(t)} style={{ padding: "6px 14px", borderRadius: 16, border: "none", cursor: "pointer", background: newsType === t ? typeColor(t) : "#333", color: newsType === t ? "#fff" : "#aaa", textTransform: "capitalize", fontSize: "0.85rem" }}>{t}</button>
                      ))}
                    </div>
                    <input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Title" style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 10, marginBottom: 8 }} />
                    <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} placeholder="Write your news or update..." rows={3} style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 10, resize: "vertical", marginBottom: 8 }} />
                    <input value={newsYouTube} onChange={e => setNewsYouTube(e.target.value)} placeholder="YouTube URL (optional)" style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #555", borderRadius: 8, padding: 10, marginBottom: 8 }} />
                    <button onClick={createNews} disabled={postingNews} style={{ background: "#d4af37", color: "#1a1a2e", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>{postingNews ? "Posting..." : "Publish"}</button>
                  </div>
                )}
                {news.map(n => (
                  <div key={n.id} style={{ background: "#252540", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{typeIcon(n.news_type)}</span>
                        <span style={{ background: typeColor(n.news_type), color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem" }}>{n.news_type}</span>
                      </div>
                      {isAdmin && <button onClick={() => deleteNews(n.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.85rem" }}>Delete</button>}
                    </div>
                    <h3 style={{ margin: "8px 0 4px", color: "#e0e0e0" }}>{n.title}</h3>
                    <p style={{ color: "#888", fontSize: "0.8rem" }}>by {n.author_name || "Administrator"} \u00B7 {timeAgo(n.created_at)}</p>
                    <p style={{ marginTop: 8, lineHeight: 1.6 }}>{n.content}</p>
                    {getYouTubeId(n.youtube_url) && (
                      <div style={{ marginTop: 12, borderRadius: 8, overflow: "hidden" }}>
                        <iframe width="100%" height="315" src={"https://www.youtube.com/embed/" + getYouTubeId(n.youtube_url)} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      </div>
                    )}
                  </div>
                ))}
                {!news.length && <p style={{ textAlign: "center", color: "#888" }}>No news yet. {isAdmin ? "Post the first update above!" : "Check back soon!"}</p>}
              </div>
            )}

            {/* VIDEOS TAB */}
            {tab === "videos" && (
              <div>
                <div style={{ background: "#252540", borderRadius: 12, padding: 20, marginBottom: 20, border: "1px solid #333" }}>
                  <h3 style={{ margin: "0 0 12px", color: "#e0e0e0" }}>\uD83C\uDFAC Share a Video</h3>
                  <input value={vidTitle} onChange={e => setVidTitle(e.target.value)} placeholder="Video title" style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 10, marginBottom: 8 }} />
                  <input value={vidDesc} onChange={e => setVidDesc(e.target.value)} placeholder="Description (optional)" style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #444", borderRadius: 8, padding: 10, marginBottom: 8 }} />
                  <input value={vidUrl} onChange={e => setVidUrl(e.target.value)} placeholder="YouTube URL" style={{ width: "100%", background: "#1a1a2e", color: "#e0e0e0", border: "1px solid #555", borderRadius: 8, padding: 10, marginBottom: 8 }} />
                  <button onClick={createVideo} disabled={postingVid} style={{ background: "#a78bfa", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 8, fontWeight: "bold", cursor: "pointer" }}>{postingVid ? "Sharing..." : "Share Video"}</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {videos.map(v => (
                    <div key={v.id} style={{ background: "#252540", borderRadius: 12, overflow: "hidden", border: "1px solid #333" }}>
                      {getYouTubeId(v.youtube_url) && (
                        <iframe width="100%" height="180" src={"https://www.youtube.com/embed/" + getYouTubeId(v.youtube_url)} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                      )}
                      <div style={{ padding: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <h4 style={{ margin: 0, color: "#e0e0e0", fontSize: "0.95rem" }}>{v.title}</h4>
                          {(isAdmin || (user && v.user_id === user.userId)) && (
                            <button onClick={() => deleteVideo(v.id)} style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}>Delete</button>
                          )}
                        </div>
                        {v.description && <p style={{ color: "#aaa", fontSize: "0.85rem", marginTop: 4 }}>{v.description}</p>}
                        <p style={{ color: "#888", fontSize: "0.75rem", marginTop: 4 }}>by {v.poster_name || "Administrator"} \u00B7 {timeAgo(v.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {!videos.length && <p style={{ textAlign: "center", color: "#888", marginTop: 20 }}>No videos shared yet. Be the first to share one!</p>}
              </div>
            )}

            {/* DIRECTORY TAB */}
            {tab === "directory" && (
              <div>
                <h3 style={{ color: "#d4af37" }}>Members ({members.length})</h3>
                {members.map((m, i) => (
                  <div key={i} style={{ background: "#252540", borderRadius: 12, padding: 12, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, border: "1px solid #333" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#d4af37", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a2e", fontWeight: "bold" }}>{(m.name || "?")[0]}</div>
                    <div>
                      <strong style={{ color: "#e0e0e0" }}>{m.name}</strong>
                      {m.country && <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>{m.country}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
