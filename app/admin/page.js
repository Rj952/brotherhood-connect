"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pending");
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (!data.user || data.user.role !== "admin") { router.push("/"); return; }
      setUser(data.user);
      setLoading(false);
    }).catch(() => router.push("/"));
  }, [router]);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (data.users) setUsers(data.users);
  }, []);

  const loadCodes = useCallback(async () => {
    const res = await fetch("/api/admin/codes");
    const data = await res.json();
    if (data.codes) setCodes(data.codes);
  }, []);

  useEffect(() => {
    if (!loading) { loadUsers(); loadCodes(); }
  }, [loading, loadUsers, loadCodes]);

  const updateStatus = async (userId, status) => {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    loadUsers();
  };

  const generateCode = async () => {
    await fetch("/api/admin/codes", { method: "POST" });
    loadCodes();
  };

  const deleteCode = async (code) => {
    await fetch("/api/admin/codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    loadCodes();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

  const filtered = tab === "codes" ? [] : users.filter(u => {
    if (tab === "all") return true;
    return u.status === tab;
  });
  const pendingCount = users.filter(u => u.status === "pending").length;

  return (
    <div className="min-h-screen relative">
      <Nav user={user} />
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 relative z-10">
        <h1 className="font-display text-3xl font-black text-gold mb-2">Admin Dashboard</h1>
        <p className="text-base text-gray-400 mb-8">Manage member registrations, invite codes, and community access.</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {["pending", "approved", "denied", "all", "codes"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-lg cursor-pointer border transition-all ${
                tab === t ? "text-gold bg-gold/10 border-gold/20" : "text-gray-400 bg-card border-white/5 hover:border-white/10"
              }`}>
              {t === "codes" ? "Invite Codes" : t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 bg-gold text-deep rounded-full text-xs font-bold">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Users list */}
        {tab !== "codes" && (
          <>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-500">No {tab === "all" ? "" : tab + " "}registrations found.</div>
            )}
            {filtered.map(u => (
              <div key={u.id} className="flex items-start justify-between p-5 card-base rounded-xl mb-3 gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold text-sm">
                    {u.name}{" "}
                    <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                      u.status === "pending" ? "bg-gold/15 text-gold"
                      : u.status === "approved" ? "bg-green-900/30 text-green-300"
                      : "bg-red-900/30 text-red-300"
                    }`}>{u.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                  <div className="text-[11px] text-gray-600 mt-1">
                    Registered: {new Date(u.created_at).toLocaleDateString()} â¢ Ref: {u.invited_by}
                    {u.reason && <><br />Reason: &quot;{u.reason}&quot;</>}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {u.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(u.id, "approved")}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-green-900/20 text-green-300 border border-green-800/20 hover:bg-green-700 hover:text-white transition-all">
                        â Approve
                      </button>
                      <button onClick={() => updateStatus(u.id, "denied")}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-red-900/20 text-red-300 border border-red-800/20 hover:bg-red-600 hover:text-white transition-all">
                        â Deny
                      </button>
                    </>
                  )}
                  {u.status === "approved" && (
                    <button onClick={() => updateStatus(u.id, "denied")}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-red-900/20 text-red-300 border border-red-800/20 hover:bg-red-600 hover:text-white transition-all">
                      Revoke
                    </button>
                  )}
                  {u.status === "denied" && (
                    <button onClick={() => updateStatus(u.id, "approved")}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-green-900/20 text-green-300 border border-green-800/20 hover:bg-green-700 hover:text-white transition-all">
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Invite Codes */}
        {tab === "codes" && (
          <>
            <button onClick={generateCode}
              className="px-6 py-2.5 text-sm font-bold rounded-lg cursor-pointer mb-5 border-none transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #D4A843, #C09430)", color: "#0A0A0F" }}>
              + Generate New Invite Code
            </button>
            {codes.length === 0 && (
              <div className="text-center py-10 text-gray-500">No invite codes generated yet.</div>
            )}
            {codes.map(c => (
              <div key={c.code} className="flex items-center justify-between p-4 card-base rounded-xl mb-3 gap-4 flex-wrap">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-elevated rounded-lg font-mono text-sm text-gold border border-gold/10">
                    {c.code}
                  </div>
                  <div className="text-[11px] text-gray-600 mt-1.5">
                    Created: {new Date(c.created_at).toLocaleDateString()}
                    {c.used
                      ? <span className="text-green-400 ml-2">â¢ Used by {c.used_by}</span>
                      : <span className="text-gold ml-2">â¢ Available</span>
                    }
                  </div>
                </div>
                <button onClick={() => deleteCode(c.code)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer bg-red-900/20 text-red-300 border border-red-800/20 hover:bg-red-600 hover:text-white transition-all">
                  Delete
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
