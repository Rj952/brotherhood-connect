"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/Footer";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bahamas","Bangladesh",
  "Barbados","Belgium","Belize","Benin","Bolivia","Botswana","Brazil","Cameroon","Canada",
  "Chile","China","Colombia","Costa Rica","Cuba","Denmark","Dominican Republic","Ecuador",
  "Egypt","El Salvador","Ethiopia","Fiji","Finland","France","Germany","Ghana","Greece",
  "Grenada","Guatemala","Guyana","Haiti","Honduras","India","Indonesia","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kenya","South Korea","Lebanon","Liberia","Malaysia",
  "Mexico","Morocco","Mozambique","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria",
  "Norway","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Puerto Rico","Romania","Rwanda","Saudi Arabia","Senegal","Sierra Leone",
  "Singapore","South Africa","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Tanzania","Thailand","Trinidad and Tobago","Turkey","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uruguay","Venezuela","Vietnam",
  "Zambia","Zimbabwe"
];

export default function GroupsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [joining, setJoining] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) return router.push("/");
      setUser(d.user);
    });
    fetch("/api/groups").then(r => r.json()).then(d => {
      setGroups(d.groups || []);
      setLoading(false);
    });
  }, []);

  const filtered = COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const joinGroup = async (country) => {
    setJoining(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country }),
    });
    const data = await res.json();
    if (data.group) {
      router.push("/groups/" + data.group.id);
    }
    setJoining(false);
  };

  const existingGroup = (country) => groups.find(g => g.country === country);

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a1520 50%, #0a0a0f 100%)" }}>
      <Nav user={user} />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-black text-gold mb-3">
            Brotherhood Groups
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Connect with brothers around the world. Join your country\u2019s group to access the forum and member directory.
          </p>
        </div>

        {/* My Groups */}
        {groups.filter(g => g.is_member).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">My Groups</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.filter(g => g.is_member).map(g => (
                <div key={g.id}
                  onClick={() => router.push("/groups/" + g.id)}
                  className="p-5 rounded-2xl border border-gold/20 cursor-pointer hover:border-gold/40 transition-all"
                  style={{ background: "rgba(212,175,55,0.05)" }}>
                  <h3 className="text-gold font-bold text-lg">{g.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{g.member_count} member{g.member_count !== 1 ? "s" : ""}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                    Joined
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search & Join */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Find Your Country</h2>
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-gold/40 focus:outline-none transition-all"
          />
        </div>

        {loading ? (
          <p className="text-gray-500">Loading groups...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(country => {
              const g = existingGroup(country);
              return (
                <div key={country}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-gold/20 transition-all"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div>
                    <span className="text-white font-medium">{country}</span>
                    {g && (
                      <span className="text-gray-500 text-xs ml-2">
                        {g.member_count} member{g.member_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {g?.is_member ? (
                    <button
                      onClick={() => router.push("/groups/" + g.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-gold bg-gold/10 border border-gold/20 rounded-lg cursor-pointer hover:bg-gold/20 transition-all">
                      View
                    </button>
                  ) : (
                    <button
                      onClick={() => joinGroup(country)}
                      disabled={joining}
                      className="px-4 py-1.5 text-xs font-semibold text-black bg-gold border-none rounded-lg cursor-pointer hover:bg-gold/80 transition-all disabled:opacity-50">
                      {joining ? "..." : "Join"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
