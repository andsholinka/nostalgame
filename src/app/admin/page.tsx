"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type GameRequest = {
  id: string;
  gameName: string;
  reason: string | null;
  userName: string | null;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests?status=${filter}`);
      const data = await res.json();
      setRequests(data);
    } catch {
      console.error("Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, filter, fetchRequests]);

  useEffect(() => {
    // Check if notifications are already enabled
    if ("Notification" in window && Notification.permission === "granted") {
      setNotifEnabled(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("admin-token", password);
      } else {
        setAuthError("Password salah!");
      }
    } catch {
      setAuthError("Gagal login");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("admin-token");
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch {
      console.error("Failed to update");
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Hapus request ini?")) return;
    const token = localStorage.getItem("admin-token");
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchRequests();
      }
    } catch {
      console.error("Failed to delete");
    }
  };

  const enableNotifications = async () => {
    try {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        setNotifStatus("❌ Browser tidak support notifikasi");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setNotifStatus("❌ Service Worker tidak tersedia");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotifStatus("❌ Notifikasi ditolak. Cek pengaturan browser.");
        return;
      }

      // Wait for service worker to be ready
      setNotifStatus("⏳ Menunggu service worker...");
      const registration = await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey || vapidKey === "placeholder") {
        setNotifStatus("❌ VAPID key belum dikonfigurasi di server");
        return;
      }

      setNotifStatus("⏳ Subscribing...");

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const token = localStorage.getItem("admin-token");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          isAdmin: true,
          adminPassword: token,
        }),
      });

      if (res.ok) {
        setNotifEnabled(true);
        setNotifStatus("✅ Notifikasi aktif!");
      } else {
        const data = await res.json();
        setNotifStatus(`❌ Gagal: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Notification error:", err);
      setNotifStatus(`❌ Error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-[#ffe600] border-[#ffe600]/30";
      case "approved": return "text-[#39ff14] border-[#39ff14]/30";
      case "rejected": return "text-[#ff4444] border-[#ff4444]/30";
      case "done": return "text-[#00f3ff] border-[#00f3ff]/30";
      default: return "text-[#666] border-[#666]/30";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="game-card p-8">
          <div className="h-[2px] w-full bg-gradient-to-r from-[#bf5af2] to-transparent mb-6"></div>
          <h1 className="pixel-font text-sm neon-purple mb-6 text-center">🔐 ADMIN LOGIN</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full bg-[#0c0c1d] border-2 border-[#2a2a4a] px-4 py-3 font-mono text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#bf5af2] transition-colors"
              autoFocus
            />
            {authError && <p className="pixel-font text-[0.45rem] text-[#ff4444]">{authError}</p>}
            <button type="submit" className="btn-primary w-full">LOGIN</button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8 flex-wrap">
        <Link href="/" className="btn-secondary">← HOME</Link>
        <h1 className="pixel-font text-sm neon-purple">📋 ADMIN DASHBOARD</h1>
        <div className="ml-auto flex gap-3 items-center">
          {!notifEnabled ? (
            <button onClick={enableNotifications} className="btn-secondary text-[0.5rem]">
              🔔 AKTIFKAN NOTIF
            </button>
          ) : (
            <span className="pixel-font text-[0.4rem] text-[#39ff14]">🔔 NOTIF ON</span>
          )}
        </div>
      </div>

      {notifStatus && (
        <p className="font-mono text-xs text-[#888] mb-4">{notifStatus}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="game-card p-4 text-center">
          <p className="pixel-font text-lg neon-yellow">{requests.filter(r => r.status === "pending").length}</p>
          <p className="font-mono text-[0.6rem] text-[#555] mt-1">PENDING</p>
        </div>
        <div className="game-card p-4 text-center">
          <p className="pixel-font text-lg neon-green">{requests.filter(r => r.status === "approved").length}</p>
          <p className="font-mono text-[0.6rem] text-[#555] mt-1">APPROVED</p>
        </div>
        <div className="game-card p-4 text-center">
          <p className="pixel-font text-lg neon-cyan">{requests.filter(r => r.status === "done").length}</p>
          <p className="font-mono text-[0.6rem] text-[#555] mt-1">DONE</p>
        </div>
        <div className="game-card p-4 text-center">
          <p className="pixel-font text-lg text-[#888]">{requests.length}</p>
          <p className="font-mono text-[0.6rem] text-[#555] mt-1">TOTAL</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`pixel-font text-[0.4rem] px-3 py-2 border uppercase transition-all ${
              filter === f
                ? "border-[#bf5af2] text-[#bf5af2] bg-[#bf5af2]/10"
                : "border-[#2a2a4a] text-[#666] hover:border-[#555]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <p className="font-mono text-sm text-[#555] text-center py-8">Loading...</p>
      ) : requests.length === 0 ? (
        <div className="game-card p-8 text-center">
          <p className="font-mono text-sm text-[#555]">Belum ada request.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="game-card p-4 lg:p-5">
              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="pixel-font text-[0.6rem] text-white truncate">{req.gameName}</h3>
                    <span className={`pixel-font text-[0.35rem] px-2 py-0.5 border uppercase ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  {req.reason && (
                    <p className="font-mono text-[0.65rem] text-[#777] mt-1 line-clamp-2">{req.reason}</p>
                  )}
                  <div className="flex gap-4 mt-2 font-mono text-[0.55rem] text-[#555]">
                    <span>👤 {req.userName || "Anonymous"}</span>
                    <span>📅 {formatDate(req.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  {req.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(req.id, "approved")}
                        className="pixel-font text-[0.35rem] px-2 py-1.5 border border-[#39ff14]/30 text-[#39ff14] hover:bg-[#39ff14]/10 transition-colors"
                      >
                        ✓ APPROVE
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, "rejected")}
                        className="pixel-font text-[0.35rem] px-2 py-1.5 border border-[#ff4444]/30 text-[#ff4444] hover:bg-[#ff4444]/10 transition-colors"
                      >
                        ✗ REJECT
                      </button>
                    </>
                  )}
                  {req.status === "approved" && (
                    <button
                      onClick={() => updateStatus(req.id, "done")}
                      className="pixel-font text-[0.35rem] px-2 py-1.5 border border-[#00f3ff]/30 text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors"
                    >
                      ✓ DONE
                    </button>
                  )}
                  <button
                    onClick={() => deleteRequest(req.id)}
                    className="pixel-font text-[0.35rem] px-2 py-1.5 border border-[#555]/30 text-[#555] hover:text-[#ff4444] hover:border-[#ff4444]/30 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
