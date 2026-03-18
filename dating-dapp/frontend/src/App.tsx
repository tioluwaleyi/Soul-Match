import { useMemo, useState } from "react";
import ConnectWallet from "./component/ConnectWallet";
import ProfileSetup from "./component/ProfileSetup";
import ProfileCard from "./component/ProfileCard";
import MatchesScreen from "./component/MatchesScreen";
import EscrowManager from "./component/EscrowManager";
import ParticleField from "./component/ParticleField";
import { useWeb3 } from "./context/Web3Context";
import type { ChatMessage, EscrowEvent, Match, Profile } from "./types";

const MOCK_PROFILES: Profile[] = [
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
    compatibility: 94,
    distance: "2.4 km",
    ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
    online: true,
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "0xC3d4",
    tokenId: "#0087",
    name: "Marcus Wei",
    age: 29,
    bio: "Building zero-knowledge proofs and organic gardens. Duality is the key to existence.",
    interests: ["ZK Proofs", "Permaculture", "Cooking", "Philosophy"],
    stakeRequired: "0.015",
    verified: true,
    avatar: "MW",
    compatibility: 88,
    distance: "4.1 km",
    ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    online: true,
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
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
    compatibility: 91,
    distance: "1.7 km",
    ipfsHash: "QmZfmRZHuawJDtgfHh1GhqzKjvDZDiPVxNMRZr5ZoXgEzU",
    online: false,
    photo: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=400&q=80"
  }
];

const INITIAL_MATCHES: Match[] = [
  {
    id: "match-001",
    profile: MOCK_PROFILES[0],
    matchedAt: "2h ago",
    pooledEth: "0.02",
    status: "active",
    messages: 3
  }
];

const INITIAL_THREADS: Record<string, ChatMessage[]> = {
  "match-001": [
    {
      id: "match-001-1",
      from: "them",
      text: "Hey, that escrow idea was genius.",
      time: "09:18"
    },
    {
      id: "match-001-2",
      from: "me",
      text: "Glad you liked it. Coffee this weekend?",
      time: "09:21"
    },
    {
      id: "match-001-3",
      from: "them",
      text: "I saved a spot that feels like an on-chain speakeasy.",
      time: "09:25",
      media: {
        title: "Orbit Cafe",
        subtitle: "Art deco · 1.2 km"
      }
    }
  ]
};

const INITIAL_EVENTS: EscrowEvent[] = [
  {
    id: "event-1",
    matchId: "match-001",
    action: "Escrow created · 0.02 ETH locked",
    timestamp: "Today, 09:05"
  }
];

const nowTime = () =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());

export default function App() {
  const { wallet } = useWeb3();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState("discover");
  const [profiles] = useState<Profile[]>(MOCK_PROFILES);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(INITIAL_THREADS);
  const [activeMatchId, setActiveMatchId] = useState<string>(INITIAL_MATCHES[0]?.id ?? "");
  const [events, setEvents] = useState<EscrowEvent[]>(INITIAL_EVENTS);

  const availableProfiles = useMemo(
    () => profiles.filter((p) => !likedIds.has(p.id) && !passedIds.has(p.id)),
    [profiles, likedIds, passedIds]
  );

  const handleLike = (p: Profile) => {
    setLikedIds((s) => new Set([...s, p.id]));
    if (matches.length === INITIAL_MATCHES.length) {
      const newMatch: Match = {
        id: `match-${Date.now()}`,
        profile: p,
        matchedAt: "just now",
        pooledEth: (parseFloat(p.stakeRequired) * 2).toFixed(3),
        status: "active",
        messages: 1
      };
      setMatches((m) => [...m, newMatch]);
      setThreads((prev) => ({
        ...prev,
        [newMatch.id]: [
          {
            id: `${newMatch.id}-welcome`,
            from: "them",
            text: "Hey, just matched. Want to plan something?",
            time: nowTime()
          }
        ]
      }));
      setActiveMatchId(newMatch.id);
    }
  };

  const handlePass = (p: Profile) => {
    setPassedIds((s) => new Set([...s, p.id]));
  };

  const handleSendMessage = (matchId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `${matchId}-${Date.now()}`,
      from: "me",
      text,
      time: nowTime()
    };
    setThreads((prev) => {
      const updated = [...(prev[matchId] ?? []), newMessage];
      setMatches((matchPrev) =>
        matchPrev.map((match) =>
          match.id === matchId
            ? {
                ...match,
                messages: updated.length
              }
            : match
        )
      );
      return { ...prev, [matchId]: updated };
    });
  };

  const pushEvent = (matchId: string, action: string) => {
    setEvents((prev) => [
      {
        id: `event-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        matchId,
        action,
        timestamp: `Today, ${nowTime()}`
      },
      ...prev
    ]);
  };

  const handlePropose = (matchId: string) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? {
              ...match,
              status: match.status === "released" ? "released" : "proposed"
            }
          : match
      )
    );
    pushEvent(matchId, "Date proposal submitted");
  };

  const handleRelease = (matchId: string) => {
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId
          ? {
              ...match,
              status: "released"
            }
          : match
      )
    );
    pushEvent(matchId, "Escrow released to both parties");
  };

  return (
    <div className="app">
      <ParticleField />
      {!wallet ? (
        <ConnectWallet />
      ) : !profile ? (
        <ProfileSetup wallet={wallet} onComplete={setProfile} />
      ) : (
        <div className="shell">
          <header className="topbar">
            <div className="brand">
              <span className="brand-mark">SoulMatch</span>
              <span className="brand-sub">Decentralized dating</span>
            </div>
            <div className="wallet-pill">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
          </header>

          <main className="content">
            {tab === "discover" && (
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Discover Souls</h2>
                    <p>{availableProfiles.length} verified profiles nearby</p>
                  </div>
                  <div className="panel-actions">
                    <button className="ghost">Filter</button>
                    <button className="ghost">Sort</button>
                  </div>
                </div>
                <div className="card-stack">
                  {availableProfiles.length === 0 ? (
                    <div className="empty">
                      <p className="empty-title">You have seen everyone nearby</p>
                      <p className="empty-sub">Expand your radius or check back later.</p>
                    </div>
                  ) : (
                    availableProfiles.map((p) => (
                      <ProfileCard
                        key={p.id}
                        profile={p}
                        onLike={handleLike}
                        onPass={handlePass}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            {tab === "matches" && (
              <MatchesScreen
                matches={matches}
                threads={threads}
                activeId={activeMatchId}
                onSelect={setActiveMatchId}
                onSend={handleSendMessage}
              />
            )}

            {tab === "escrow" && (
              <EscrowManager
                matches={matches}
                events={events}
                onPropose={handlePropose}
                onRelease={handleRelease}
              />
            )}

            {tab === "profile" && profile && (
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2>Your Soul</h2>
                    <p>On-chain identity and activity</p>
                  </div>
                </div>
                <div className="profile-panel">
                  <div className="profile-header">
                    <div className="avatar-large">{profile.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <div className="profile-name">
                        {profile.name}, {profile.age}
                      </div>
                      <div className="profile-tag">Soulbound {profile.tokenId}</div>
                    </div>
                  </div>
                  <p className="profile-bio">"{profile.bio}"</p>
                  <div className="tag-row">
                    {profile.interests.map((i) => (
                      <span className="tag" key={i}>
                        {i}
                      </span>
                    ))}
                  </div>
                  <div className="metrics">
                    <div>
                      <div className="metric-value">{likedIds.size}</div>
                      <div className="metric-label">Likes</div>
                    </div>
                    <div>
                      <div className="metric-value">{matches.length}</div>
                      <div className="metric-label">Matches</div>
                    </div>
                    <div>
                      <div className="metric-value">{(likedIds.size * 0.01).toFixed(3)}</div>
                      <div className="metric-label">ETH staked</div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>

          <nav className="bottom-nav">
            {[
              ["discover", "Discover"],
              ["matches", "Matches"],
              ["escrow", "Escrow"],
              ["profile", "Profile"]
            ].map(([id, label]) => (
              <button
                key={id}
                className={tab === id ? "nav-item active" : "nav-item"}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
