import { useState, useEffect, useRef } from "react";

// ─── Simulated Web3 / IPFS / Contract Layer ───────────────────────────────────
const MOCK_PROFILES = [
  {
    id: "0xA1b2",
    tokenId: "#0042",
    name: "Aria Chen",
    age: 27,
    bio: "Solidity dev by day, stargazer by night. Looking for someone to explore the infinite with.",
    interests: ["DeFi", "Astrophysics", "Ceramics", "Jazz"],
    stakeRequired: "0.01",
    verified: true,
    avatar: "AC",
    gradient: "from-violet-500 to-fuchsia-500",
    bg: "#1a0a2e",
    compatibility: 94,
    distance: "2.4km",
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    online: true,
  },
  {
    id: "0xC3d4",
    tokenId: "#0087",
    name: "Marcus Wei",
    age: 29,
    bio: "Building zero-knowledge proofs and organic gardens. duality is the key to existence.",
    interests: ["ZK Proofs", "Permaculture", "Cooking", "Philosophy"],
    stakeRequired: "0.015",
    verified: true,
    avatar: "MW",
    gradient: "from-emerald-400 to-teal-600",
    bg: "#021a12",
    compatibility: 88,
    distance: "4.1km",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    online: true,
  },
  {
    id: "0xE5f6",
    tokenId: "#0113",
    name: "Zara Okafor",
    age: 25,
    bio: "NFT artist and trail runner. My portfolio lives on-chain, my heart is still looking.",
    interests: ["Generative Art", "Trail Running", "Afrobeats", "Web3"],
    stakeRequired: "0.012",
    verified: true,
    avatar: "ZO",
    gradient: "from-amber-400 to-orange-600",
    bg: "#1a0e00",
    compatibility: 91,
    distance: "1.7km",
    ipfsHash: "QmZfmRZHuawJDtgfHh1GhqzKjvDZDiPVxNMRZr5ZoXgEzU",
    online: false,
  },
  {
    id: "0xG7h8",
    tokenId: "#0156",
    name: "Liam Nakamura",
    age: 31,
    bio: "DAO contributor, amateur sommelier, and dog dad. Trustless in finance, trustful in love.",
    interests: ["Governance", "Wine", "Hiking", "Piano"],
    stakeRequired: "0.02",
    verified: true,
    avatar: "LN",
    gradient: "from-rose-400 to-pink-600",
    bg: "#1a0010",
    compatibility: 82,
    distance: "6.3km",
    ipfsHash: "QmSoLSafTMBsPKadTEgaXksvagr86Nkd74W1Jecks5PM",
    online: true,
  },
];

const MOCK_MATCHES = [
  {
    id: "match-001",
    profile: MOCK_PROFILES[0],
    matchedAt: "2h ago",
    pooledEth: "0.02",
    status: "active",
    messages: 12,
  },
];

// ─── Particle Background ──────────────────────────────────────────────────────
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168,85,247,${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ─── Wallet Connect Screen ────────────────────────────────────────────────────
function ConnectWallet({ onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState(0);
  const steps = ["Detecting wallet...", "Requesting access...", "Verifying identity...", "Connected!"];

  const handleConnect = () => {
    setConnecting(true);
    let i = 0;
    const interval = setInterval(() => {
      setStep(++i);
      if (i >= steps.length - 1) {
        clearInterval(interval);
        setTimeout(() => onConnect("0x71C...93Fa"), 700);
      }
    }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
      {/* Logo */}
      <div style={{ marginBottom: "3rem", textAlign: "center" }}>
        <div style={{ fontSize: "3.5rem", fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 300, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #e879f9, #a855f7, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>
          SoulMatch
        </div>
        <div style={{ color: "#6b7280", fontSize: "0.85rem", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: "0.5rem", fontFamily: "monospace" }}>
          Decentralized · Verified · Trustless
        </div>
      </div>

      {/* Main Card */}
      <div style={{ background: "rgba(15,10,25,0.85)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "1.5rem", padding: "2.5rem", maxWidth: "420px", width: "100%", backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(168,85,247,0.1)" }}>
        {/* NFT Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "0.75rem", padding: "0.75rem 1rem", marginBottom: "2rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>⛓</div>
          <div>
            <div style={{ color: "#e2e8f0", fontSize: "0.8rem", fontWeight: 600, fontFamily: "monospace" }}>Soulbound NFT Identity</div>
            <div style={{ color: "#6b7280", fontSize: "0.72rem", marginTop: "0.1rem" }}>Non-transferable · Verified on-chain</div>
          </div>
        </div>

        <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.6rem", fontWeight: 400, marginBottom: "0.5rem" }}>Begin your journey</h2>
        <p style={{ color: "#64748b", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Connect your wallet to mint your Soulbound NFT identity and start finding meaningful connections — backed by ETH staking.
        </p>

        {/* Features */}
        {[
          ["🔐", "Non-custodial — your keys, your identity"],
          ["💎", "Stake ETH to signal genuine intent"],
          ["🌐", "Profiles stored on IPFS — censorship resistant"],
          ["🤝", "Smart contract escrow for first date funds"],
        ].map(([icon, text]) => (
          <div key={text} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0, marginTop: "0.1rem" }}>{icon}</span>
            <span style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}

        <div style={{ height: "1px", background: "rgba(168,85,247,0.15)", margin: "1.5rem 0" }} />

        {connecting ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#a855f7", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "1rem" }}>
              {steps[step]}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
              {steps.map((_, i) => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i <= step ? "#a855f7" : "#1e1030", transition: "background 0.3s" }} />
              ))}
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            style={{ width: "100%", padding: "0.9rem", borderRadius: "0.75rem", border: "none", background: "linear-gradient(135deg,#a855f7,#6366f1)", color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 24px rgba(168,85,247,0.3)" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 8px 32px rgba(168,85,247,0.45)"; }}
            onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 24px rgba(168,85,247,0.3)"; }}
          >
            ⟡ Connect MetaMask
          </button>
        )}

        <div style={{ textAlign: "center", marginTop: "1rem", color: "#374151", fontSize: "0.72rem", fontFamily: "monospace" }}>
          WalletConnect · Coinbase · Ledger also supported
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.5rem" }}>
        {[["1,247", "Verified Souls"], ["₿ 4.2", "ETH in Escrow"], ["342", "Matches Made"]].map(([val, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ color: "#a855f7", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.4rem", fontStyle: "italic" }}>{val}</div>
            <div style={{ color: "#374151", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "monospace" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile, onLike, onPass, liked, passed }) {
  const [staking, setStaking] = useState(false);
  const [staked, setStaked] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const handleLike = () => {
    setStaking(true);
    setTimeout(() => { setStaking(false); setStaked(true); setTimeout(() => onLike(profile), 500); }, 1500);
  };

  return (
    <div style={{ perspective: "1200px", width: "100%", maxWidth: 360 }}>
      <div
        style={{
          position: "relative",
          borderRadius: "1.5rem",
          overflow: "hidden",
          background: `linear-gradient(160deg, ${profile.bg} 0%, #0d0d1a 100%)`,
          border: "1px solid rgba(168,85,247,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          transform: staked ? "scale(0.95) rotateY(5deg)" : "scale(1)",
          transition: "transform 0.4s ease",
          minHeight: 520,
        }}
      >
        {/* Top gradient blob */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${profile.gradient.includes("violet") ? "rgba(168,85,247,0.25)" : profile.gradient.includes("emerald") ? "rgba(52,211,153,0.2)" : profile.gradient.includes("amber") ? "rgba(251,191,36,0.2)" : "rgba(244,114,182,0.2)"} 0%, transparent 70%)`, pointerEvents: "none" }} />

        {/* Header */}
        <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, var(--g1), var(--g2))`, backgroundImage: `linear-gradient(135deg, ${profile.gradient.split(" ")[1].replace("from-", "").replace("violet-500", "#8b5cf6").replace("emerald-400", "#34d399").replace("amber-400", "#fbbf24").replace("rose-400", "#fb7185")} , ${profile.gradient.split(" ")[2].replace("to-", "").replace("fuchsia-500", "#d946ef").replace("teal-600", "#0d9488").replace("orange-600", "#ea580c").replace("pink-600", "#db2777")})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', Georgia, serif", border: "2px solid rgba(255,255,255,0.15)" }}>
                {profile.avatar}
              </div>
              {profile.online && <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: "#10b981", border: "2px solid #0d0d1a" }} />}
            </div>

            {/* NFT badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
              <div style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "0.4rem", padding: "0.2rem 0.6rem", color: "#c084fc", fontSize: "0.7rem", fontFamily: "monospace" }}>
                ⛓ Soulbound {profile.tokenId}
              </div>
              <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "0.4rem", padding: "0.2rem 0.6rem", color: "#34d399", fontSize: "0.7rem", fontFamily: "monospace" }}>
                ✓ On-chain verified
              </div>
            </div>
          </div>

          {/* Name / age */}
          <div style={{ marginTop: "1rem" }}>
            <h3 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.6rem", fontWeight: 400, fontStyle: "italic", margin: 0 }}>
              {profile.name}, <span style={{ fontStyle: "normal", fontSize: "1.2rem", color: "#94a3b8" }}>{profile.age}</span>
            </h3>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.4rem", color: "#475569", fontSize: "0.75rem", fontFamily: "monospace" }}>
              <span>📍 {profile.distance}</span>
              <span>·</span>
              <span style={{ color: "#a855f7" }}>♥ {profile.compatibility}% compatible</span>
            </div>
          </div>
        </div>

        {/* Compatibility bar */}
        <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${profile.compatibility}%`, background: `linear-gradient(90deg, #a855f7, #6366f1)`, borderRadius: 99, transition: "width 1s ease" }} />
          </div>
        </div>

        {/* Bio */}
        <div style={{ padding: "0 1.5rem 1rem" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 1.65, fontStyle: "italic", borderLeft: "2px solid rgba(168,85,247,0.3)", paddingLeft: "0.75rem" }}>
            "{profile.bio}"
          </p>
        </div>

        {/* Interests */}
        <div style={{ padding: "0 1.5rem 1rem", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {profile.interests.map(i => (
            <span key={i} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "2rem", padding: "0.2rem 0.65rem", color: "#818cf8", fontSize: "0.72rem", fontFamily: "monospace" }}>
              {i}
            </span>
          ))}
        </div>

        {/* IPFS */}
        <div style={{ padding: "0 1.5rem 1.25rem" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#374151", fontSize: "0.68rem", fontFamily: "monospace" }}>IPFS:</span>
            <span style={{ color: "#4b5563", fontSize: "0.68rem", fontFamily: "monospace" }}>{profile.ipfsHash.slice(0, 20)}...</span>
            <span style={{ color: "#a855f7", fontSize: "0.68rem", cursor: "pointer" }}>↗</span>
          </div>
        </div>

        {/* Stake info */}
        <div style={{ margin: "0 1.5rem", marginBottom: "1.25rem", background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "0.75rem", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "#6b7280", fontSize: "0.7rem", fontFamily: "monospace", textTransform: "uppercase" }}>Stake to like</div>
            <div style={{ color: "#c084fc", fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic" }}>Ξ {profile.stakeRequired} ETH</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#6b7280", fontSize: "0.7rem", fontFamily: "monospace" }}>Goes to escrow</div>
            <div style={{ color: "#34d399", fontSize: "0.72rem", fontFamily: "monospace" }}>on mutual match</div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ padding: "0 1.5rem 1.5rem", display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => onPass(profile)}
            style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "#6b7280", fontSize: "1.1rem", cursor: "pointer", transition: "all 0.2s", fontFamily: "monospace" }}
            onMouseEnter={e => { e.target.style.borderColor = "rgba(239,68,68,0.4)"; e.target.style.color = "#ef4444"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.color = "#6b7280"; }}
          >
            ✕ Pass
          </button>
          <button
            onClick={handleLike}
            disabled={staking || staked}
            style={{ flex: 2, padding: "0.75rem", borderRadius: "0.75rem", border: "none", background: staked ? "rgba(16,185,129,0.2)" : staking ? "rgba(168,85,247,0.3)" : "linear-gradient(135deg,#a855f7,#6366f1)", color: staked ? "#34d399" : "#fff", fontSize: "0.85rem", fontWeight: 600, cursor: staking || staked ? "default" : "pointer", transition: "all 0.3s", boxShadow: staked ? "none" : "0 4px 20px rgba(168,85,247,0.3)", fontFamily: "monospace" }}
          >
            {staked ? "✓ Staked & Liked!" : staking ? "⟳ Staking..." : `♥ Like · Stake Ξ ${profile.stakeRequired}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Matches Screen ───────────────────────────────────────────────────────────
function MatchesScreen({ matches }) {
  return (
    <div style={{ padding: "1.5rem" }}>
      <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "0.25rem" }}>Your Matches</h2>
      <p style={{ color: "#475569", fontSize: "0.8rem", fontFamily: "monospace", marginBottom: "1.5rem" }}>Mutual stakers — escrow funds pooled for your first date</p>

      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#374151" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⟡</div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#4b5563", fontStyle: "italic" }}>No matches yet</div>
          <div style={{ fontSize: "0.78rem", fontFamily: "monospace", marginTop: "0.5rem", color: "#374151" }}>Keep exploring — the algorithm works on-chain</div>
        </div>
      ) : (
        matches.map((match) => (
          <div key={match.id} style={{ background: "rgba(15,10,25,0.8)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "1.25rem", padding: "1.25rem", marginBottom: "1rem", backdropFilter: "blur(10px)" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", backgroundImage: `linear-gradient(135deg, #8b5cf6, #d946ef)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>
                {match.profile.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", fontStyle: "italic" }}>{match.profile.name}</div>
                <div style={{ color: "#6b7280", fontSize: "0.72rem", fontFamily: "monospace" }}>Matched {match.matchedAt} · {match.messages} messages</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#a855f7", fontFamily: "monospace", fontSize: "0.8rem" }}>Ξ {match.pooledEth}</div>
                <div style={{ color: "#34d399", fontSize: "0.65rem", fontFamily: "monospace" }}>in escrow</div>
              </div>
            </div>

            {/* Escrow card */}
            <div style={{ marginTop: "1rem", background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.12)", borderRadius: "0.75rem", padding: "0.75rem 1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ color: "#6b7280", fontSize: "0.72rem", fontFamily: "monospace", textTransform: "uppercase" }}>Date Fund Escrow</span>
                <span style={{ color: "#34d399", fontSize: "0.72rem", fontFamily: "monospace" }}>● Active</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid rgba(99,102,241,0.3)", background: "rgba(99,102,241,0.1)", color: "#818cf8", fontSize: "0.75rem", cursor: "pointer", fontFamily: "monospace" }}>
                  💬 Message
                </button>
                <button style={{ flex: 1, padding: "0.5rem", borderRadius: "0.5rem", border: "none", background: "linear-gradient(135deg,#a855f7,#6366f1)", color: "#fff", fontSize: "0.75rem", cursor: "pointer", fontFamily: "monospace" }}>
                  📅 Plan Date
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* How escrow works */}
      <div style={{ marginTop: "1.5rem", background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.25rem" }}>
        <div style={{ color: "#475569", fontSize: "0.72rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1rem" }}>How the escrow works</div>
        {[
          ["1", "Both users stake ETH to like each other"],
          ["2", "Smart contract detects mutual interest"],
          ["3", "Stakes are pooled into a shared escrow"],
          ["4", "Funds unlock for your first date activity"],
          ["5", "Unused ETH is returned if date is cancelled"],
        ].map(([n, text]) => (
          <div key={n} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7", fontSize: "0.65rem", fontFamily: "monospace", flexShrink: 0 }}>{n}</div>
            <span style={{ color: "#4b5563", fontSize: "0.78rem", lineHeight: 1.5 }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Setup ────────────────────────────────────────────────────────────
function ProfileSetup({ wallet, onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: "", age: "", bio: "", interests: [] });
  const [minting, setMinting] = useState(false);
  const INTEREST_OPTIONS = ["DeFi", "NFTs", "Web3", "Cooking", "Music", "Art", "Hiking", "Philosophy", "Gaming", "Travel", "Yoga", "Coffee", "Books", "Film", "Fitness"];

  const handleMint = () => {
    setMinting(true);
    setTimeout(() => onComplete({ ...form, wallet, tokenId: "#" + Math.floor(Math.random() * 9000 + 1000) }), 2500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative", zIndex: 1 }}>
      <div style={{ background: "rgba(15,10,25,0.85)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "1.5rem", padding: "2.5rem", maxWidth: "460px", width: "100%", backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "2rem" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? "linear-gradient(90deg,#a855f7,#6366f1)" : "rgba(255,255,255,0.06)", transition: "background 0.3s" }} />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "0.5rem" }}>Who are you?</h2>
            <p style={{ color: "#475569", fontSize: "0.82rem", marginBottom: "1.5rem" }}>This becomes your Soulbound NFT identity</p>
            {[["Your name", "name", "text"], ["Your age", "age", "number"]].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={{ color: "#6b7280", fontSize: "0.75rem", fontFamily: "monospace", display: "block", marginBottom: "0.4rem" }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.6rem", padding: "0.7rem 0.9rem", color: "#f1f5f9", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  onFocus={e => e.target.style.borderColor = "rgba(168,85,247,0.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "0.5rem" }}>Your story</h2>
            <p style={{ color: "#475569", fontSize: "0.82rem", marginBottom: "1.5rem" }}>Bio & interests — stored on IPFS</p>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Tell your story..."
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.6rem", padding: "0.7rem 0.9rem", color: "#f1f5f9", fontSize: "0.88rem", outline: "none", boxSizing: "border-box", resize: "none", height: 100, fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = "rgba(168,85,247,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
            <div style={{ marginTop: "1rem" }}>
              <label style={{ color: "#6b7280", fontSize: "0.75rem", fontFamily: "monospace", display: "block", marginBottom: "0.6rem" }}>INTERESTS</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {INTEREST_OPTIONS.map(i => {
                  const selected = form.interests.includes(i);
                  return (
                    <button key={i} onClick={() => setForm(f => ({ ...f, interests: selected ? f.interests.filter(x => x !== i) : [...f.interests, i] }))}
                      style={{ padding: "0.3rem 0.7rem", borderRadius: "2rem", border: `1px solid ${selected ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.07)"}`, background: selected ? "rgba(168,85,247,0.15)" : "transparent", color: selected ? "#c084fc" : "#4b5563", fontSize: "0.72rem", cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s" }}
                    >{i}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "0.5rem" }}>Mint your soul</h2>
            <p style={{ color: "#475569", fontSize: "0.82rem", marginBottom: "1.5rem" }}>Your Soulbound NFT will be minted on Ethereum</p>
            {/* Preview */}
            <div style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.1rem", fontFamily: "'Cormorant Garamond', serif" }}>{form.name?.slice(0, 2).toUpperCase() || "??"}</div>
                <div>
                  <div style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontStyle: "italic" }}>{form.name || "—"}, {form.age || "—"}</div>
                  <div style={{ color: "#6b7280", fontSize: "0.7rem", fontFamily: "monospace" }}>{wallet}</div>
                </div>
              </div>
              <p style={{ color: "#6b7280", fontSize: "0.8rem", fontStyle: "italic", borderLeft: "2px solid rgba(168,85,247,0.3)", paddingLeft: "0.75rem" }}>"{form.bio || "No bio yet"}"</p>
            </div>
            {minting ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ color: "#a855f7", fontFamily: "monospace", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Uploading to IPFS... Minting on Ethereum...</div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: "70%", background: "linear-gradient(90deg,#a855f7,#6366f1)", animation: "none", borderRadius: 99 }} />
                </div>
              </div>
            ) : (
              <button onClick={handleMint}
                style={{ width: "100%", padding: "0.9rem", borderRadius: "0.75rem", border: "none", background: "linear-gradient(135deg,#a855f7,#6366f1)", color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 24px rgba(168,85,247,0.35)", fontFamily: "monospace" }}>
                ⛓ Mint Soulbound NFT · Sign Tx
              </button>
            )}
          </div>
        )}

        {step < 2 && (
          <button onClick={() => setStep(s => s + 1)}
            style={{ width: "100%", marginTop: "1.5rem", padding: "0.9rem", borderRadius: "0.75rem", border: "none", background: "linear-gradient(135deg,#a855f7,#6366f1)", color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "monospace" }}>
            Continue →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function SoulMatch() {
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("explore");
  const [profiles, setProfiles] = useState(MOCK_PROFILES);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [likedIds, setLikedIds] = useState(new Set());
  const [passedIds, setPassedIds] = useState(new Set());
  const [notification, setNotification] = useState(null);

  const availableProfiles = profiles.filter(p => !likedIds.has(p.id) && !passedIds.has(p.id));

  const showNotification = (msg, type = "match") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleLike = (p) => {
    setLikedIds(s => new Set([...s, p.id]));
    // Simulate match on first like
    if (matches.length === MOCK_MATCHES.length && Math.random() > 0.3) {
      setTimeout(() => {
        const newMatch = { id: `match-${Date.now()}`, profile: p, matchedAt: "just now", pooledEth: (parseFloat(p.stakeRequired) * 2).toFixed(3), status: "active", messages: 0 };
        setMatches(m => [...m, newMatch]);
        showNotification(`💜 It's a match with ${p.name}! Ξ ${newMatch.pooledEth} pooled to escrow.`, "match");
      }, 800);
    }
  };

  const handlePass = (p) => {
    setPassedIds(s => new Set([...s, p.id]));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060411", color: "#f1f5f9", fontFamily: "system-ui, -apple-system, sans-serif", position: "relative" }}>
      <ParticleField />

      {/* Global font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 99px; }
        body { background: #060411; }
      `}</style>

      {/* Match notification */}
      {notification && (
        <div style={{ position: "fixed", top: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "rgba(15,10,35,0.95)", border: "1px solid rgba(168,85,247,0.4)", borderRadius: "0.75rem", padding: "0.9rem 1.25rem", backdropFilter: "blur(20px)", boxShadow: "0 8px 32px rgba(168,85,247,0.3)", color: "#e2e8f0", fontSize: "0.85rem", fontFamily: "monospace", whiteSpace: "nowrap", animation: "slideDown 0.3s ease" }}>
          {notification.msg}
        </div>
      )}

      {!wallet ? (
        <ConnectWallet onConnect={setWallet} />
      ) : !profile ? (
        <ProfileSetup wallet={wallet} onComplete={setProfile} />
      ) : (
        <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
          {/* Top bar */}
          <div style={{ padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(6,4,17,0.8)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontStyle: "italic", fontWeight: 300, background: "linear-gradient(135deg,#e879f9,#a855f7,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              SoulMatch
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {matches.length > MOCK_MATCHES.length && (
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7" }} />
              )}
              <div style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "2rem", padding: "0.3rem 0.75rem", color: "#c084fc", fontSize: "0.72rem", fontFamily: "monospace" }}>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: "5rem" }}>
            {tab === "explore" && (
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontStyle: "italic" }}>Discover Souls</h2>
                    <p style={{ color: "#374151", fontSize: "0.72rem", fontFamily: "monospace" }}>{availableProfiles.length} verified profiles nearby</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button style={{ padding: "0.35rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "#6b7280", fontSize: "0.72rem", cursor: "pointer", fontFamily: "monospace" }}>Filter</button>
                    <button style={{ padding: "0.35rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.08)", color: "#c084fc", fontSize: "0.72rem", cursor: "pointer", fontFamily: "monospace" }}>⟡ Sort</button>
                  </div>
                </div>

                {availableProfiles.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✦</div>
                    <div style={{ color: "#4b5563", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontStyle: "italic" }}>You've seen everyone nearby</div>
                    <div style={{ color: "#374151", fontSize: "0.78rem", fontFamily: "monospace", marginTop: "0.5rem" }}>Expand your radius or check back later</div>
                  </div>
                ) : (
                  availableProfiles.map(p => (
                    <ProfileCard key={p.id} profile={p} onLike={handleLike} onPass={handlePass} liked={likedIds.has(p.id)} passed={passedIds.has(p.id)} />
                  ))
                )}
              </div>
            )}

            {tab === "matches" && <MatchesScreen matches={matches} />}

            {tab === "profile" && (
              <div style={{ padding: "1.5rem" }}>
                <h2 style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.8rem", fontStyle: "italic", marginBottom: "1.5rem" }}>Your Soul</h2>
                <div style={{ background: "rgba(15,10,25,0.8)", border: "1px solid rgba(168,85,247,0.2)", borderRadius: "1.5rem", padding: "1.5rem", backdropFilter: "blur(10px)" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.25rem" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.3rem", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                      {profile.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: "#f1f5f9", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontStyle: "italic" }}>{profile.name}, {profile.age}</div>
                      <div style={{ color: "#a855f7", fontSize: "0.72rem", fontFamily: "monospace" }}>⛓ Soulbound {profile.tokenId}</div>
                    </div>
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic", borderLeft: "2px solid rgba(168,85,247,0.3)", paddingLeft: "0.75rem", marginBottom: "1.25rem" }}>"{profile.bio}"</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
                    {(profile.interests || []).map(i => (
                      <span key={i} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "2rem", padding: "0.2rem 0.65rem", color: "#818cf8", fontSize: "0.72rem", fontFamily: "monospace" }}>{i}</span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                    {[["Likes", likedIds.size], ["Matches", matches.length], ["ETH Staked", (likedIds.size * 0.01).toFixed(3)]].map(([label, val]) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "0.75rem", padding: "0.75rem", textAlign: "center" }}>
                        <div style={{ color: "#a855f7", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", fontStyle: "italic" }}>{val}</div>
                        <div style={{ color: "#374151", fontSize: "0.65rem", fontFamily: "monospace", textTransform: "uppercase", marginTop: "0.25rem" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security */}
                <div style={{ marginTop: "1rem", background: "rgba(15,10,25,0.6)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "1rem", padding: "1.25rem" }}>
                  <div style={{ color: "#475569", fontSize: "0.72rem", fontFamily: "monospace", textTransform: "uppercase", marginBottom: "1rem" }}>Security & Anti-Abuse</div>
                  {[
                    ["🛡", "Soulbound NFT prevents multi-account abuse"],
                    ["🔒", "Rate limiting on staking (5 per day)"],
                    ["⚖️", "Dispute resolution via DAO governance"],
                    ["🚫", "Block & report — penalizes bad actors on-chain"],
                    ["🔐", "zk-SNARKs for privacy-preserving verification"],
                  ].map(([icon, text]) => (
                    <div key={text} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem" }}>
                      <span style={{ flexShrink: 0 }}>{icon}</span>
                      <span style={{ color: "#4b5563", fontSize: "0.78rem" }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(6,4,17,0.92)", borderTop: "1px solid rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", display: "flex", zIndex: 10 }}>
            {[
              ["explore", "✦", "Explore"],
              ["matches", `♥ ${matches.length}`, "Matches"],
              ["profile", "⟡", "Soul"],
            ].map(([id, icon, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: "0.9rem 0.5rem 1.1rem", border: "none", background: "transparent", color: tab === id ? "#a855f7" : "#374151", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", transition: "color 0.2s" }}>
                <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                <span style={{ fontSize: "0.65rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
