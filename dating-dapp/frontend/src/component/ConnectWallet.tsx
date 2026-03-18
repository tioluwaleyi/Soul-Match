import { useState } from "react";
import { useWeb3 } from "../context/Web3Context";

export default function ConnectWallet() {
  const { connectWallet, connecting } = useWeb3();
  const [step, setStep] = useState(0);
  const steps = ["Detecting wallet", "Requesting access", "Verifying", "Connected"];

  const handleConnect = async () => {
    setStep(0);
    await connectWallet(() => setStep((s) => Math.min(s + 1, steps.length - 1)));
  };

  return (
    <div className="center hero-stage">
      <div className="hero-orbit" aria-hidden="true" />
      <div className="hero-orbit orbit-two" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="card hero reveal">
        <div className="hero-header">
          <p className="hero-eyebrow">Soulbound Identity</p>
          <h1>Mint your on-chain profile</h1>
          <p className="hero-sub">
            Connect a wallet to create your soulbound profile and unlock verified, trust-first dating.
          </p>
        </div>
        <div className="hero-steps">
          {steps.map((label, index) => (
            <div key={label} className={index <= step ? "step active" : "step"}>
              <span>{index + 1}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <button className="primary" onClick={handleConnect} disabled={connecting}>
          {connecting ? "Connecting..." : "Connect MetaMask"}
        </button>
        <p className="fineprint">WalletConnect and Coinbase Wallet supported</p>
      </div>
    </div>
  );
}
