"use client";
import { useRouter, usePathname } from "next/navigation";

export default function Nav({ user }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const link = (href, label) => (
    <button
      onClick={() => router.push(href)}
      className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer border-none whitespace-nowrap ${
        pathname === href
          ? "text-gold bg-gold/10"
          : "text-gray-400 bg-transparent hover:text-gold hover:bg-gold/5"
      }`}
    >
      {label}
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 px-6"
      style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 gap-3">
        <div
          className="font-display font-black text-lg text-gold cursor-pointer whitespace-nowrap"
          onClick={() => router.push("/dashboard")}
        >
          ð¤ Brotherhood Connect
        </div>
        <div className="hidden md:flex gap-1">
          {link("/dashboard", "Pillars")}
          {link("/framework", "CONNECT")}
          {link("/about", "About")}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-gray-500 max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
            {user?.name?.split(" ")[0] || ""}
          </span>
          {user?.role === "admin" && (
            <button onClick={() => router.push("/admin")}
              className="px-3 py-1.5 text-xs font-semibold text-gold bg-transparent border border-gold/20 rounded-lg cursor-pointer hover:bg-gold/10 transition-all">
              Admin
            </button>
          )}
          <button onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white/[0.03] border border-white/[0.06] rounded-lg cursor-pointer hover:text-gray-300 hover:border-white/15 transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
