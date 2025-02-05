export type MatchType = "SH1" | "SH2" | "SD1" | "SD2" | "DH1" | "DD1" | "DX1" | "DX2";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  isFemale: boolean;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
}

export interface OptimizedMatch {
  type: MatchType;
  players: Player[];
  allowedPlayers: Omit<Player, "id" | "name">[];
  hasConflict: boolean;
  conflictReason?: string;
  startTime?: number;
  court?: number;
}

export interface Rotation {
  matches: OptimizedMatch[];
  startTimes: Date[];
}
