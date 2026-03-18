import { useState } from "react";
import { storeProfile } from "../utils/ipfs";
import type { Profile } from "../types";

const INTEREST_OPTIONS = [
  "DeFi",
  "NFTs",
  "Web3",
  "Cooking",
  "Music",
  "Art",
  "Hiking",
  "Philosophy",
  "Gaming",
  "Travel",
  "Yoga",
  "Coffee",
  "Books",
  "Film",
  "Fitness"
];

type ProfileSetupProps = {
  wallet: string;
  onComplete: (profile: Profile) => void;
};

type DraftProfile = {
  name: string;
  age: string;
  bio: string;
  interests: string[];
  photo?: string;
};

const MIN_AGE = 18;

export default function ProfileSetup({ wallet, onComplete }: ProfileSetupProps) {
  const [step, setStep] = useState(0);
  const [minting, setMinting] = useState(false);
  const [form, setForm] = useState<DraftProfile>({
    name: "",
    age: "",
    bio: "",
    interests: []
  });

  const ageValue = Number(form.age);
  const ageInvalid = !Number.isFinite(ageValue) || ageValue < MIN_AGE;
  const canContinue = form.name.trim().length > 0 && !ageInvalid;

  const toggleInterest = (interest: string) => {
    setForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handlePhotoChange = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, photo: url }));
  };

  const handleMint = async () => {
    if (!canContinue) return;
    setMinting(true);
    await storeProfile({ ...form, wallet });
    setTimeout(() => {
      onComplete({
        id: wallet,
        tokenId: `#${Math.floor(1000 + Math.random() * 9000)}`,
        name: form.name,
        age: form.age,
        bio: form.bio,
        interests: form.interests,
        stakeRequired: "0.01",
        verified: true,
        avatar: form.name.slice(0, 2).toUpperCase() || "??",
        compatibility: 90,
        distance: "0.6 km",
        ipfsHash: "QmTempProfile",
        online: true,
        photo: form.photo
      });
    }, 1500);
  };

  return (
    <div className="center">
      <div className="card form reveal">
        <div className="progress">
          {[0, 1, 2].map((i) => (
            <div key={i} className={i <= step ? "bar active" : "bar"} />
          ))}
        </div>

        {step === 0 && (
          <div className="form-step step-animate">
            <h2>Who are you?</h2>
            <p>This becomes your soulbound identity.</p>

            <div className="subsection">
              <div className="sub-title">Basics</div>
              <div className="sub-body">Tell us how you want to appear on-chain.</div>
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </label>
              <label>
                Age
                <input
                  type="number"
                  min={MIN_AGE}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Your age"
                />
                <span className={ageInvalid ? "helper error" : "helper"}>
                  You must be {MIN_AGE}+ to continue.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="form-step step-animate">
            <h2>Your story</h2>
            <p>Short bio and interests stored on IPFS.</p>

            <div className="subsection">
              <div className="sub-title">Bio</div>
              <div className="sub-body">Share a few lines that feel like you.</div>
              <label>
                Bio
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="A sentence about you"
                />
              </label>
            </div>

            <div className="subsection">
              <div className="sub-title">Interests</div>
              <div className="sub-body">Pick a few to anchor your vibe.</div>
              <div className="chip-grid">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = form.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      className={active ? "chip active" : "chip"}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="subsection">
              <div className="sub-title">Photo</div>
              <div className="sub-body">Select a picture to show on your profile.</div>
              <label className="file-input">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                />
                <span>{form.photo ? "Change photo" : "Choose a photo"}</span>
              </label>
              {form.photo && (
                <div className="photo-preview">
                  <img src={form.photo} alt="Selected profile" />
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step step-animate">
            <h2>Mint your soul</h2>
            <p>Preview your on-chain card before minting.</p>

            <div className="subsection">
              <div className="sub-title">Identity</div>
              <div className="sub-body">Confirm the details we will mint.</div>
              <div className="preview">
                <div className="preview-avatar">
                  {form.photo ? (
                    <img src={form.photo} alt="Profile" />
                  ) : (
                    (form.name || "??").slice(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="preview-name">
                    {form.name || "Your name"}, {form.age || "--"}
                  </div>
                  <div className="preview-wallet">{wallet}</div>
                </div>
              </div>
              <p className="preview-bio">"{form.bio || "No bio yet"}"</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 0 && (
            <button className="ghost" type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          {step < 2 ? (
            <button
              className="primary"
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 0 && !canContinue}
            >
              Continue
            </button>
          ) : (
            <button className="primary" type="button" onClick={handleMint} disabled={minting}>
              {minting ? "Minting..." : "Mint Soulbound NFT"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
