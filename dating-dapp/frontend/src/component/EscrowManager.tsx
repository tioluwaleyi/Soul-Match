import type { EscrowEvent, Match } from "../types";

type EscrowManagerProps = {
  matches: Match[];
  events: EscrowEvent[];
  onPropose: (matchId: string) => void;
  onRelease: (matchId: string) => void;
};

export default function EscrowManager({ matches, events, onPropose, onRelease }: EscrowManagerProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <h2>Date Escrow</h2>
          <p>Plan and lock funds for your next date.</p>
        </div>
      </div>
      <div className="escrow-grid">
        {matches.map((match) => (
          <div key={match.id} className="escrow-card">
            <div className="escrow-header">
              <div className="match-avatar">
                {match.profile.photo ? (
                  <img src={match.profile.photo} alt={match.profile.name} />
                ) : (
                  match.profile.avatar
                )}
              </div>
              <div>
                <div className="match-name">{match.profile.name}</div>
                <div className="match-meta">Pool: {match.pooledEth} ETH</div>
              </div>
            </div>
            <div className="escrow-actions">
              <button className="outline" onClick={() => onPropose(match.id)}>
                Propose date
              </button>
              <button className="primary" onClick={() => onRelease(match.id)}>
                Release funds
              </button>
            </div>
            <div className="escrow-foot">
              Status: <strong>{match.status}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="escrow-log">
        <h3>Escrow Activity</h3>
        <div className="log-list">
          {events.length === 0 ? (
            <div className="empty">
              <p className="empty-title">No escrow activity yet</p>
              <p className="empty-sub">Create a date plan to see on-chain events.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="log-item">
                <span className="log-action">{event.action}</span>
                <span className="log-time">{event.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
