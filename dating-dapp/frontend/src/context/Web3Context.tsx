import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type ConnectStep = () => void;

type Web3State = {
  wallet: string | null;
  connecting: boolean;
  connectWallet: (onStep?: ConnectStep) => Promise<void>;
  disconnect: () => void;
};

const Web3Context = createContext<Web3State | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async (onStep?: ConnectStep) => {
    setConnecting(true);
    for (let i = 0; i < 3; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 450));
      onStep?.();
    }
    setTimeout(() => {
      setWallet("0x71C4...93Fa");
      setConnecting(false);
      onStep?.();
    }, 300);
  };

  const disconnect = () => setWallet(null);

  const value = useMemo(
    () => ({ wallet, connecting, connectWallet, disconnect }),
    [wallet, connecting]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
}
