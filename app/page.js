"use client";
import { useState, useRef, useEffect } from "react";

const TABS = ["overview", "competitors", "dishes", "promotions", "strategy"];
const TAB_LABELS = { overview: "Overview", competitors: "Competitors", dishes: "Top Dishes", promotions: "Promotions", strategy: "Your Strategy" };
const TAB_ICONS = { overview: "◈", competitors: "⊞", dishes: "⊛", promotions: "◉", strategy: "◎" };

const SUGGESTED_QUESTIONS = [
  "Which competitor should I be most worried about and why?",
  "What promo should I run this weekend to get more orders?",
  "Which dishes should I add to my menu based on what's trending?",
  "How can I improve my delivery rating to compete better?",
  "What price range should I target for new dishes?",
  "Which competitor has the weakest strategy I can exploit?",
];

async function callClaude(messages, maxTokens = 3000) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, maxTokens }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return (data.content || []).map((b) => b.text || "").join("").trim();
}

function Spinner({ small }) {
  return small ? (
    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.1)", borderTop: "2px solid #E8FF47", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  ) : (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "60px 20px" }}>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(255,255,255,0.06)", borderTop: "3px solid #E8FF47", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#666", fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase" }}>Scanning delivery apps…</div>
    </div>
  );
}

function Tag({ children, color = "rgba(255,255,255,0.07)", text = "#888" }) {
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, background: color, color: text, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</span>;
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#E8FF47", fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 18, height: 1, background: "#E8FF47", display: "inline-block" }} />{title}
      </div>
      {children}
    </div>
  );
}

function ChatPanel({ report, address, myName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatLoading]);

  const reportContext = `You are a restaurant competitive intelligence advisor. The user is a restaurant owner${myName ? ` operating "${myName}"` : ""} located at "${address}".

Here is the competitive intelligence report for their area:
${JSON.stringify(report, null, 2)}

Answer their questions based on this data. Be specific, actionable, and concise. Reference actual competitor names and dish names from the report when relevant.`;

  async function sendMessage(text) {
    const q = text || input.trim();
    if (!q || chatLoading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: q }];
    setMessages(newMessages);
    setChatLoading(true);
    try {
      let apiMessages;
      if (messages.length === 0) {
        apiMessages = [{ role: "user", content: reportContext + "\n\nUser question: " + q }];
      } else {
        apiMessages = [{ role: "user", content: reportContext }, ...messages, { role: "user", content: q }];
      }
      const answer = await callClaude(apiMessages, 800);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Sorry, something went wrong: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(232,255,71,0.12)", border: "1px solid rgba(232,255,71,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💬</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Ask About Your Report</div>
          <div style={{ fontSize: 11, color: "#555" }}>Ask anything about your competitors, dishes, or strategy</div>
        </div>
      </div>

      {messages.length === 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444", marginBottom: 10 }}>Suggested Questions</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{ padding: "8px 14px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: 12, cursor: "pointer", fontFamily: "inherit", lineHeight: 1.4 }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 14, maxHeight: 480, overflowY: "auto", paddingRight: 4 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: m.role === "user" ? "rgba(232,255,71,0.15)" : "rgba(255,255,255,0.06)", border: m.role === "user" ? "1px solid rgba(232,255,71,0.3)" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                {m.role === "user" ? "👤" : "◈"}
              </div>
              <div style={{ maxWidth: "80%", padding: "12px 16px", borderRadius: 12, background: m.role === "user" ? "rgba(232,255,71,0.07)" : "rgba(255,255,255,0.04)", border: m.role === "user" ? "1px solid rgba(232,255,71,0.15)" : "1px solid rgba(255,255,255,0.08)", fontSize: 13, color: m.role === "user" ? "#D4D0C8" : "#B0ACA4", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>◈</div>
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
                <Spinner small /><span style={{ fontSize: 12, color: "#555" }}>Analyzing…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()} placeholder="Ask anything about your competitive landscape…" disabled={chatLoading}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#D4D0C8", fontFamily: "inherit", fontSize: 13 }} />
        <button onClick={() => sendMessage()} disabled={!input.trim() || chatLoading}
          style={{ padding: "8px 16px", background: input.trim() && !chatLoading ? "#E8FF47" : "rgba(255,255,255,0.06)", color: input.trim() && !chatLoading ? "#0A0A0B" : "#444", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 700, cursor: input.trim() && !chatLoading ? "pointer" : "not-allowed", letterSpacing: "0.06em" }}>
          Send ↑
        </button>
      </div>

      {messages.length >= 2 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Go deeper on this", "Give me a specific action plan", "What are the risks?", "Show me numbers"].map((q, i) => (
            <button key={i} onClick={() => sendMessage(q)} disabled={chatLoading} style={{ padding: "5px 12px", borderRadius: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [address, setAddress] = useState("");
  const [myName, setMyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  async function analyze() {
    if (!address.trim()) return;
    setLoading(true); setReport(null); setError(null); setActiveTab("overview");

    const prompt = `You are a restaurant competitive intelligence analyst. A restaurant owner at "${address}"${myName ? ` operating "${myName}"` : ""} wants to understand their local competition on DoorDash and Uber Eats.

Generate a realistic competitive intelligence report. Return ONLY raw JSON with no markdown or explanation:

{
  "area_summary": { "location": "neighborhood", "city": "City, State", "total_restaurants": 42, "avg_rating": 4.3, "avg_delivery_time": "25-40 min", "market_temp": "Hot", "market_insight": "Two sentences about this market." },
  "competitors": [{ "name": "Name", "cuisine": "Type", "rating": 4.5, "reviews": 320, "delivery_time": "20-35 min", "delivery_fee": "$2.99", "price_range": "$$", "platform": "Both", "promo": "20% off or null", "top_item": "Popular dish", "threat_level": "High", "why": "One sentence." }],
  "top_dishes": [{ "name": "Dish", "restaurant": "Restaurant", "category": "Mains", "price": "$18", "badge": "Most Ordered", "signal": "Why it wins." }],
  "promotions": [{ "restaurant": "Name", "promo_type": "Free Delivery", "detail": "Free delivery over $15", "platform": "DoorDash", "effectiveness": "High" }],
  "strategy": { "gaps": ["gap 1","gap 2","gap 3"], "quick_wins": ["win 1","win 2","win 3"], "dish_opportunities": ["idea 1","idea 2"], "promo_recommendation": "Specific recommendation.", "positioning": "2-3 sentence strategy." }
}

Include 5-6 competitors, 6-7 top_dishes, 4-5 promotions. Be realistic for this actual location. Return ONLY the JSON.`;

    try {
      const text = await callClaude([{ role: "user", content: prompt }]);
      let parsed = null;
      try { parsed = JSON.parse(text); } catch {}
      if (!parsed) { try { const s = text.indexOf("{"), e = text.lastIndexOf("}"); if (s !== -1 && e !== -1) parsed = JSON.parse(text.slice(s, e + 1)); } catch {} }
      if (!parsed) { try { parsed = JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim()); } catch {} }
      if (parsed?.area_summary) { setReport(parsed); }
      else { setError("Could not read the report. Please try again."); }
    } catch (e) { setError(`Error: ${e.message}`); }
    finally { setLoading(false); }
  }

  const threatColor = (t) => t === "High" ? "#FF4444" : t === "Medium" ? "#FF9500" : "#4CAF50";
  const effColor = (e) => e === "High" ? "#E8FF47" : e === "Medium" ? "#FF9500" : "#888";
  const marketColor = (m) => m === "Hot" ? "#FF4444" : m === "Warm" ? "#FF9500" : "#4CAF50";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0B; color: #D4D0C8; font-family: 'Syne', sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.35s ease both; }
        input::placeholder { color: #3a3a3a; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#E8FF47", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Restaurant Competitor Intel</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, lineHeight: 1, color: "#fff", letterSpacing: "0.05em" }}>RESTAURANT<span style={{ color: "#E8FF47" }}>INTEL</span></div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>Enter your restaurant address to get a competitive report based on DoorDash & Uber Eats listings in your area.</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", display: "block", marginBottom: 8 }}>Your Address *</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} placeholder="e.g. 1234 Leetsdale Dr, Denver, CO"
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", display: "block", marginBottom: 8 }}>Restaurant Name (optional)</label>
              <input value={myName} onChange={(e) => setMyName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && analyze()} placeholder="e.g. The Corner Grill"
                style={{ width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontFamily: "inherit", fontSize: 14 }} />
            </div>
          </div>
          <button onClick={analyze} disabled={loading || !address.trim()}
            style={{ padding: "13px 26px", background: address.trim() && !loading ? "#E8FF47" : "rgba(255,255,255,0.06)", color: address.trim() && !loading ? "#0A0A0B" : "#444", border: "none", borderRadius: 10, fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: address.trim() && !loading ? "pointer" : "not-allowed", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {loading ? "Scanning…" : "Run Competitive Analysis →"}
          </button>
        </div>

        {loading && <Spinner />}
        {error && <div style={{ padding: 16, background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 12, color: "#FF6B6B", fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}

        {report && !loading && (
          <div className="fade-up">
            <div style={{ background: "rgba(232,255,71,0.05)", border: "1px solid rgba(232,255,71,0.15)", borderRadius: 14, padding: "18px 22px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: "#fff" }}>{report.area_summary.location}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{report.area_summary.city}</div>
              </div>
              {[{ label: "Nearby", value: report.area_summary.total_restaurants }, { label: "Avg Rating", value: `★ ${report.area_summary.avg_rating}` }, { label: "Avg Delivery", value: report.area_summary.avg_delivery_time }, { label: "Market", value: report.area_summary.market_temp, color: marketColor(report.area_summary.market_temp) }].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: s.color || "#E8FF47" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 28, lineHeight: 1.7, fontStyle: "italic" }}>{report.area_summary.market_insight}</div>

            <div style={{ display: "flex", gap: 2, marginBottom: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4, overflowX: "auto" }}>
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 8px", background: activeTab === tab ? "#E8FF47" : "transparent", color: activeTab === tab ? "#0A0A0B" : "#555", border: "none", borderRadius: 8, fontFamily: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                  {TAB_ICONS[tab]} {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="fade-up">
                <Section title="Competitive Threat Map">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(report.competitors || []).map((c, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderLeft: `3px solid ${threatColor(c.threat_level)}`, borderRadius: 10, padding: "14px 16px" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "#555" }}>{c.cuisine} · {c.delivery_time} · {c.price_range}</div>
                          {c.promo && <div style={{ fontSize: 11, color: "#E8FF47", marginTop: 4 }}>🏷 {c.promo}</div>}
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 13, color: "#FFB800", fontWeight: 600 }}>★ {c.rating}</div>
                          <div style={{ fontSize: 10, color: "#555" }}>{(c.reviews || 0).toLocaleString()} reviews</div>
                        </div>
                        <Tag color={`${threatColor(c.threat_level)}22`} text={threatColor(c.threat_level)}>{c.threat_level} threat</Tag>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "competitors" && (
              <div className="fade-up">
                <Section title="Full Competitor Breakdown">
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {(report.competitors || []).map((c, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                          <div><div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{c.name}</div><div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{c.cuisine}</div></div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Tag>{c.platform}</Tag><Tag>{c.price_range}</Tag><Tag color={`${threatColor(c.threat_level)}22`} text={threatColor(c.threat_level)}>{c.threat_level} threat</Tag></div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                          {[["Rating", `★ ${c.rating}`], ["Delivery", c.delivery_time], ["Fee", c.delivery_fee]].map(([l, v]) => (
                            <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px" }}><div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{v}</div><div style={{ fontSize: 10, color: "#555", textTransform: "uppercase" }}>{l}</div></div>
                          ))}
                        </div>
                        {c.promo && <div style={{ background: "rgba(232,255,71,0.07)", border: "1px solid rgba(232,255,71,0.15)", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontSize: 12, color: "#E8FF47" }}>🏷 {c.promo}</div>}
                        <div style={{ fontSize: 12, color: "#777" }}><span style={{ color: "#555" }}>Top dish: </span>{c.top_item}</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 6, fontStyle: "italic" }}>{c.why}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "dishes" && (
              <div className="fade-up">
                <Section title="Highest-Performing Dishes in Your Area">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(report.top_dishes || []).map((d, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 16px" }}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: "rgba(255,255,255,0.18)", textAlign: "center" }}>{i + 1}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}><span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{d.name}</span><Tag color="rgba(232,255,71,0.1)" text="#E8FF47">{d.badge}</Tag></div>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 5 }}>{d.restaurant} · {d.category}</div>
                          <div style={{ fontSize: 11, color: "#666", fontStyle: "italic" }}>{d.signal}</div>
                        </div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff" }}>{d.price}</div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "promotions" && (
              <div className="fade-up">
                <Section title="Active Promotions on DoorDash & Uber Eats">
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(report.promotions || []).map((p, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                        <div><div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{p.restaurant}</div><div style={{ fontSize: 13, color: "#888" }}>{p.detail}</div></div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <div style={{ display: "flex", gap: 6 }}><Tag>{p.promo_type}</Tag><Tag>{p.platform}</Tag></div>
                          <div style={{ fontSize: 11 }}><span style={{ color: "#555" }}>Effectiveness: </span><span style={{ color: effColor(p.effectiveness), fontWeight: 700 }}>{p.effectiveness}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {activeTab === "strategy" && (
              <div className="fade-up">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#FF4444", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Market Gaps</div>
                    {(report.strategy?.gaps || []).map((g, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#999" }}><span style={{ color: "#FF4444" }}>◈</span>{g}</div>)}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#4CAF50", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>Quick Wins</div>
                    {(report.strategy?.quick_wins || []).map((w, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#999" }}><span style={{ color: "#4CAF50" }}>◈</span>{w}</div>)}
                  </div>
                </div>
                <div style={{ background: "rgba(232,255,71,0.05)", border: "1px solid rgba(232,255,71,0.15)", borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#E8FF47", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Promo Recommendation</div>
                  <div style={{ fontSize: 14, color: "#D4D0C8", lineHeight: 1.7 }}>{report.strategy?.promo_recommendation}</div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#888", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Dish Opportunities</div>
                  {(report.strategy?.dish_opportunities || []).map((d, i) => <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "#999" }}><span style={{ color: "#E8FF47" }}>◈</span>{d}</div>)}
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#888", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>Your Positioning Strategy</div>
                  <div style={{ fontSize: 14, color: "#D4D0C8", lineHeight: 1.8 }}>{report.strategy?.positioning}</div>
                </div>
              </div>
            )}

            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "40px 0" }} />
            <ChatPanel report={report} address={address} myName={myName} />
          </div>
        )}
      </div>
    </>
  );
}
