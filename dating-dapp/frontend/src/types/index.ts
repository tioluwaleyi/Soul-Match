export type Profile = {
  id: string;
  tokenId: string;
  name: string;
  age: number | string;
  bio: string;
  interests: string[];
  stakeRequired: string;
  verified: boolean;
  avatar: string;
  compatibility: number;
  distance: string;
  ipfsHash: string;
  online: boolean;
  photo?: string;
};

export type Match = {
  id: string;
  profile: Profile;
  matchedAt: string;
  pooledEth: string;
  status: string;
  messages: number;
};

export type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  media?: {
    title: string;
    subtitle: string;
  };
};

export type EscrowEvent = {
  id: string;
  matchId: string;
  action: string;
  timestamp: string;
};
