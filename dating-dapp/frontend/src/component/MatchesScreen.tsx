import { useMemo, useState } from "react";
import type { ChatMessage, Match } from "../types";

type MatchesScreenProps = {
  matches: Match[];
  threads: Record<string, ChatMessage[]>;
  activeId: string;
  onSelect: (id: string) => void;
  onSend: (matchId: string, text: string) => void;
};

export default function MatchesScreen({
  matches,
  threads,
  activeId,
  onSelect,
  onSend
}: MatchesScreenProps) {
  const [draft, setDraft] = useState("");

  const activeMatch = useMemo(
    () => matches.find((match) => match.id === activeId) ?? matches[0],
    [activeId, matches]
  );

  const messages = activeMatch ? threads[activeMatch.id] ?? [] : [];

  const handleSend = () => {
    if (!activeMatch || !draft.trim()) return;
    onSend(activeMatch.id, draft.trim());
    setDraft("");
  };

  return (
    <section className="panel chat-shell">
      <div className="panel-head">
        <div>
          <h2>Your Matches</h2>
          <p>{matches.length} souls connected</p>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="match-rail">
          <div className="rail-title">Active Connections</div>
          {matches.map((match) => (
            <button
              key={match.id}
              className={match.id === activeId ? "rail-item active" : "rail-item"}
              onClick={() => onSelect(match.id)}
            >
              <span className="match-avatar">
                {match.profile.photo ? (
                  <img src={match.profile.photo} alt={match.profile.name} />
                ) : (
                  match.profile.avatar
                )}
              </span>
              <span className="rail-details">
                <span className="match-name">{match.profile.name}</span>
                <span className="match-meta">{match.messages} messages</span>
              </span>
              <span className="rail-pill">{match.pooledEth} ETH</span>
            </button>
          ))}
        </aside>

        <div className="chat-panel">
          {activeMatch ? (
            <>
              <div className="chat-header">
                <div>
                  <div className="match-name">{activeMatch.profile.name}</div>
                  <div className="match-meta">
                    Matched {activeMatch.matchedAt} · {activeMatch.status}
                  </div>
                </div>
                <div className="chat-pill">Pool {activeMatch.pooledEth} ETH</div>
              </div>

              <div className="chat-body">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={msg.from === "me" ? "bubble-row me" : "bubble-row"}
                  >
                    <div className={msg.from === "me" ? "bubble bubble-me" : "bubble"}>
                      {msg.media && (
                        <div className="bubble-media">
                          <div className="media-thumb" />
                          <div>
                            <div className="media-title">{msg.media.title}</div>
                            <div className="media-sub">{msg.media.subtitle}</div>
                          </div>
                        </div>
                      )}
                      <p>{msg.text}</p>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Write a message"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button className="primary" onClick={handleSend}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="empty">
              <p className="empty-title">No matches yet</p>
              <p className="empty-sub">Stake to like profiles and start the conversation.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
