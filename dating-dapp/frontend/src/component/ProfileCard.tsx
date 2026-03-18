import type { Profile } from "../types";

type ProfileCardProps = {
  profile: Profile;
  onLike: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
};

export default function ProfileCard({ profile, onLike, onPass }: ProfileCardProps) {
  return (
    <article className="profile-card">
      <div className="profile-head">
        <div className="avatar">
          {profile.photo ? (
            <img src={profile.photo} alt={profile.name} />
          ) : (
            profile.avatar
          )}
          {profile.online && <span className="status" />}
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {profile.name}, {profile.age}
          </div>
          <div className="profile-meta">
            <span>{profile.distance}</span>
            <span className="dot" />
            <span>{profile.compatibility}% match</span>
          </div>
        </div>
        {profile.verified && <span className="badge">Verified</span>}
      </div>

      <p className="profile-bio">"{profile.bio}"</p>

      <div className="tag-row">
        {profile.interests.map((interest) => (
          <span className="tag" key={interest}>
            {interest}
          </span>
        ))}
      </div>

      <div className="stake-row">
        <div>
          <span className="label">Stake to like</span>
          <span className="value">{profile.stakeRequired} ETH</span>
        </div>
        <div className="ipfs">IPFS: {profile.ipfsHash.slice(0, 10)}...</div>
      </div>

      <div className="card-actions">
        <button className="outline" onClick={() => onPass(profile)}>
          Pass
        </button>
        <button className="primary" onClick={() => onLike(profile)}>
          Stake & Like
        </button>
      </div>
    </article>
  );
}
