"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [tab, setTab] = useState("forum");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [replies, setReplies] = useState({});
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const loadGroup = async () => {
    const res = await fetch("/api/groups/" + params.id);
    const data = await res.json();
    if (data.error) return router.push("/groups");
    setGroup(data.group);
    setMembers(data.members);
    setIsMember(data.isMember);
  };

  const loadPosts = async () => {
    const res = await fetch("/api/posts?groupId=" + params.id);
    const data = await res.json();
    setPosts(data.posts || []);
  };

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) return router.push("/");
      setUser(d.user);
    });
    loadGroup();
    loadPosts();
  }, []);

  const createPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setPosting(true);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: parseInt(params.id), title: newTitle, content: newContent }),
    });
    setNewTitle("");
    setNewContent("");
    setPosting(false);
    loadPosts();
  };

  const loadReplies = async (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    const res = await fetch("/api/replies?postId=" + postId);
    const data = await res.json();
    setReplies(prev => ({ ...prev, [postId]: data.replies || [] }));
  };

  const submitReply = async (postId) => {
    if (!replyText.trim()) return;
    setReplying(true);
    await fetch("/api/replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: postId, content: replyText }),
    });
    setReplyText("");
    setReplying(false);
    const res = await fetch("/api/replies?postId=" + postId);
    const data = await res.json();
    setReplies(prev => ({ ...prev, [postId]: data.replies || [] }));
    loadPosts();
  };

  const leaveGroup = async () => {
    await fetch("/api/groups/" + params.id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });
    router.push("/groups");
  };

  const joinGroup = async () => {
    if (!group) return;
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: group.country }),
    });
    loadGroup();
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  };

  if (!user || !group) return null;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a1520 50%, #0a0a0f 100%)" }}>
      <Nav user={user} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <button onClick={() => router.push("/groups")}
              className="text-gray-500 text-sm mb-2 cursor-pointer bg-transparent border-none hover:text-gold transition-all">
              ← All Groups
            </button>
            <h1 className="text-3xl font-display font-black text-gold">{group.name}</h1>
            <p className="text-gray-400 mt-1">{group.description}</p>
            <p className="text-gray-500 text-sm mt-2">{members.length} member{members.length !== 1 ? "s" : ""}</p>
          </div>
          {isMember ? (
            <button onClick={leaveGroup}
              className="px-4 py-2 text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg cursor-pointer hover:bg-red-400/20 transition-all">
              Leave Group
            </button>
          ) : (
            <button onClick={joinGroup}
              className="px-5 py-2 text-sm font-semibold text-black bg-gold border-none rounded-lg cursor-pointer hover:bg-gold/80 transition-all">
              Join Group
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/5 pb-1">
          {["forum", "directory"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg cursor-pointer border-none transition-all ${
                tab === t ? "text-gold bg-gold/10 border-b-2 border-gold" : "text-gray-500 bg-transparent hover:text-gray-300"
              }`}>
              {t === "forum" ? "Forum" : "Directory"}
            </button>
          ))}
        </div>

        {/* Forum Tab */}
        {tab === "forum" && (
          <div>
            {isMember && (
              <div className="p-5 rounded-2xl border border-white/10 mb-8" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h3 className="text-white font-bold mb-3">Start a Discussion</h3>
                <input type="text" placeholder="Title" value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 mb-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/40 focus:outline-none" />
                <textarea placeholder="Share your thoughts..." value={newContent}
                  onChange={e => setNewContent(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 mb-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/40 focus:outline-none resize-none" />
                <button onClick={createPost} disabled={posting || !newTitle.trim() || !newContent.trim()}
                  className="px-5 py-2 text-sm font-semibold text-black bg-gold border-none rounded-lg cursor-pointer hover:bg-gold/80 transition-all disabled:opacity-50">
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No discussions yet. Be the first to start one!</p>
            ) : (
              <div className="space-y-4">
                {posts.map(p => (
                  <div key={p.id} className="p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-bold">{p.title}</h3>
                        <p className="text-gray-500 text-xs mt-1">by {p.author_name} · {timeAgo(p.created_at)}</p>
                      </div>
                      <button onClick={() => loadReplies(p.id)}
                        className="text-gray-400 text-xs bg-transparent border border-white/10 px-3 py-1 rounded-lg cursor-pointer hover:text-gold hover:border-gold/20 transition-all">
                        {p.reply_count} {p.reply_count === 1 ? "reply" : "replies"}
                      </button>
                    </div>
                    <p className="text-gray-300 mt-3 text-sm leading-relaxed">{p.content}</p>

                    {expandedPost === p.id && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        {(replies[p.id] || []).map(r => (
                          <div key={r.id} className="mb-3 pl-4 border-l-2 border-gold/20">
                            <p className="text-gray-300 text-sm">{r.content}</p>
                            <p className="text-gray-500 text-xs mt-1">{r.author_name} · {timeAgo(r.created_at)}</p>
                          </div>
                        ))}
                        {isMember && (
                          <div className="flex gap-2 mt-3">
                            <input type="text" placeholder="Write a reply..." value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              onKeyDown={e => e.key === "Enter" && submitReply(p.id)}
                              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:border-gold/40 focus:outline-none" />
                            <button onClick={() => submitReply(p.id)} disabled={replying}
                              className="px-4 py-2 text-xs font-semibold text-black bg-gold border-none rounded-lg cursor-pointer hover:bg-gold/80 disabled:opacity-50">
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Directory Tab */}
        {tab === "directory" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgba(212,175,55,0.15)", color: "#d4af37" }}>
                    {m.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-white font-medium">{m.name}</p>
                    <p className="text-gray-500 text-xs">{group.country} · Joined {timeAgo(m.joined_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
