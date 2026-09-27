"use client";
import { useEffect } from "react";

export default function Landing() {
  useEffect(() => {
    document.title = "Restaurant Competitor Intel — Know What Your Competitors Are Doing";
    
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080810; color: #fff; font-family: 'Syne', sans-serif; overflow-x: hidden; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <div style={{ background: "#080810", minHeight: "100vh", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, padding: 40, textAlign: "center" }}>
      <div style={{ fontFamily: "sans-serif", fontSize: 48, fontWeight: 900, lineHeight: 1 }}>
        <span style={{ color: "#FF6B00" }}>RESTAURANT </span>
        <span style={{ color: "#FF2D55" }}>COMPETITOR </span>
        <span style={{ color: "#00B0FF" }}>INTEL</span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 500, fontSize: 18, lineHeight: 1.6 }}>
        Know exactly what your competitors are doing on all major delivery platforms.
      </p>
      <a href="https://onlinedeliverybooster.com/restaurant-competitor-intel/" target="_blank"
        style={{ padding: "16px 36px", background: "linear-gradient(135deg, #FF6B00, #FF2D55)", color: "#fff", borderRadius: 100, fontSize: 16, fontWeight: 800, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        🚀 Try It Free — Enter Your Address
      </a>
    </div>
  );
}
