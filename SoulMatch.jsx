import { useState, useEffect, useRef } from "react";

// ─── Simulated blockchain / IPFS data ───────────────────────────────────────
const MOCK_PROFILES = [
  {
    id: "0x7f3a...c9d1",
    tokenId: "#0042",
    name: "Aria Chen",
    age: 28,
    bio: "On-chain artist. I believe love should be as trustless as code.",
    interests: ["DeFi", "Jazz", "Ceramics", "Hiking"],
    stakeRequired: "0.05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=b6e3f4",
    verified: true,
    ipfsHash: "QmX7f3a9c2d1...",
    matchScore: 94,
    distance: "2.1 mi",
  },
  {
    id: "0x4b2e...f8a0",
    tokenId: "#0117",
    name: "Marcus Reid",
    age: 31,
    bio: "Smart contract dev by day, telescope enthusiast by night. Looking for my signal in the noise.",
    interests: ["Ethereum", "Astronomy", "Cooking", "Chess"],
    stakeRequired: "0.05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=d1d4f9",
    verified: true,
    ipfsHash: "QmB4e2f8a0...",
    matchScore: 87,
    distance: "4.7 mi",
  },
  {
    id: "0x9c1d...e2b7",
    tokenId: "#0203",
    name: "Zoe Nakamura",
    age: 26,
    bio: "Researcher at ETH Foundation. Let's prove zero-knowledge of heartbreak.",
    interests: ["ZK Proofs", "Literature", "Bouldering", "Vinyl"],
    stakeRequired: "0.05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=ffd5dc",
    verified: true,
    ipfsHash: "QmC9d1e2b7...",
    matchScore: 91,
    distance: "1.3 mi",
  },
  {
    id: "0x2e8f...a3c5",
    tokenId: "#0389",
    name: "Leo Okafor",
    age: 30,
    bio: "DAO contributor & urban gardener. Building communities on-chain and off.",
    interests: ["Governance", "Gardening", "Photography", "Running"],
    stakeRequired: "0.05",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=c0eb75",
    verified: true,
    ipfsHash: "QmD2e8fa3c5...",
    matchScore: 83,
    distance: "6.2 mi",
  },
];

const MOCK_MATCHES = [
  {
    ...MOCK_PROFILES[0],
    matchedAt: "2h ago",
    escrowAmount: "0.10 ETH",
    escrowAddress: "0xEsc...r0w1",
    messages: 0,
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void: #03020a;
    --deep: #0a0818;
    --panel: #100e22;
    --border: rgba(255,255,255,0.07);
    --border-glow: rgba(196,160,90,0.3);
    --gold: #c4a05a;
    --gold-bright: #f0c96a;
    --gold-dim: rgba(196,160,90,0.15);
    --nebula: #7a5af8;
    --nebula-dim: rgba(122,90,248,0.12);
    --rose: #e8789a;
    --text: #e8e4d8;
    --text-dim: rgba(232,228,216,0.45);
    --text-faint: rgba(232,228,216,0.2);
    --success: #5af8a0;
    --danger: #f85a7a;
  }

  html, body { height: 100%; background: var(--void); color: var(--text); font-family: 'DM Mono', monospace; overflow: hidden; }

  #root { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-glow); border-radius: 2px; }

  /* ── Animations ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-ring { 0%,100% { box-shadow: 0 0 0 0 rgba(196,160,90,0.3); } 50% { box-shadow: 0 0 0 12px rgba(196,160,90,0); } }
  @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
  @keyframes match-pop { 0% { transform: scale(0.5); opacity:0; } 70% { transform: scale(1.05); } 100% { transform: scale(1); opacity:1; } }
  @keyframes card-in { from { opacity:0; transform: translateX(60px) rotate(3deg); } to { opacity:1; transform: translateX(0) rotate(0); } }
  @keyframes star-twinkle { 0%,100%{opacity:0.2;} 50%{opacity:1;} }
  @keyframes stake-pulse { 0%{box-shadow:0 0 0 0 rgba(122,90,248,0.5);} 100%{box-shadow:0 0 0 20px rgba(122,90,248,0);} }
  @keyframes swipe-left { to { transform: translateX(-150%) rotate(-20deg); opacity:0; } }
  @keyframes swipe-right { to { transform: translateX(150%) rotate(20deg); opacity:0; } }

  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .float { animation: float 4s ease-in-out infinite; }

  /* ── Stars bg ── */
  .star { position: absolute; border-radius: 50%; background: white; animation: star-twinkle var(--dur, 3s) var(--delay, 0s) ease-in-out infinite; }

  /* ── Noise overlay ── */
  .noise::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 999;
    opacity: 0.4;
  }

  /* ── Layout ── */
  .app { display: flex; flex-direction: column; height: 100vh; position: relative; overflow: hidden; }

  /* ── Nav ── */
  .nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 24px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,8,24,0.85);
    backdrop-filter: blur(20px);
    position: relative; z-index: 10;
    flex-shrink: 0;
  }
  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 300; letter-spacing: 0.1em;
    background: linear-gradient(135deg, var(--gold), var(--gold-bright), var(--gold));
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmer 4s linear infinite;
  }
  .nav-logo span { font-style: italic; font-weight: 600; }
  .wallet-badge {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px; border-radius: 100px;
    border: 1px solid var(--border-glow);
    background: var(--gold-dim);
    font-size: 11px; color: var(--gold); cursor: pointer;
    transition: all 0.2s;
  }
  .wallet-badge:hover { background: rgba(196,160,90,0.2); box-shadow: 0 0 20px rgba(196,160,90,0.15); }
  .wallet-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); animation: pulse-ring 2s infinite; }

  /* ── Tab bar ── */
  .tab-bar {
    display: flex; justify-content: center; gap: 4px;
    padding: 10px 20px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,8,24,0.7);
    backdrop-filter: blur(10px);
    flex-shrink: 0;
  }
  .tab-btn {
    padding: 7px 18px; border-radius: 100px;
    border: 1px solid transparent;
    background: transparent; color: var(--text-dim);
    font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.2s; text-transform: uppercase;
  }
  .tab-btn.active {
    border-color: var(--border-glow);
    background: var(--gold-dim); color: var(--gold);
    box-shadow: 0 0 15px rgba(196,160,90,0.1);
  }
  .tab-btn:hover:not(.active) { color: var(--text); border-color: var(--border); }

  /* ── Main content ── */
  .main { flex: 1; overflow-y: auto; overflow-x: hidden; position: relative; }

  /* ── Landing ── */
  .landing {
    min-height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px 20px; text-align: center; position: relative;
  }
  .landing-orb {
    width: 220px; height: 220px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, rgba(122,90,248,0.4), rgba(196,160,90,0.1) 50%, transparent 70%);
    border: 1px solid var(--border-glow);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 40px;
    animation: float 5s ease-in-out infinite;
    position: relative;
    box-shadow: 0 0 60px rgba(122,90,248,0.15), inset 0 0 40px rgba(196,160,90,0.05);
  }
  .landing-orb::before {
    content: '';
    position: absolute; inset: -20px; border-radius: 50%;
    border: 1px solid rgba(196,160,90,0.1);
    animation: spin-slow 20s linear infinite;
  }
  .landing-orb::after {
    content: '';
    position: absolute; inset: -40px; border-radius: 50%;
    border: 1px dashed rgba(196,160,90,0.05);
    animation: spin-slow 35s linear infinite reverse;
  }
  .orb-icon { font-size: 64px; filter: drop-shadow(0 0 20px rgba(122,90,248,0.5)); }
  .landing-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 6vw, 64px); font-weight: 300;
    line-height: 1.1; margin-bottom: 12px;
  }
  .landing-title em { font-style: italic; color: var(--gold); }
  .landing-sub {
    font-size: 12px; color: var(--text-dim); letter-spacing: 0.15em;
    text-transform: uppercase; margin-bottom: 32px; max-width: 400px;
  }
  .landing-pills { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 48px; }
  .pill {
    padding: 5px 12px; border-radius: 100px;
    border: 1px solid var(--border);
    font-size: 10px; color: var(--text-dim); letter-spacing: 0.1em;
  }
  .btn-connect {
    padding: 16px 48px; border-radius: 100px;
    background: linear-gradient(135deg, var(--gold), var(--gold-bright));
    border: none; color: var(--void);
    font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    cursor: pointer; transition: all 0.3s;
    box-shadow: 0 4px 30px rgba(196,160,90,0.3);
  }
  .btn-connect:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(196,160,90,0.4); }
  .btn-connect:active { transform: translateY(0); }
  .landing-note { margin-top: 20px; font-size: 10px; color: var(--text-faint); }

  /* ── Browse ── */
  .browse { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; min-height: 100%; }
  .browse-header { width: 100%; max-width: 460px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .browse-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; }
  .browse-count { font-size: 11px; color: var(--text-dim); }

  .profile-card {
    width: 100%; max-width: 400px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 24px; overflow: hidden;
    animation: card-in 0.4s ease forwards;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    transition: transform 0.1s;
  }
  .profile-card.swiping-left { animation: swipe-left 0.4s ease forwards; }
  .profile-card.swiping-right { animation: swipe-right 0.4s ease forwards; }

  .card-header {
    position: relative;
    padding: 28px 28px 20px;
    background: linear-gradient(180deg, rgba(122,90,248,0.08) 0%, transparent 100%);
    border-bottom: 1px solid var(--border);
  }
  .card-avatar-wrap {
    position: relative; display: inline-block;
  }
  .card-avatar {
    width: 80px; height: 80px; border-radius: 50%;
    border: 2px solid var(--border-glow);
    background: var(--deep);
  }
  .verified-badge {
    position: absolute; bottom: 0; right: -4px;
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--gold); color: var(--void);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; border: 2px solid var(--panel);
  }
  .card-name-row { margin-top: 12px; display: flex; align-items: baseline; gap: 10px; }
  .card-name { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 400; }
  .card-age { font-size: 12px; color: var(--text-dim); }
  .card-token { font-size: 10px; color: var(--gold); opacity: 0.7; margin-top: 2px; font-family: 'DM Mono'; }
  .card-meta { display: flex; gap: 16px; margin-top: 8px; }
  .card-meta-item { font-size: 10px; color: var(--text-dim); display: flex; align-items: center; gap: 4px; }
  .match-score {
    position: absolute; top: 20px; right: 20px;
    padding: 4px 10px; border-radius: 100px;
    background: var(--nebula-dim); border: 1px solid rgba(122,90,248,0.3);
    font-size: 11px; color: var(--nebula);
  }

  .card-body { padding: 20px 28px; }
  .card-bio { font-size: 13px; line-height: 1.6; color: var(--text-dim); margin-bottom: 16px; font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 300; font-style: italic; }
  .card-interests { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .interest-tag {
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid var(--border);
    font-size: 10px; color: var(--text-dim); letter-spacing: 0.05em;
  }
  .card-stake-info {
    padding: 14px 16px; border-radius: 12px;
    background: var(--nebula-dim);
    border: 1px solid rgba(122,90,248,0.2);
    margin-bottom: 20px;
    display: flex; align-items: center; gap: 12px;
  }
  .stake-icon { font-size: 20px; }
  .stake-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.1em; }
  .stake-amount { font-size: 14px; color: var(--nebula); margin-top: 2px; }
  .stake-note { font-size: 9px; color: var(--text-faint); margin-top: 2px; }

  .card-actions { display: flex; gap: 12px; }
  .btn-pass {
    flex: 1; padding: 14px;
    border-radius: 12px; border: 1px solid var(--border);
    background: transparent; color: var(--text-dim);
    font-family: 'DM Mono'; font-size: 12px; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.2s; text-transform: uppercase;
  }
  .btn-pass:hover { border-color: var(--danger); color: var(--danger); background: rgba(248,90,122,0.05); }

  .btn-like {
    flex: 2; padding: 14px;
    border-radius: 12px; border: none;
    background: linear-gradient(135deg, var(--nebula), rgba(232,120,154,0.8));
    color: white; font-family: 'DM Mono'; font-size: 12px;
    letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
    text-transform: uppercase;
    box-shadow: 0 4px 20px rgba(122,90,248,0.25);
    position: relative; overflow: hidden;
  }
  .btn-like::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent);
    transform: translateX(-100%); transition: transform 0.4s;
  }
  .btn-like:hover::after { transform: translateX(100%); }
  .btn-like:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(122,90,248,0.4); }

  .card-ipfs { padding: 10px 28px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
  .ipfs-badge { font-size: 9px; color: var(--text-faint); letter-spacing: 0.08em; }
  .ipfs-hash { font-size: 9px; color: var(--text-faint); font-family: 'DM Mono'; }

  /* ── Stake Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: rgba(3,2,10,0.85); backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: fadeUp 0.3s ease;
  }
  .modal {
    width: 100%; max-width: 380px;
    background: var(--panel); border: 1px solid var(--border-glow);
    border-radius: 24px; padding: 32px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(122,90,248,0.1);
  }
  .modal-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; margin-bottom: 6px; }
  .modal-sub { font-size: 11px; color: var(--text-dim); margin-bottom: 24px; }
  .modal-amount-display {
    text-align: center; padding: 24px;
    background: var(--nebula-dim); border-radius: 16px;
    border: 1px solid rgba(122,90,248,0.2);
    margin-bottom: 20px;
  }
  .modal-eth { font-size: 36px; font-family: 'Cormorant Garamond', serif; color: var(--nebula); }
  .modal-eth-label { font-size: 10px; color: var(--text-dim); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; }
  .modal-details { margin-bottom: 24px; }
  .modal-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 11px; }
  .modal-row-label { color: var(--text-dim); }
  .modal-row-val { color: var(--text); font-family: 'DM Mono'; }
  .modal-btns { display: flex; gap: 10px; }
  .btn-cancel { flex:1; padding:13px; border-radius:12px; border:1px solid var(--border); background:transparent; color:var(--text-dim); font-family:'DM Mono'; font-size:11px; cursor:pointer; transition:all 0.2s; }
  .btn-cancel:hover { border-color: var(--border-glow); }
  .btn-confirm { flex:2; padding:13px; border-radius:12px; border:none; background: linear-gradient(135deg, var(--gold), var(--gold-bright)); color: var(--void); font-family:'DM Mono'; font-size:11px; font-weight:500; cursor:pointer; transition:all 0.2s; }
  .btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,160,90,0.3); }

  /* ── Match Modal ── */
  .match-modal {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(3,2,10,0.95);
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; text-align: center; padding: 40px;
    animation: fadeUp 0.5s ease;
  }
  .match-orbs { display: flex; gap: -20px; margin-bottom: 32px; }
  .match-avatar-wrap {
    width: 90px; height: 90px; border-radius: 50%;
    border: 3px solid var(--gold); overflow: hidden;
    animation: match-pop 0.5s ease;
  }
  .match-avatar-wrap:last-child { margin-left: -20px; animation-delay: 0.15s; }
  .match-avatar-wrap img { width: 100%; height: 100%; }
  .match-heart { font-size: 32px; align-self: center; margin: 0 -10px; z-index: 1; animation: match-pop 0.4s 0.1s ease both; }
  .match-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; margin-bottom: 8px; }
  .match-title em { font-style: italic; color: var(--gold); }
  .match-sub { font-size: 12px; color: var(--text-dim); margin-bottom: 32px; max-width: 300px; }
  .escrow-card {
    padding: 20px 28px; background: var(--panel);
    border: 1px solid var(--border-glow); border-radius: 16px;
    margin-bottom: 32px; width: 100%; max-width: 340px;
    text-align: left;
  }
  .escrow-title { font-size: 10px; color: var(--gold); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; }
  .escrow-amount { font-family: 'Cormorant Garamond', serif; font-size: 30px; margin-bottom: 4px; }
  .escrow-note { font-size: 10px; color: var(--text-dim); }
  .escrow-addr { font-size: 9px; color: var(--text-faint); margin-top: 8px; font-family: 'DM Mono'; }
  .btn-close-match { padding: 14px 40px; border-radius: 100px; border: 1px solid var(--border-glow); background: transparent; color: var(--gold); font-family: 'DM Mono'; font-size: 12px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.1em; }
  .btn-close-match:hover { background: var(--gold-dim); }

  /* ── Matches list ── */
  .matches-page { padding: 24px 16px; max-width: 500px; margin: 0 auto; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; margin-bottom: 20px; }
  .match-card {
    padding: 20px; border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--panel); margin-bottom: 12px;
    display: flex; gap: 16px; align-items: center;
    transition: border-color 0.2s;
    cursor: pointer;
  }
  .match-card:hover { border-color: var(--border-glow); }
  .match-card-avatar { width: 56px; height: 56px; border-radius: 50%; border: 2px solid var(--border-glow); }
  .match-card-info { flex:1; }
  .match-card-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; }
  .match-card-time { font-size: 10px; color: var(--text-dim); margin-top: 2px; }
  .match-card-escrow {
    font-size: 10px; color: var(--success); margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
  }
  .match-card-right { text-align: right; }
  .match-card-eth { font-size: 14px; color: var(--gold); }
  .match-card-label { font-size: 9px; color: var(--text-faint); text-transform: uppercase; letter-spacing: 0.08em; }
  .empty-state { text-align:center; padding: 60px 20px; color: var(--text-dim); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .empty-text { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; margin-bottom: 8px; }
  .empty-sub { font-size: 12px; }

  /* ── Profile create ── */
  .create-page { padding: 24px 16px; max-width: 460px; margin: 0 auto; }
  .form-group { margin-bottom: 20px; }
  .form-label { font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; display: block; }
  .form-input {
    width: 100%; padding: 13px 16px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--panel);
    color: var(--text); font-family: 'DM Mono'; font-size: 13px;
    transition: border-color 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--border-glow); box-shadow: 0 0 0 3px rgba(196,160,90,0.05); }
  .form-textarea { resize: vertical; min-height: 90px; }
  .nft-preview {
    padding: 20px; border-radius: 12px;
    border: 1px dashed var(--border-glow);
    background: var(--gold-dim); text-align: center; margin-bottom: 24px;
  }
  .nft-title { font-size: 10px; color: var(--gold); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .nft-text { font-size: 11px; color: var(--text-dim); }
  .security-box {
    padding: 16px; border-radius: 10px;
    border: 1px solid rgba(90,248,160,0.2);
    background: rgba(90,248,160,0.05);
    margin-bottom: 24px;
  }
  .security-title { font-size: 10px; color: var(--success); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .security-item { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .btn-submit {
    width: 100%; padding: 16px; border-radius: 12px;
    border: none; background: linear-gradient(135deg, var(--gold), var(--gold-bright));
    color: var(--void); font-family: 'DM Mono'; font-size: 13px; font-weight: 500;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
    text-transform: uppercase;
    box-shadow: 0 4px 20px rgba(196,160,90,0.2);
  }
  .btn-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(196,160,90,0.3); }

  /* ── Success Toast ── */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px; border-radius: 100px;
    background: var(--panel); border: 1px solid var(--success);
    color: var(--success); font-size: 12px; z-index: 500;
    animation: fadeUp 0.3s ease;
    box-shadow: 0 4px 20px rgba(90,248,160,0.15);
    white-space: nowrap;
  }
`;

// ─── Star field ──────────────────────────────────────────────────────────────
function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    dur: Math.random() * 4 + 2,
    delay: Math.random() * 5,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            "--dur": `${s.dur}s`,
            "--delay": `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function SoulMatch() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [tab, setTab] = useState("browse");
  const [profileIndex, setProfileIndex] = useState(0);
  const [liked, setLiked] = useState(new Set());
  const [passed, setPassed] = useState(new Set());
  const [stakeModal, setStakeModal] = useState(null);
  const [matchModal, setMatchModal] = useState(null);
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [swipeDir, setSwipeDir] = useState(null);
  const [toast, setToast] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const profiles = MOCK_PROFILES.filter(
    (p) => !liked.has(p.id) && !passed.has(p.id)
  );
  const currentProfile = profiles[0];

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function connectWallet() {
    setConnecting(true);
    setTimeout(() => {
      const addr =
        "0x" +
        Array.from({ length: 40 }, () =>
          "0123456789abcdef"[Math.floor(Math.random() * 16)]
        ).join("");
      setWalletAddress(addr.slice(0, 6) + "..." + addr.slice(-4));
      setConnected(true);
      setConnecting(false);
    }, 1800);
  }

  function handleLike(profile) {
    setStakeModal(profile);
  }

  function handlePass(profile) {
    setSwipeDir("left");
    setTimeout(() => {
      setPassed((p) => new Set([...p, profile.id]));
      setSwipeDir(null);
    }, 400);
  }

  function confirmStake(profile) {
    setStakeModal(null);
    setSwipeDir("right");
    setTimeout(() => {
      const newLiked = new Set([...liked, profile.id]);
      setLiked(newLiked);
      setSwipeDir(null);
      // Check for mutual match (50% chance for demo)
      const isMatch = Math.random() > 0.4;
      if (isMatch) {
        const newMatch = {
          ...profile,
          matchedAt: "Just now",
          escrowAmount: `${(parseFloat(profile.stakeRequired) * 2).toFixed(2)} ETH`,
          escrowAddress: "0xEsc..." + Math.random().toString(16).slice(2, 6),
          messages: 0,
        };
        setMatches((m) => [newMatch, ...m]);
        setTimeout(() => setMatchModal(newMatch), 500);
      } else {
        showToast("✓ Stake submitted — waiting for mutual connection");
      }
    }, 400);
  }

  const tabs = [
    { id: "browse", label: "Discover" },
    { id: "matches", label: `Matches${matches.length ? ` (${matches.length})` : ""}` },
    { id: "create", label: "My Profile" },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="app noise">
        <StarField />

        {/* Nav */}
        <nav className="nav">
          <div className="nav-logo">
            Soul<span>Match</span>
          </div>
          {connected ? (
            <div className="wallet-badge">
              <div className="wallet-dot" />
              {walletAddress}
            </div>
          ) : (
            <div
              className="wallet-badge"
              onClick={connectWallet}
              style={{ cursor: "pointer" }}
            >
              Connect Wallet
            </div>
          )}
        </nav>

        {!connected ? (
          <div className="main">
            <Landing onConnect={connectWallet} connecting={connecting} />
          </div>
        ) : (
          <>
            <div className="tab-bar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`tab-btn ${tab === t.id ? "active" : ""}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="main">
              {tab === "browse" && (
                <Browse
                  currentProfile={currentProfile}
                  profileIndex={profileIndex}
                  total={MOCK_PROFILES.length}
                  swipeDir={swipeDir}
                  onLike={handleLike}
                  onPass={handlePass}
                />
              )}
              {tab === "matches" && (
                <MatchesList matches={matches} onBrowse={() => setTab("browse")} />
              )}
              {tab === "create" && (
                <CreateProfile walletAddress={walletAddress} onSave={() => showToast("✓ Soulbound NFT minted to your wallet")} />
              )}
            </div>
          </>
        )}

        {/* Stake Modal */}
        {stakeModal && (
          <div className="modal-overlay" onClick={() => setStakeModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-title">Stake to Like</div>
              <div className="modal-sub">
                Signal genuine intent with a trustless ETH commitment
              </div>
              <div className="modal-amount-display">
                <div className="modal-eth">{stakeModal.stakeRequired} ETH</div>
                <div className="modal-eth-label">Escrowed on match</div>
              </div>
              <div className="modal-details">
                {[
                  ["Profile", stakeModal.name],
                  ["Soulbound Token", stakeModal.tokenId],
                  ["Stake Amount", `${stakeModal.stakeRequired} ETH`],
                  ["Escrow Contract", "0xSmrt...Ctr3"],
                  ["On Match", "Pooled for date fund"],
                  ["On No Match", "Refunded in 30d"],
                ].map(([l, v]) => (
                  <div className="modal-row" key={l}>
                    <span className="modal-row-label">{l}</span>
                    <span className="modal-row-val">{v}</span>
                  </div>
                ))}
              </div>
              <div className="modal-btns">
                <button className="btn-cancel" onClick={() => setStakeModal(null)}>
                  Cancel
                </button>
                <button
                  className="btn-confirm"
                  onClick={() => confirmStake(stakeModal)}
                >
                  Confirm & Stake
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Match Modal */}
        {matchModal && (
          <div className="match-modal">
            <div className="match-orbs">
              <div className="match-avatar-wrap">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=b6e3f4`} alt="You" />
              </div>
              <div className="match-heart">💫</div>
              <div className="match-avatar-wrap">
                <img src={matchModal.avatar} alt={matchModal.name} />
              </div>
            </div>
            <div className="match-title">It's a <em>Match</em></div>
            <div className="match-sub">
              You and {matchModal.name} have mutually staked. Your ETH has been pooled into a shared escrow for your first date.
            </div>
            <div className="escrow-card">
              <div className="escrow-title">🔐 Shared Escrow Wallet</div>
              <div className="escrow-amount">{matchModal.escrowAmount}</div>
              <div className="escrow-note">
                Held in trustless smart contract — released on mutual agreement
              </div>
              <div className="escrow-addr">{matchModal.escrowAddress}</div>
            </div>
            <button className="btn-close-match" onClick={() => { setMatchModal(null); setTab("matches"); }}>
              View Match
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}

// ─── Landing ─────────────────────────────────────────────────────────────────
function Landing({ onConnect, connecting }) {
  return (
    <div className="landing">
      <div className="landing-orb float">
        <div className="orb-icon">💎</div>
      </div>
      <h1 className="landing-title fade-up">
        Love on the<br /><em>blockchain</em>
      </h1>
      <p className="landing-sub fade-up" style={{ animationDelay: "0.1s" }}>
        Verified identities · Trustless stakes · Transparent hearts
      </p>
      <div className="landing-pills fade-up" style={{ animationDelay: "0.2s" }}>
        {["Soulbound NFT Identity", "ETH Stake Matching", "IPFS Profiles", "Zero-Trust Escrow", "Anti-Abuse Contracts"].map((p) => (
          <div className="pill" key={p}>{p}</div>
        ))}
      </div>
      <button className="btn-connect fade-up" style={{ animationDelay: "0.3s" }} onClick={onConnect} disabled={connecting}>
        {connecting ? "Connecting..." : "Connect Wallet"}
      </button>
      <p className="landing-note fade-up" style={{ animationDelay: "0.4s" }}>
        Compatible with MetaMask · WalletConnect · Coinbase Wallet
      </p>
    </div>
  );
}

// ─── Browse ───────────────────────────────────────────────────────────────────
function Browse({ currentProfile, total, swipeDir, onLike, onPass }) {
  if (!currentProfile) {
    return (
      <div className="browse">
        <div className="empty-state">
          <div className="empty-icon">🌌</div>
          <div className="empty-text">You've seen everyone</div>
          <div className="empty-sub" style={{ color: "var(--text-faint)", fontSize: 12, marginTop: 8 }}>
            New profiles appear as more souls join the network
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="browse">
      <div className="browse-header">
        <div className="browse-title">Discover</div>
        <div className="browse-count">{total} verified profiles</div>
      </div>
      <div
        className={`profile-card ${swipeDir === "left" ? "swiping-left" : swipeDir === "right" ? "swiping-right" : ""}`}
        key={currentProfile.id}
      >
        <div className="card-header">
          <div className="match-score">⚡ {currentProfile.matchScore}% match</div>
          <div className="card-avatar-wrap">
            <img className="card-avatar" src={currentProfile.avatar} alt={currentProfile.name} />
            {currentProfile.verified && <div className="verified-badge">✓</div>}
          </div>
          <div className="card-name-row">
            <div className="card-name">{currentProfile.name}</div>
            <div className="card-age">{currentProfile.age}</div>
          </div>
          <div className="card-token">Soulbound Token {currentProfile.tokenId}</div>
          <div className="card-meta">
            <div className="card-meta-item">📍 {currentProfile.distance}</div>
            <div className="card-meta-item">🔐 Verified Identity</div>
          </div>
        </div>
        <div className="card-body">
          <div className="card-bio">"{currentProfile.bio}"</div>
          <div className="card-interests">
            {currentProfile.interests.map((i) => (
              <div className="interest-tag" key={i}>{i}</div>
            ))}
          </div>
          <div className="card-stake-info">
            <div className="stake-icon">🔷</div>
            <div>
              <div className="stake-label">Required Stake</div>
              <div className="stake-amount">{currentProfile.stakeRequired} ETH</div>
              <div className="stake-note">Escrowed · Refunded if no match in 30 days</div>
            </div>
          </div>
          <div className="card-actions">
            <button className="btn-pass" onClick={() => onPass(currentProfile)}>
              Pass
            </button>
            <button className="btn-like" onClick={() => onLike(currentProfile)}>
              ✦ Like & Stake
            </button>
          </div>
        </div>
        <div className="card-ipfs">
          <div className="ipfs-badge">IPFS ↗</div>
          <div className="ipfs-hash">{currentProfile.ipfsHash}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Matches ──────────────────────────────────────────────────────────────────
function MatchesList({ matches, onBrowse }) {
  if (!matches.length) {
    return (
      <div className="matches-page">
        <div className="empty-state">
          <div className="empty-icon">💫</div>
          <div className="empty-text">No matches yet</div>
          <div className="empty-sub">Start liking profiles to find your connection</div>
          <button className="btn-connect" style={{ marginTop: 24, padding: "12px 32px" }} onClick={onBrowse}>
            Discover Profiles
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="matches-page">
      <div className="section-title">Your Matches</div>
      {matches.map((m, i) => (
        <div className="match-card" key={i}>
          <img className="match-card-avatar" src={m.avatar} alt={m.name} />
          <div className="match-card-info">
            <div className="match-card-name">{m.name}</div>
            <div className="match-card-time">Matched {m.matchedAt}</div>
            <div className="match-card-escrow">
              🔐 Escrow active · {m.escrowAddress}
            </div>
          </div>
          <div className="match-card-right">
            <div className="match-card-eth">{m.escrowAmount}</div>
            <div className="match-card-label">Date Fund</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: "16px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--panel)" }}>
        <div style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          🛡 Security Checks Active
        </div>
        <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
          Rate limiting · Sybil resistance · Stake cooldown · Anti-spam filters running on all interactions
        </div>
      </div>
    </div>
  );
}

// ─── Create Profile ───────────────────────────────────────────────────────────
function CreateProfile({ walletAddress, onSave }) {
  const [form, setForm] = useState({ name: "", age: "", bio: "", interests: "" });
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);

  function handleSubmit() {
    if (!form.name || !form.age) return;
    setMinting(true);
    setTimeout(() => {
      setMinting(false);
      setMinted(true);
      onSave();
    }, 2000);
  }

  return (
    <div className="create-page">
      <div className="section-title">Create Your Profile</div>

      <div className="nft-preview">
        <div className="nft-title">✦ Soulbound NFT Identity</div>
        <div className="nft-text">
          Your profile will be minted as a non-transferable NFT on Ethereum — a permanent, verifiable, unique identity. Stored on IPFS for decentralized access.
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Display Name</label>
        <input className="form-input" placeholder="Your name..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Age</label>
        <input className="form-input" type="number" placeholder="Your age..." value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Bio</label>
        <textarea className="form-input form-textarea" placeholder="Tell your story..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="form-group">
        <label className="form-label">Interests (comma separated)</label>
        <input className="form-input" placeholder="DeFi, Music, Travel..." value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
      </div>

      <div className="security-box">
        <div className="security-title">🛡 Anti-Abuse Protections</div>
        {["One profile per wallet address (Sybil resistant)", "Identity verified via on-chain proof", "Rate limiting: max 10 likes per 24h", "Stake cooldown prevents spam interactions", "IPFS pinning ensures data permanence"].map((item) => (
          <div className="security-item" key={item}>
            <span style={{ color: "var(--success)" }}>✓</span> {item}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 16, fontFamily: "DM Mono" }}>
        Wallet: {walletAddress}
      </div>

      {minted ? (
        <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--success)", background: "rgba(90,248,160,0.05)", textAlign: "center" }}>
          <div style={{ color: "var(--success)", fontSize: 20, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 13, color: "var(--success)" }}>Soulbound NFT Minted Successfully</div>
          <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 4 }}>Profile uploaded to IPFS · On-chain identity confirmed</div>
        </div>
      ) : (
        <button className="btn-submit" onClick={handleSubmit} disabled={minting}>
          {minting ? "Minting to Ethereum..." : "Mint Soulbound Profile"}
        </button>
      )}
    </div>
  );
}
